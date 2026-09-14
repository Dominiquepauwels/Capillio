// ---------------------------------------------------------------------------
// WhatsApp simulation layer.
// No real WhatsApp Business API wired up yet — this engine decides WHEN a
// message should go out (1h before appointment, or after a completed visit)
// and queues it. Sending is a manual "Send" click for now; swap `sendMessage`
// for a real API call (e.g. Twilio / Meta Cloud API) later without touching
// the scheduling logic.
// ---------------------------------------------------------------------------

const REMINDER_LEAD_MIN = 60;        // send reminder ~1h before appointment
const DAY_BEFORE_LEAD_MIN = 24 * 60; // send a separate reschedule-friendly reminder ~24h before
const REVIEW_DELAY_MIN = 60;         // ask for a review ~1h after visit ends
const WINBACK_INACTIVE_DAYS = 60;    // nudge clients who haven't been back in this long

function buildMessageBody(state, type, appt, extraVars) {
  const client = getClient(state, appt.clientId);
  const barber = getBarber(state, appt.barberId);
  const service = getService(state, appt.serviceId);
  const tpl = state.templates[type];
  return fillTemplate(tpl, {
    clientName: client ? client.name.split(' ')[0] : 'there',
    barberName: barber ? barber.name.split(' ')[0] : '',
    service: service ? service.name : 'appointment',
    time: fmtTime(appt.start),
    date: fmtDateShort(appt.start),
    shopName: state.shopName || 'Fade & Faro',
    reviewLink: 'fadeandfaro.com/review',
    accountLink: 'fadeandfaro.com/account',
    rescheduleLink: `fadeandfaro.com/reschedule/${appt.id.slice(-6)}`,
    bookLink: 'fadeandfaro.com/book',
    ...extraVars,
  });
}

// Referrer-facing reward message — not tied to a single appointment's
// template vars, so it's built directly instead of via buildMessageBody.
function queueReferralRewardMessage(state, referrer, referee) {
  const body = fillTemplate(state.templates.referralReward, {
    clientName: referrer.name.split(' ')[0],
    refereeName: referee.name.split(' ')[0],
    shopName: state.shopName || 'Fade & Faro',
    amount: REFERRAL_REWARD_AMOUNT,
  });
  const msg = {
    id: uid('m'),
    type: 'referralReward',
    appointmentId: null,
    clientId: referrer.id,
    barberId: null,
    direction: 'out',
    status: 'pending',
    body,
    scheduledFor: new Date().toISOString(),
    sentAt: null,
  };
  Store.set(s => ({ ...s, messages: [...s.messages, msg] }));
  pushWhatsAppToast({ title: `WhatsApp · ${state.shopName || 'Fade & Faro'}`, subtitle: `Sent to ${referrer.phone}`, body });
  return msg;
}

// Scans appointments and enqueues any reminder/review messages that have
// become due. Idempotent — safe to call on every tick.
function runMessageEngine() {
  topUpRecurringBookings(Store.get());
  const state = Store.get();
  const now = new Date();
  const newMessages = [];
  const apptPatches = [];
  const clientPatches = [];

  state.appointments.forEach(appt => {
    // Day-before message fires first (while there's still time to reschedule);
    // the >REMINDER_LEAD_MIN guard keeps its window from overlapping the
    // hour-before reminder below.
    if (appt.status === 'upcoming' && !appt.dayBeforeSent) {
      const minsUntil = minutesBetween(appt.start, now);
      if (minsUntil <= DAY_BEFORE_LEAD_MIN && minsUntil > REMINDER_LEAD_MIN) {
        newMessages.push({
          id: uid('m'),
          type: 'dayBefore',
          appointmentId: appt.id,
          clientId: appt.clientId,
          barberId: appt.barberId,
          direction: 'out',
          status: 'pending',
          body: buildMessageBody(state, 'dayBefore', appt),
          scheduledFor: now.toISOString(),
          sentAt: null,
        });
        apptPatches.push([appt.id, { dayBeforeSent: true }]);
      }
    }
    if (appt.status === 'upcoming' && !appt.reminderSent) {
      const minsUntil = minutesBetween(appt.start, now);
      if (minsUntil <= REMINDER_LEAD_MIN && minsUntil > -30) {
        newMessages.push({
          id: uid('m'),
          type: 'reminder',
          appointmentId: appt.id,
          clientId: appt.clientId,
          barberId: appt.barberId,
          direction: 'out',
          status: 'pending',
          body: buildMessageBody(state, 'reminder', appt),
          scheduledFor: now.toISOString(),
          sentAt: null,
        });
        apptPatches.push([appt.id, { reminderSent: true }]);
      }
    }
    if (appt.status === 'completed' && !appt.reviewRequested) {
      const end = addMinutes(new Date(appt.start), appt.duration || 30);
      const minsSince = minutesBetween(now, end);
      if (minsSince >= REVIEW_DELAY_MIN) {
        newMessages.push({
          id: uid('m'),
          type: 'review',
          appointmentId: appt.id,
          clientId: appt.clientId,
          barberId: appt.barberId,
          direction: 'out',
          status: 'pending',
          body: buildMessageBody(state, 'review', appt),
          scheduledFor: now.toISOString(),
          sentAt: null,
        });
        apptPatches.push([appt.id, { reviewRequested: true }]);
      }
    }
  });

  // --- weekly-regular detection: nudge accountless clients to sign up ---
  const weeklyRegulars = detectWeeklyRegulars(state).map(clientId => ({ clientId, client: getClient(state, clientId) }));
  weeklyRegulars.forEach(({ clientId, client }) => {
    const lastAppt = state.appointments
      .filter(a => a.clientId === clientId)
      .sort((a, b) => new Date(b.start) - new Date(a.start))[0];
    newMessages.push({
      id: uid('m'),
      type: 'accountNudge',
      appointmentId: lastAppt.id,
      clientId,
      barberId: lastAppt.barberId,
      direction: 'out',
      status: 'pending',
      body: buildMessageBody(state, 'accountNudge', lastAppt),
      scheduledFor: now.toISOString(),
      sentAt: null,
    });
    clientPatches.push([clientId, { accountNudgeSent: true }]);
  });

  // --- win-back: clients inactive 60+ days with no upcoming appointment ---
  const winbackTargets = [];
  state.clients.forEach(client => {
    if (client.winbackSent) return;
    const hasUpcoming = state.appointments.some(a => a.clientId === client.id && a.status === 'upcoming');
    if (hasUpcoming) return;
    const visits = state.appointments.filter(a => a.clientId === client.id && a.status === 'completed');
    if (!visits.length) return;
    const lastVisit = visits.sort((a, b) => new Date(b.start) - new Date(a.start))[0];
    const daysSince = Math.floor(minutesBetween(now, lastVisit.start) / 1440);
    if (daysSince < WINBACK_INACTIVE_DAYS) return;
    newMessages.push({
      id: uid('m'),
      type: 'winback',
      appointmentId: lastVisit.id,
      clientId: client.id,
      barberId: lastVisit.barberId,
      direction: 'out',
      status: 'pending',
      body: buildMessageBody(state, 'winback', lastVisit, { days: daysSince }),
      scheduledFor: now.toISOString(),
      sentAt: null,
    });
    winbackTargets.push({ clientId: client.id, client });
    clientPatches.push([client.id, { winbackSent: true }]);
  });

  if (newMessages.length) {
    Store.set(s => {
      let appts = s.appointments;
      apptPatches.forEach(([id, patch]) => {
        appts = appts.map(a => a.id === id ? { ...a, ...patch } : a);
      });
      let clients = s.clients;
      clientPatches.forEach(([id, patch]) => {
        clients = clients.map(c => c.id === id ? { ...c, ...patch } : c);
      });
      return { ...s, appointments: appts, clients, messages: [...s.messages, ...newMessages] };
    });
    newMessages.filter(m => m.type === 'accountNudge').forEach(m => {
      const c = weeklyRegulars.find(w => w.clientId === m.clientId)?.client;
      if (c) pushWhatsAppToast({ title: `WhatsApp · ${state.shopName || 'Fade & Faro'}`, subtitle: `Sent to ${c.phone}`, body: m.body });
    });
    newMessages.filter(m => m.type === 'winback').forEach(m => {
      const c = winbackTargets.find(w => w.clientId === m.clientId)?.client;
      if (c) pushWhatsAppToast({ title: `WhatsApp · ${state.shopName || 'Fade & Faro'}`, subtitle: `Sent to ${c.phone}`, body: m.body });
    });
  }
}

// Manual queue for a freshly created recurring booking — separate from
// queueMessageNow since it isn't tied to a single appointment's template vars.
function queueRecurringConfirmation(state, recurring, firstAppt, occurrenceCount) {
  const client = getClient(state, recurring.clientId);
  const barber = getBarber(state, recurring.barberId);
  const service = getService(state, recurring.serviceId);
  const cadence = recurring.frequency === 'weekly' ? 'week' : recurring.frequency === 'biweekly' ? 'other week' : '4 weeks';
  const weekday = new Date(firstAppt.start).toLocaleDateString([], { weekday: 'long' });
  const body = `Hi ${client.name.split(' ')[0]}! 🔒 You're locked in for a ${service.name} with ${barber.name.split(' ')[0]} every ${cadence} on ${weekday}s at ${fmtTime(firstAppt.start)}. We've booked your next ${occurrenceCount} visits and will remind you before each one!`;
  const msg = {
    id: uid('m'),
    type: 'recurringConfirmation',
    appointmentId: firstAppt.id,
    clientId: recurring.clientId,
    barberId: recurring.barberId,
    direction: 'out',
    status: 'pending',
    body,
    scheduledFor: new Date().toISOString(),
    sentAt: null,
  };
  Store.set(s => ({ ...s, messages: [...s.messages, msg] }));
  pushWhatsAppToast({ title: `WhatsApp · ${state.shopName || 'Fade & Faro'}`, subtitle: `Sent to ${client.phone}`, body });
  return msg;
}

// Manual trigger — used by "Send reminder now" / "Request review now" buttons
// so staff can override the schedule.
function queueMessageNow(type, appt) {
  const state = Store.get();
  const msg = {
    id: uid('m'),
    type,
    appointmentId: appt.id,
    clientId: appt.clientId,
    barberId: appt.barberId,
    direction: 'out',
    status: 'pending',
    body: buildMessageBody(state, type, appt),
    scheduledFor: new Date().toISOString(),
    sentAt: null,
  };
  const flagPatch = type === 'reminder' ? { reminderSent: true } : type === 'review' ? { reviewRequested: true } : {};
  Store.set(s => ({
    ...s,
    messages: [...s.messages, msg],
    appointments: s.appointments.map(a => a.id === appt.id ? { ...a, ...flagPatch } : a),
  }));
  return msg;
}

// ---- two-way messaging: a simple reply thread per client -------------------
// Outbound reply typed by staff — appears as a 'sent' bubble on the right and
// actually goes out over SMS via sendMessage() below once Twilio is connected.
async function sendReply(clientId, barberId, body) {
  const state = Store.get();
  const client = getClient(state, clientId);
  const msg = {
    id: uid('m'), type: 'reply', appointmentId: null, clientId, barberId: barberId || null,
    direction: 'out', status: 'pending', body, scheduledFor: new Date().toISOString(), sentAt: null,
  };
  Store.set(s => ({ ...s, messages: [...s.messages, msg] }));
  if (client) pushWhatsAppToast({ title: `WhatsApp · ${state.shopName || 'Fade & Faro'}`, subtitle: `Sent to ${client.phone}`, body });
  if (SUPABASE_CONFIGURED) await syncCollection(Store.shopId, 'messages', state.messages, [...state.messages, msg]);
  sendMessage(msg.id);
  return msg;
}
// Simulates a client's reply coming in — there's no real WhatsApp connection
// yet, so this stands in for the webhook that would deliver it.
function simulateIncomingReply(clientId, barberId, body) {
  const state = Store.get();
  const client = getClient(state, clientId);
  const msg = {
    id: uid('m'), type: 'reply', appointmentId: null, clientId, barberId: barberId || null,
    direction: 'in', status: 'received', body, scheduledFor: new Date().toISOString(), sentAt: new Date().toISOString(),
  };
  Store.set(s => ({ ...s, messages: [...s.messages, msg] }));
  if (client) pushWhatsAppToast({ title: `WhatsApp · ${client.name}`, subtitle: 'New reply', body });
  return msg;
}

// ---- agency-wide broadcast ---------------------------------------------------
// Sends the same message to every client of a shop. Writes straight to that
// shop's localStorage slot (and syncs the live Store if it's the active shop)
// since the agency console can broadcast to shops that aren't currently loaded.
function queueBroadcastToShop(shopId, body) {
  const isActive = Store.shopId === shopId;
  const state = isActive ? Store.get() : loadState(shopId);
  const now = new Date().toISOString();
  const newMessages = state.clients.map(client => ({
    id: uid('m'), type: 'broadcast', appointmentId: null, clientId: client.id, barberId: null,
    direction: 'out', status: 'pending', body, scheduledFor: now, sentAt: null,
  }));
  const nextState = { ...state, messages: [...state.messages, ...newMessages] };
  if (isActive) {
    Store.set(() => nextState);
  } else {
    try { localStorage.setItem(shopStorageKey(shopId), JSON.stringify(nextState)); } catch (e) {}
  }
  return newMessages.length;
}
function broadcastToAllShops(agencyState, body) {
  return agencyState.shops.reduce((total, shop) => total + queueBroadcastToShop(shop.id, body), 0);
}

// Actually sends a queued message via Twilio SMS, through the /api/send-sms
// serverless function (never calls Twilio directly from the browser — that
// would mean shipping the Twilio Auth Token to every visitor). Falls back to
// the old instant-flip simulation when Supabase/Twilio aren't connected yet,
// so the demo keeps working out of the box.
async function sendMessage(messageId) {
  if (!SUPABASE_CONFIGURED) {
    Store.set(s => ({ ...s, messages: s.messages.map(m => m.id === messageId ? { ...m, status: 'sent', sentAt: new Date().toISOString() } : m) }));
    return;
  }
  try {
    const res = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn('SMS send failed:', result.error);
      Store.set(s => ({ ...s, messages: s.messages.map(m => m.id === messageId ? { ...m, status: 'failed' } : m) }));
      return;
    }
    // The serverless function already marked the row 'sent' in Supabase
    // (Realtime will confirm it); reflect it locally right away too.
    Store.set(s => ({ ...s, messages: s.messages.map(m => m.id === messageId ? { ...m, status: 'sent', sentAt: new Date().toISOString() } : m) }));
  } catch (e) {
    console.warn('SMS send failed:', e);
    Store.set(s => ({ ...s, messages: s.messages.map(m => m.id === messageId ? { ...m, status: 'failed' } : m) }));
  }
}

function deleteMessage(messageId) {
  Store.set(s => ({ ...s, messages: s.messages.filter(m => m.id !== messageId) }));
}

function useMessageEngine() {
  React.useEffect(() => {
    runMessageEngine();
    const t = setInterval(runMessageEngine, 15000);
    return () => clearInterval(t);
  }, []);
}

// ---- background notification toasts ----------------------------------------
// Surfaces proof that "something happened in the background" (e.g. right
// after a client books, or when the engine auto-queues a reminder) without
// requiring a real WhatsApp connection.
const ToastStore = {
  list: [],
  listeners: new Set(),
  push(toast) {
    const item = { id: uid('t'), duration: 6000, ...toast };
    this.list = [...this.list, item];
    this.emit();
    setTimeout(() => this.remove(item.id), item.duration);
    return item;
  },
  remove(id) { this.list = this.list.filter(t => t.id !== id); this.emit(); },
  emit() { this.listeners.forEach(fn => fn(this.list)); },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
};

function pushWhatsAppToast({ title, subtitle, body }) {
  return ToastStore.push({ kind: 'whatsapp', title, subtitle, body });
}

function useToasts() {
  const [list, setList] = React.useState(ToastStore.list);
  React.useEffect(() => ToastStore.subscribe(setList), []);
  return list;
}

function NotificationToast({ toast, onDismiss }) {
  return (
    <div className="pointer-events-auto w-[340px] bg-[#111b21] border border-ink-700 rounded-2xl shadow-soft px-3.5 py-3 flex gap-3 animate-popIn">
      <div className="w-9 h-9 rounded-full bg-[#25d366] flex items-center justify-center shrink-0 mt-0.5">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.42 1.26 4.86L2 22l5.34-1.31a9.9 9.9 0 0 0 4.7 1.2h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm0 18.1h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.81.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.55 3.7-8.25 8.25-8.25 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.84c0 4.55-3.7 8.23-8.25 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02-.17 0-.43.06-.66.31s-.87.85-.87 2.08.89 2.41 1.02 2.58c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-slate-100 truncate">{toast.title}</span>
          <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 shrink-0"><Icon name="x" className="w-3.5 h-3.5" /></button>
        </div>
        {toast.subtitle && <div className="text-[11px] text-slate-500 mb-0.5">{toast.subtitle}</div>}
        <div className="text-[12px] text-slate-300 line-clamp-2">{toast.body}</div>
      </div>
    </div>
  );
}

function ToastHost() {
  const toasts = useToasts();
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => <NotificationToast key={t.id} toast={t} onDismiss={() => ToastStore.remove(t.id)} />)}
    </div>
  );
}

// ---- UI: phone-style WhatsApp bubble preview -------------------------------
function WhatsAppPreview({ contactName, subtitle, body, time, status }) {
  return (
    <div className="w-full max-w-[300px] rounded-[28px] border border-ink-700 bg-black shadow-soft overflow-hidden select-none">
      <div className="bg-[#075e54] px-3 py-2.5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
          {contactName.split(' ').map(w => w[0]).slice(0,2).join('')}
        </div>
        <div className="min-w-0">
          <div className="text-white text-[13px] font-medium truncate">{contactName}</div>
          <div className="text-emerald-100/70 text-[10px] truncate">{subtitle}</div>
        </div>
      </div>
      <div className="bg-wa-pattern px-3 py-4 min-h-[130px] flex items-end">
        <div className="relative bg-[#005c4b] text-emerald-50 text-[12.5px] leading-snug rounded-lg rounded-tr-sm px-2.5 py-2 max-w-[92%] shadow wa-bubble-tail-out">
          <div className="whitespace-pre-wrap">{body}</div>
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-200/70">
            <span className="tabular-nums">{time}</span>
            {status === 'sent'
              ? <svg viewBox="0 0 16 15" className="w-3.5 h-3.5 fill-[#53bdeb]"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.61 9.98a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.51 9.98a.32.32 0 0 1-.484.033L1.892 7.769a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z"/></svg>
              : <svg viewBox="0 0 16 15" className="w-3.5 h-3.5 fill-emerald-200/50"><path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.51 9.98a.32.32 0 0 1-.484.033L1.892 7.769a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z"/></svg>}
          </div>
        </div>
      </div>
    </div>
  );
}
