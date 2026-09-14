// ---------------------------------------------------------------------------
// Public-facing mock website: landing page + client booking wizard.
// This simulates what an actual customer sees — separate from the staff CRM.
// ---------------------------------------------------------------------------

const WIZARD_STEPS = ['Barber', 'Service', 'Time', 'Details', 'Confirm'];

function StepDots({ step, steps = WIZARD_STEPS }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
              i < step ? 'bg-brand-500 text-ink-950' : i === step ? 'bg-brand-500/20 text-brand-300 ring-2 ring-brand-500' : 'bg-ink-800 text-slate-500'}`}>
              {i < step ? <Icon name="check" className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i <= step ? 'text-slate-200' : 'text-slate-600'}`}>{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`w-6 h-px ${i < step ? 'bg-brand-500' : 'bg-ink-700'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Hero({ state, onStart, onStaff, onAgency, onAccount, client }) {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
            <Icon name="scissors" className="w-5 h-5 text-ink-950" />
          </div>
          <span className="font-display font-extrabold text-lg">{state.shopName || 'Fade & Faro'}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#account" onClick={(e) => { e.preventDefault(); onAccount(); }} className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1.5">
            <Icon name="user" className="w-3.5 h-3.5" /> {client ? `Hi, ${client.name.split(' ')[0]}` : 'Log in / Sign up'}
          </a>
          <a href="#staff" onClick={(e) => { e.preventDefault(); onStaff(); }} className="text-xs text-slate-500 hover:text-slate-300 transition">Staff dashboard →</a>
          <a href="#agency" onClick={(e) => { e.preventDefault(); onAgency(); }} className="text-xs text-slate-500 hover:text-slate-300 transition">Agency ↗</a>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 sm:px-10 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-1.5 bg-ink-850 border border-ink-700 rounded-full px-3 py-1 text-xs text-slate-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulseSoft" /> Open today · {state.barbers.length} barber{state.barbers.length !== 1 ? 's' : ''} available
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight mb-5">
          Sharp cuts.<br /><span className="text-brand-400">No waiting around.</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto mb-9">
          Book your barber, pick your service, and lock in a time slot in under a minute. We'll text you a confirmation and a reminder — no phone tag required.
        </p>
        <Button size="lg" onClick={onStart} className="!px-8 !py-3.5 !text-base">
          <Icon name="calendar" className="w-5 h-5" /> Book a Haircut
        </Button>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-16 text-left">
          {state.services.map(s => (
            <div key={s.id} className="bg-ink-850 border border-ink-700 rounded-xl px-4 py-3">
              <div className="text-sm font-semibold">{s.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.duration} min · ${s.price}</div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-4">Meet the team</div>
          <div className="flex justify-center gap-8">
            {state.barbers.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-2">
                <Avatar name={b.name} color={b.color} size={14} />
                <div className="text-sm font-semibold">{b.name}</div>
                <div className="text-xs text-slate-500">{b.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function BarberStep({ state, value, onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {state.barbers.map(b => (
        <button key={b.id} onClick={() => onSelect(b.id)}
          className={`text-left p-5 rounded-2xl border-2 transition ${value === b.id ? 'border-brand-500 bg-brand-500/10' : 'border-ink-700 bg-ink-850 hover:border-ink-600'}`}>
          <Avatar name={b.name} color={b.color} size={14} />
          <div className="font-display font-bold text-lg mt-3">{b.name}</div>
          <div className="text-sm text-slate-500">{b.title}</div>
          <div className="text-xs text-slate-600 mt-2">Available {b.hours.start > 12 ? b.hours.start - 12 : b.hours.start}{b.hours.start >= 12 ? 'pm' : 'am'} – {b.hours.end > 12 ? b.hours.end - 12 : b.hours.end}pm</div>
        </button>
      ))}
    </div>
  );
}

function ServiceStep({ state, barberId, value, onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {state.services.map(base => {
        const s = barberId ? getEffectiveService(state, barberId, base.id) : base;
        return (
          <button key={s.id} onClick={() => onSelect(s.id)}
            className={`flex items-center justify-between text-left p-4 rounded-xl border-2 transition ${value === s.id ? 'border-brand-500 bg-brand-500/10' : 'border-ink-700 bg-ink-850 hover:border-ink-600'}`}>
            <div>
              <div className="font-semibold text-sm">{s.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">Takes about {s.duration} minutes</div>
            </div>
            <div className="text-brand-400 font-display font-bold">${s.price}</div>
          </button>
        );
      })}
    </div>
  );
}

function DateChips({ days, selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
      {days.map(d => (
        <button key={d.toISOString()} onClick={() => onSelect(d)}
          className={`shrink-0 px-4 py-2.5 rounded-xl text-center border-2 transition ${isSameDay(d, selected) ? 'border-brand-500 bg-brand-500/10' : 'border-ink-700 bg-ink-850 hover:border-ink-600'}`}>
          <div className="text-[10px] text-slate-500 uppercase">{d.toLocaleDateString([], { weekday: 'short' })}</div>
          <div className="text-sm font-bold">{fmtDayLabel(d) === 'Today' || fmtDayLabel(d) === 'Tomorrow' ? fmtDayLabel(d) : d.getDate()}</div>
        </button>
      ))}
    </div>
  );
}

function DateTimeStep({ state, barberId, serviceId, day, setDay, time, setTime, excludeApptId }) {
  const service = getEffectiveService(state, barberId, serviceId);
  const barber = getBarber(state, barberId);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));
  const slots = getAvailableSlots(state, barberId, day, service.duration, excludeApptId);
  const groups = groupSlotsByPeriod(slots);
  const totalToday = state.appointments.filter(a => a.barberId === barberId && isSameDay(a.start, day) && a.status !== 'cancelled' && a.id !== excludeApptId).length;

  return (
    <div>
      <DateChips days={days} selected={day} onSelect={(d) => { setDay(d); setTime(null); }} />
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span>{barber.name.split(' ')[0]}'s schedule for {fmtDayLabel(day)}</span>
        {totalToday > 0 && <span>{totalToday} appointment{totalToday !== 1 ? 's' : ''} already booked</span>}
      </div>
      {slots.length === 0 ? (
        <div className="bg-ink-850 border border-ink-700 rounded-xl py-10 text-center">
          <div className="text-slate-300 font-medium mb-1">Fully booked for a {service.duration}-min {service.name.toLowerCase()}</div>
          <div className="text-xs text-slate-500">Try another day, or a shorter service.</div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
          {Object.entries(groups).filter(([, s]) => s.length).map(([period, periodSlots]) => (
            <div key={period}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{period}</div>
              <div className="grid grid-cols-4 gap-2">
                {periodSlots.map(s => {
                  const key = s.toISOString();
                  const isSel = time && time.toISOString() === key;
                  return (
                    <button key={key} onClick={() => setTime(s)}
                      className={`py-2 rounded-lg text-sm font-medium border-2 transition tabular-nums ${isSel ? 'border-brand-500 bg-brand-500 text-ink-950' : 'border-ink-700 bg-ink-900 hover:border-ink-500 text-slate-200'}`}>
                      {fmtTime(s)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Client accounts / session ----------------------------------------------
// Lightweight localStorage "session" so a client can create an account (name +
// phone + 4-digit PIN — a UX simplification, not real auth, since this whole
// app has no backend) and come back to a little dashboard. Guests can always
// skip this and book without ever signing up.
const SESSION_KEY = 'ff_session_v1';
function sessionStorageKey(shopId) {
  return shopId === DEFAULT_SHOP_ID ? SESSION_KEY : `ff_session_v1__${shopId}`;
}

// Scoped to the currently active shop (Store.shopId) so logging in on one
// shop's site never surfaces a client from a different shop.
const SessionStore = {
  clientId: null,
  listeners: new Set(),
  load() {
    try { this.clientId = JSON.parse(localStorage.getItem(sessionStorageKey(Store.shopId))); } catch (e) { this.clientId = null; }
    return this.clientId;
  },
  set(clientId) {
    this.clientId = clientId;
    try { localStorage.setItem(sessionStorageKey(Store.shopId), JSON.stringify(clientId)); } catch (e) {}
    this.listeners.forEach(fn => fn(clientId));
  },
  logout() { this.set(null); },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  // Re-reads the session for whichever shop is now active and notifies
  // subscribers — call after Store.switchShop().
  reload() { this.load(); this.listeners.forEach(fn => fn(this.clientId)); },
};
SessionStore.load();

function useSession() {
  const [clientId, setClientId] = React.useState(SessionStore.clientId);
  React.useEffect(() => SessionStore.subscribe(setClientId), []);
  return clientId;
}

function maskPhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return `••• ••• ${digits.slice(-4)}`;
}

// Login-or-signup panel. Used both as its own "My account" page and inline in
// the booking wizard for a returning client who wants to book under their
// existing account instead of as a guest. Real auth: enter your phone, we
// text you a 6-digit code, entering it either logs you into your existing
// account or creates one — there's no separate "login" vs "signup" step
// because a verified phone number is proof enough either way.
function AccountAuth({ state, onAuthed, allowGuestNote }) {
  const [step, setStep] = React.useState('phone'); // phone | code
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [referralCode, setReferralCode] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const knownAccount = phone.trim() ? findAccountByPhone(state, phone) : null;

  const sendCode = async () => {
    if (normalizePhone(phone).length < 7) { setError('Enter a valid phone number.'); return; }
    if (referralCode.trim() && !getClientByReferralCode(state, referralCode)) {
      setError("That referral code doesn't match anyone — check it and try again, or leave it blank.");
      return;
    }
    setError('');
    if (!SUPABASE_CONFIGURED) {
      // Demo mode: no backend to text a real code through, so skip straight
      // to a local account — same one-click stand-in as staff sign-in.
      const existing = findAccountByPhone(state, phone);
      if (existing) { onAuthed(existing.id); return; }
      const existingGuest = state.clients.find(c => !c.hasAccount && normalizePhone(c.phone) === normalizePhone(phone));
      if (existingGuest) {
        const acc = upgradeGuestToAccount(state, { upgradeClientId: existingGuest.id, name, phone, authUserId: null });
        onAuthed(acc.id);
        return;
      }
      const acc = addClient({ name: name.trim() || 'Guest', phone: phone.trim(), hasAccount: true, referredByCode: referralCode.trim() || null });
      onAuthed(acc.id);
      return;
    }
    setBusy(true);
    try {
      await sendPhoneOtp(phone.trim());
      setStep('code');
    } catch (e) { setError(e.message || 'Could not send a code — try again.'); }
    setBusy(false);
  };

  const verifyCode = async () => {
    if (code.trim().length < 4) { setError('Enter the code we texted you.'); return; }
    setError(''); setBusy(true);
    try {
      await verifyPhoneOtp(phone.trim(), code.trim());
      const clientId = await linkClientByPhone(Store.shopId);
      if (name.trim() || referralCode.trim()) {
        await patchOwnClientProfile(clientId, { name: name.trim() || null, referredByCode: referralCode.trim() || null });
      }
      onAuthed(clientId);
    } catch (e) { setError(e.message || 'That code was incorrect or expired.'); }
    setBusy(false);
  };

  if (step === 'code') {
    return (
      <div className="space-y-2.5">
        <p className="text-xs text-slate-500">We texted a code to {phone}.</p>
        <input autoFocus className={inputCls + ' tracking-[0.3em] text-center'} maxLength={6} inputMode="numeric" placeholder="000000" value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && verifyCode()} />
        <Button className="w-full" disabled={busy || code.trim().length < 4} onClick={verifyCode}>{busy ? 'Verifying…' : 'Verify & continue'}</Button>
        <button type="button" onClick={() => { setStep('phone'); setCode(''); setError(''); }} className="text-xs text-slate-500 hover:text-slate-300">← Use a different number</button>
        {error && <div className="text-xs text-rose-300">{error}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <PhoneInput value={phone} onChange={setPhone} />
      {!knownAccount && <input className={inputCls} placeholder="Full name (new here? tell us who you are)" value={name} onChange={e => setName(e.target.value)} />}
      {!knownAccount && (
        <input className={inputCls + ' uppercase tracking-widest'} placeholder="Referral code (optional)" value={referralCode}
          onChange={e => setReferralCode(e.target.value.toUpperCase())} />
      )}
      <Button className="w-full" disabled={busy || !phone.trim()} onClick={sendCode}>{busy ? 'Sending…' : SUPABASE_CONFIGURED ? 'Text me a code' : 'Continue'}</Button>
      {error && <div className="text-xs text-rose-300">{error}</div>}
      {allowGuestNote && <p className="text-xs text-slate-500 text-center pt-1">{allowGuestNote}</p>}
    </div>
  );
}

// Shown at the "Your details" step of the guest wizard: a logged-in client
// sees their own card; anyone else can log in, sign up, or continue as guest
// without ever seeing other customers' names.
function ClientAuthTabs({ state, value, onChange }) {
  const selected = value ? getClient(state, value) : null;
  const [mode, setMode] = React.useState('guest'); // guest | auth
  const [guestName, setGuestName] = React.useState('');
  const [guestPhone, setGuestPhone] = React.useState('');
  const [guestReferral, setGuestReferral] = React.useState('');

  if (selected) {
    return (
      <div className="flex items-center gap-2.5 bg-ink-900 border border-ink-600 rounded-lg px-3 py-2">
        <Avatar name={selected.name} size={7} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{selected.name}</div>
          <div className="text-xs text-slate-500 truncate">{selected.hasAccount ? 'Account' : 'Guest'} · {selected.phone}</div>
        </div>
        <button type="button" onClick={() => onChange(null)} className="text-xs text-slate-500 hover:text-slate-300 shrink-0">Change</button>
      </div>
    );
  }

  if (mode === 'auth') {
    return (
      <div className="border border-ink-600 rounded-lg p-3.5 bg-ink-900">
        <AccountAuth state={state} onAuthed={onChange} />
        <button type="button" onClick={() => setMode('guest')} className="text-xs text-slate-500 hover:text-slate-300 mt-3">← Continue as guest instead</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border border-ink-600 rounded-lg p-3 bg-ink-900 space-y-2.5">
        <input autoFocus className={inputCls} placeholder="Full name" value={guestName} onChange={e => setGuestName(e.target.value)} />
        <PhoneInput value={guestPhone} onChange={setGuestPhone} />
        <input className={inputCls + ' uppercase tracking-widest'} placeholder="Referral code (optional)" value={guestReferral}
          onChange={e => setGuestReferral(e.target.value.toUpperCase())} />
        <Button size="sm" className="w-full" disabled={!guestName.trim() || !guestPhone.trim()} onClick={() => {
          const c = addClient({ name: guestName.trim(), phone: guestPhone.trim(), referredByCode: guestReferral.trim() || null });
          onChange(c.id);
        }}>Continue as guest</Button>
      </div>
      <button type="button" onClick={() => setMode('auth')}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-ink-600 text-brand-400 hover:border-brand-500/50 hover:bg-brand-500/5 text-sm font-medium transition">
        <Icon name="user" className="w-4 h-4" /> Been here before? Log in or create an account
      </button>
    </div>
  );
}

function BookedAsCard({ client }) {
  return (
    <div className="flex items-center gap-2.5 bg-ink-900 border border-ink-600 rounded-lg px-3 py-2">
      <Avatar name={client.name} size={7} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{client.name}</div>
        <div className="text-xs text-slate-500 truncate">Booking to your account · {client.phone}</div>
      </div>
    </div>
  );
}

// Frequency + first-visit picker that pre-books `occurrences` future visits at
// once. Reuses the same slot grid/availability logic as a single booking so a
// recurring slot can never collide with an existing appointment.
function RecurringBookingForm({ state, client, onDone, onCancel }) {
  const [barberId, setBarberId] = React.useState(null);
  const [serviceId, setServiceId] = React.useState(null);
  const [frequency, setFrequency] = React.useState('weekly');
  const [day, setDay] = React.useState(startOfDay(new Date()));
  const [time, setTime] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [confirmReplace, setConfirmReplace] = React.useState(false);

  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));
  const service = serviceId && getEffectiveService(state, barberId, serviceId);
  const existingRecurring = state.recurringBookings.filter(r => r.clientId === client.id && r.active);

  const doLockIn = () => {
    existingRecurring.forEach(r => cancelRecurringBooking(r.id));
    const { recurring, created, skipped } = createRecurringBooking(Store.get(), {
      clientId: client.id, barberId, serviceId, frequency, firstStart: time,
    });
    const msg = queueRecurringConfirmation(Store.get(), recurring, created[0], created.length);
    setResult({ recurring, created, skipped, msg });
  };

  const handleLockIn = () => {
    if (existingRecurring.length > 0 && !confirmReplace) { setConfirmReplace(true); return; }
    doLockIn();
  };

  if (result) {
    const freqLabel = frequency === 'weekly' ? 'week' : frequency === 'biweekly' ? 'other week' : '4 weeks';
    return (
      <div className="text-center py-2">
        <div className="w-12 h-12 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center mx-auto mb-3">
          <Icon name="lock" className="w-6 h-6" />
        </div>
        <h3 className="font-display font-bold text-lg mb-1">You're locked in!</h3>
        <p className="text-sm text-slate-500 mb-1">{result.created.length} visits booked, every {freqLabel} at {fmtTime(time)}.</p>
        <p className="text-xs text-slate-600 mb-4">We'll automatically keep booking further visits so this never runs out — cancel any time from your dashboard, or change an individual date if one visit doesn't work.</p>
        <div className="flex justify-center mb-4">
          <WhatsAppPreview contactName={state.shopName || 'Fade & Faro'} subtitle="Recurring booking" body={result.msg.body} time={fmtTime(new Date())} status="sent" />
        </div>
        {result.skipped.length > 0 && (
          <div className="text-xs text-amber-300/90 bg-amber-500/10 ring-1 ring-amber-500/20 rounded-lg px-3 py-2 mb-4 text-left">
            {result.skipped.length} occurrence{result.skipped.length !== 1 ? 's' : ''} clashed with an existing booking and were skipped so nothing got double-booked.
          </div>
        )}
        <Button onClick={onDone}>Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Barber</div>
        <BarberStep state={state} value={barberId} onSelect={setBarberId} />
      </div>
      {barberId && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Service</div>
          <ServiceStep state={state} barberId={barberId} value={serviceId} onSelect={setServiceId} />
        </div>
      )}
      {barberId && serviceId && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Repeat</div>
          <div className="flex gap-2">
            {[['weekly', 'Weekly'], ['biweekly', 'Biweekly'], ['monthly', 'Every 4 weeks']].map(([f, label]) => (
              <button key={f} onClick={() => { setFrequency(f); setTime(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition ${frequency === f ? 'border-brand-500 bg-brand-500/10' : 'border-ink-700 bg-ink-850 hover:border-ink-600'}`}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5">Every 4 weeks keeps the same weekday every time — a calendar month wouldn't.</p>
        </div>
      )}
      {barberId && serviceId && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">First visit</div>
          <DateTimeStep state={state} barberId={barberId} serviceId={serviceId} day={day} setDay={setDay} time={time} setTime={setTime} />
        </div>
      )}
      {confirmReplace ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-sm font-medium text-amber-200 mb-1">Replace your current recurring slot?</div>
          <p className="text-xs text-amber-100/80 mb-3">
            You already have {existingRecurring.length === 1 ? 'a recurring slot' : `${existingRecurring.length} recurring slots`} locked in. Locking in this new slot will cancel {existingRecurring.length === 1 ? 'it' : 'them'} and remove its upcoming visits from your dashboard and the schedule — this can't be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmReplace(false)}>Go back</Button>
            <Button onClick={doLockIn}>Yes, replace it</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button disabled={!barberId || !serviceId || !time} onClick={handleLockIn}>
            <Icon name="lock" className="w-4 h-4" /> Lock in {frequency === 'monthly' ? 'every-4-weeks' : frequency} slot
          </Button>
        </div>
      )}
    </div>
  );
}

// Lets a client move a single visit to a new day/time without touching
// anything else about it — same barber and service, just a different slot.
// Used for one-off bookings and for individual occurrences of a recurring
// slot alike (the recurring series itself keeps its regular cadence).
function RescheduleDateTimePicker({ state, appt, onCancel, onConfirm }) {
  const [day, setDay] = React.useState(startOfDay(new Date(appt.start)));
  const [time, setTime] = React.useState(null);
  return (
    <div>
      <DateTimeStep state={state} barberId={appt.barberId} serviceId={appt.serviceId} day={day} setDay={setDay} time={time} setTime={setTime} excludeApptId={appt.id} />
      <div className="flex gap-2 justify-end mt-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>Never mind</Button>
        <Button size="sm" disabled={!time} onClick={() => onConfirm(time)}>Confirm new time</Button>
      </div>
    </div>
  );
}

// One-tap rebook: picks a fresh date/time for the same barber + service as a
// past visit, then books it as a brand-new appointment (the old visit is
// untouched — this isn't a reschedule).
function RebookPicker({ state, pastAppt, onCancel, onDone }) {
  const [day, setDay] = React.useState(startOfDay(new Date()));
  const [time, setTime] = React.useState(null);
  const barber = getBarber(state, pastAppt.barberId);
  const service = getEffectiveService(state, pastAppt.barberId, pastAppt.serviceId);

  const confirm = () => {
    const appt = addAppointment(state, {
      barberId: pastAppt.barberId, clientId: pastAppt.clientId, serviceId: pastAppt.serviceId,
      start: time.toISOString(), duration: service.duration, status: 'upcoming',
    });
    const msg = queueMessageNow('confirmation', appt);
    pushWhatsAppToast({ title: `WhatsApp · ${state.shopName || 'Fade & Faro'}`, subtitle: `Sent to ${getClient(Store.get(), pastAppt.clientId).phone}`, body: msg.body });
    onDone(appt);
  };

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-850 p-4">
      <div className="text-sm font-medium mb-1">Book the same thing again</div>
      <p className="text-xs text-slate-500 mb-3">{service.name} with {barber.name.split(' ')[0]} — pick a new day and time.</p>
      <DateTimeStep state={state} barberId={pastAppt.barberId} serviceId={pastAppt.serviceId} day={day} setDay={setDay} time={time} setTime={setTime} />
      <div className="flex gap-2 justify-end mt-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>Never mind</Button>
        <Button size="sm" disabled={!time} onClick={confirm}>Confirm booking</Button>
      </div>
    </div>
  );
}

// Star-rating + optional comment, shown on a completed visit once a review
// request has gone out and no review has been left yet.
function ReviewPrompt({ appt, onSubmit }) {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return <div className="text-xs text-brand-400 mt-2">Thanks for the feedback!</div>;
  }

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-850 p-4 mt-2">
      <div className="text-sm font-medium mb-2">How was your visit?</div>
      <div className="flex gap-1 mb-2.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
            className="p-0.5">
            <Icon name="star" className={`w-5 h-5 ${(hover || rating) >= n ? 'text-amber-400' : 'text-ink-600'}`} />
          </button>
        ))}
      </div>
      <textarea className={inputCls + ' h-16 resize-none mb-2.5'} placeholder="Anything you'd like to add? (optional)" value={comment} onChange={e => setComment(e.target.value)} />
      <Button size="sm" disabled={!rating} onClick={() => { addReview(appt.id, { rating, comment: comment.trim() }); setSubmitted(true); onSubmit && onSubmit(); }}>Submit review</Button>
    </div>
  );
}

// Client-facing dashboard: days since last cut, upcoming visits, active
// recurring slots, and quick actions to book once or lock in a repeat slot.
function ClientDashboard({ state, clientId, onBookGuestStyle, onLogout }) {
  const client = getClient(state, clientId);
  const [showRecurring, setShowRecurring] = React.useState(false);
  const [confirmCancelId, setConfirmCancelId] = React.useState(null);
  const [reschedulingApptId, setReschedulingApptId] = React.useState(null);
  const [rebookingApptId, setRebookingApptId] = React.useState(null);
  const [copiedReferral, setCopiedReferral] = React.useState(false);
  if (!client) return null;

  const days = daysSinceLastVisit(state, clientId);
  const upcoming = state.appointments
    .filter(a => a.clientId === clientId && a.status === 'upcoming' && new Date(a.start) > new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const recurring = state.recurringBookings.filter(r => r.clientId === clientId && r.active);
  const past = state.appointments
    .filter(a => a.clientId === clientId && a.status === 'completed')
    .sort((a, b) => new Date(b.start) - new Date(a.start))
    .slice(0, 5);
  const referralLink = `fadeandfaro.com/book?ref=${client.referralCode}`;

  if (showRecurring) {
    return (
      <div className="min-h-screen bg-ink-950 text-slate-100 py-10 px-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setShowRecurring(false)} className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1">
              <Icon name="chevronLeft" className="w-4 h-4" /> Back to dashboard
            </button>
            <span className="font-display font-bold">{state.shopName || 'Fade & Faro'}</span>
          </div>
          <div className="bg-ink-900/40 border border-ink-800 rounded-3xl p-6 sm:p-7">
            <h2 className="font-display font-bold text-xl mb-1">Lock in a recurring slot</h2>
            <p className="text-sm text-slate-500 mb-5">Pick a cadence and your first visit — we'll pre-book the next several visits at the same time automatically.</p>
            <RecurringBookingForm state={state} client={client} onCancel={() => setShowRecurring(false)} onDone={() => setShowRecurring(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 py-10 px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <span className="font-display font-bold">{state.shopName || 'Fade & Faro'}</span>
          <button onClick={onLogout} className="text-xs text-slate-500 hover:text-slate-300">Log out</button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar name={client.name} size={12} />
          <div>
            <div className="font-display font-bold text-lg">{client.name.split(' ')[0]}'s dashboard</div>
            <div className="text-xs text-slate-500">{client.phone}</div>
          </div>
        </div>

        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5 mb-5">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Days since last haircut</div>
          <div className="font-display font-extrabold text-4xl text-brand-400">{days === null ? '—' : days}</div>
          <div className="text-xs text-slate-500 mt-1">{days === null ? "You haven't had a visit with us yet." : days === 0 ? 'You were just in today!' : `Last visit ${days} day${days !== 1 ? 's' : ''} ago.`}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button onClick={() => onBookGuestStyle(clientId)} className="!py-3"><Icon name="calendar" className="w-4 h-4" /> Book a haircut</Button>
          <Button variant="outline" onClick={() => setShowRecurring(true)} className="!py-3"><Icon name="lock" className="w-4 h-4" /> Lock in a slot</Button>
        </div>

        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Refer a friend, you both get $10</div>
            {client.creditBalance > 0 && <Badge tone="green">${client.creditBalance} credit</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 truncate">{referralLink}</code>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(referralLink); setCopiedReferral(true); setTimeout(() => setCopiedReferral(false), 2000); }}>
              {copiedReferral ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">Share your code <span className="text-slate-400 font-medium">{client.referralCode}</span> — when a friend books their first visit with it, you'll both get $10 credit.</p>
        </div>

        {upcoming.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Upcoming appointments</div>
            <div className="space-y-2">
              {upcoming.map(a => {
                const b = getBarber(state, a.barberId), s = getService(state, a.serviceId);
                if (reschedulingApptId === a.id) {
                  return (
                    <div key={a.id} className="rounded-xl border border-ink-700 bg-ink-850 p-4">
                      <div className="text-sm font-medium mb-1">Change date for this visit</div>
                      <p className="text-xs text-slate-500 mb-3">
                        {s.name} with {b.name.split(' ')[0]} — pick a new day and time. This only changes this one visit{a.recurringId ? ', your recurring slot keeps its regular day/time.' : '.'}
                      </p>
                      <RescheduleDateTimePicker
                        state={state}
                        appt={a}
                        onCancel={() => setReschedulingApptId(null)}
                        onConfirm={(newTime) => { rescheduleAppointment(a.id, newTime); setReschedulingApptId(null); }}
                      />
                    </div>
                  );
                }
                return (
                  <div key={a.id} className="flex items-center justify-between bg-ink-850 border border-ink-700 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">{s.name} with {b.name.split(' ')[0]}</div>
                      <div className="text-xs text-slate-500">{fmtDateTime(a.start)}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {a.recurringId && <span className="text-[10px] uppercase tracking-wide text-brand-400 bg-brand-500/10 px-2 py-1 rounded-full">Recurring</span>}
                      <button onClick={() => setReschedulingApptId(a.id)} className="text-xs text-slate-500 hover:text-brand-300">Change date</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recurring.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Active recurring slots</div>
            <p className="text-xs text-slate-600 mb-2">We keep booking further visits automatically so this never runs out — cancel any time.</p>
            <div className="space-y-2">
              {recurring.map(r => {
                const b = getBarber(state, r.barberId), s = getService(state, r.serviceId);
                if (confirmCancelId === r.id) {
                  return (
                    <div key={r.id} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <div className="text-sm font-medium text-amber-200 mb-1">Cancel this recurring slot?</div>
                      <p className="text-xs text-amber-100/80 mb-3">
                        This will cancel your {r.frequency === 'monthly' ? 'every-4-weeks' : r.frequency} {s.name} slot with {b.name.split(' ')[0]} and remove its upcoming visits from your dashboard and the schedule — this can't be undone.
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setConfirmCancelId(null)}>Go back</Button>
                        <Button onClick={() => { cancelRecurringBooking(r.id); setConfirmCancelId(null); }}>Yes, cancel it</Button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={r.id} className="flex items-center justify-between bg-ink-850 border border-ink-700 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">{r.frequency === 'monthly' ? 'Every 4 weeks' : r.frequency === 'biweekly' ? 'Biweekly' : 'Weekly'} · {s.name} with {b.name.split(' ')[0]}</div>
                      <div className="text-xs text-slate-500">First visit {fmtDateTime(r.firstStart)}</div>
                    </div>
                    <button onClick={() => setConfirmCancelId(r.id)} className="text-xs text-slate-500 hover:text-rose-300">Cancel</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Past visits</div>
            <div className="space-y-2">
              {past.map(a => {
                const b = getBarber(state, a.barberId), s = getEffectiveService(state, a.barberId, a.serviceId);
                return (
                  <div key={a.id}>
                    <div className="flex items-center justify-between bg-ink-850 border border-ink-700 rounded-xl px-4 py-3">
                      <div>
                        <div className="text-sm font-medium">{s.name} with {b.name.split(' ')[0]}</div>
                        <div className="text-xs text-slate-500">{fmtDateTime(a.start)}</div>
                        {a.rating && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map(n => <Icon key={n} name="star" className={`w-3 h-3 ${a.rating >= n ? 'text-amber-400' : 'text-ink-700'}`} />)}
                          </div>
                        )}
                      </div>
                      {rebookingApptId !== a.id && (
                        <button onClick={() => setRebookingApptId(a.id)} className="text-xs text-brand-400 hover:text-brand-300 font-medium shrink-0">Book again</button>
                      )}
                    </div>
                    {rebookingApptId === a.id && (
                      <div className="mt-2">
                        <RebookPicker state={state} pastAppt={a} onCancel={() => setRebookingApptId(null)} onDone={() => setRebookingApptId(null)} />
                      </div>
                    )}
                    {a.reviewRequested && !a.rating && <ReviewPrompt appt={a} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ThankYouRedirect({ onExit, seconds = 6 }) {
  const [left, setLeft] = React.useState(seconds);

  React.useEffect(() => {
    if (left <= 0) { onExit(); return; }
    const t = setTimeout(() => setLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <div className="text-xs text-slate-500 mt-1">
      Taking you back to the homepage in {left}s… <button onClick={onExit} className="text-brand-400 hover:underline">Go now</button>
    </div>
  );
}

function BookingWizard({ state, onExit, presetClientId }) {
  const [step, setStep] = React.useState(0);
  const [barberId, setBarberId] = React.useState(null);
  const [serviceId, setServiceId] = React.useState(null);
  const [day, setDay] = React.useState(startOfDay(new Date()));
  const [time, setTime] = React.useState(null);
  const [clientId, setClientId] = React.useState(presetClientId || null);
  const [confirmedAppt, setConfirmedAppt] = React.useState(null);
  const [confirmMsg, setConfirmMsg] = React.useState(null);

  const barber = barberId && getBarber(state, barberId);
  const service = serviceId && getEffectiveService(state, barberId, serviceId);
  const client = clientId && getClient(state, clientId);

  const canNext = [!!barberId, !!serviceId, !!time, !!clientId, true][step];

  const handleConfirm = () => {
    const appt = addAppointment(state, {
      barberId, clientId, serviceId,
      start: time.toISOString(),
      duration: service.duration,
      status: 'upcoming',
    });
    const msg = queueMessageNow('confirmation', appt);
    pushWhatsAppToast({
      title: `WhatsApp · ${state.shopName || 'Fade & Faro'}`,
      subtitle: `Sent to ${getClient(Store.get(), clientId).phone}`,
      body: msg.body,
    });
    setConfirmedAppt(appt);
    setConfirmMsg(msg);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 py-10 px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onExit} className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1">
            <Icon name="chevronLeft" className="w-4 h-4" /> Back to site
          </button>
          <span className="font-display font-bold">{state.shopName || 'Fade & Faro'}</span>
        </div>

        <StepDots step={step} />

        <div className="bg-ink-900/40 border border-ink-800 rounded-3xl p-6 sm:p-7">
          {step === 0 && (
            <>
              <h2 className="font-display font-bold text-xl mb-4">Choose your barber</h2>
              <BarberStep state={state} value={barberId} onSelect={setBarberId} />
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="font-display font-bold text-xl mb-4">Choose a service</h2>
              <ServiceStep state={state} barberId={barberId} value={serviceId} onSelect={setServiceId} />
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="font-display font-bold text-xl mb-4">Pick a date & time</h2>
              <DateTimeStep state={state} barberId={barberId} serviceId={serviceId} day={day} setDay={setDay} time={time} setTime={setTime} />
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="font-display font-bold text-xl mb-1">Your details</h2>
              <p className="text-sm text-slate-500 mb-4">
                {presetClientId ? 'Booking to your account.' : "Log in if you've got an account, or continue as a guest — no sign-up required."}
              </p>
              {presetClientId ? (
                <BookedAsCard client={getClient(state, presetClientId)} />
              ) : (
                <ClientAuthTabs state={state} value={clientId} onChange={setClientId} />
              )}
            </>
          )}
          {step === 4 && confirmedAppt && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center mx-auto mb-4">
                <Icon name="check" className="w-7 h-7" />
              </div>
              <h2 className="font-display font-bold text-2xl mb-1">Thank you, {client.name.split(' ')[0]}!</h2>
              <p className="text-sm text-slate-500 mb-6">You're all booked in — {barber.name.split(' ')[0]} will see you {fmtDateTime(confirmedAppt.start)}.</p>

              <div className="bg-ink-900 border border-ink-700 rounded-2xl p-4 text-left mb-6 grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-slate-500">Barber</div><div className="font-medium">{barber.name}</div></div>
                <div><div className="text-xs text-slate-500">Service</div><div className="font-medium">{service.name} · ${service.price}</div></div>
                <div><div className="text-xs text-slate-500">When</div><div className="font-medium">{fmtDateTime(confirmedAppt.start)}</div></div>
                <div><div className="text-xs text-slate-500">Duration</div><div className="font-medium">{service.duration} min</div></div>
              </div>

              <div className="text-xs text-slate-500 mb-3">A confirmation just went out over WhatsApp (simulated) — this is exactly what {client.name.split(' ')[0]} would receive:</div>
              <div className="flex justify-center mb-6">
                <WhatsAppPreview contactName={barber.name} subtitle={state.shopName || 'Fade & Faro'} body={confirmMsg.body} time={fmtTime(confirmMsg.scheduledFor)} status="sent" />
              </div>
              <div className="text-xs text-slate-600 mb-6">A day-before reminder (with a link to change the time if it doesn't work) auto-queues 24 hours out, another reminder ~1 hour before the appointment, and a review request ~1 hour after the visit — all visible any time in the staff Messages tab.</div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onExit}>Back to homepage</Button>
                <Button onClick={() => { setStep(0); setBarberId(null); setServiceId(null); setTime(null); setClientId(null); setConfirmedAppt(null); }}>Book another</Button>
              </div>
              <ThankYouRedirect onExit={onExit} />
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="flex items-center justify-between mt-6">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
              <Icon name="chevronLeft" className="w-4 h-4" /> Back
            </Button>
            {step === 3 ? (
              <Button disabled={!canNext} onClick={handleConfirm}><Icon name="send" className="w-4 h-4" />Confirm booking</Button>
            ) : (
              <Button disabled={!canNext} onClick={() => setStep(s => s + 1)}>Continue <Icon name="chevronRight" className="w-4 h-4" /></Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountPage({ state, sessionClientId, onExit, onBook }) {
  const client = sessionClientId && getClient(state, sessionClientId);
  if (client) {
    return <ClientDashboard state={state} clientId={client.id} onBookGuestStyle={onBook} onLogout={() => { SessionStore.logout(); onExit(); }} />;
  }
  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 py-10 px-6">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onExit} className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1">
            <Icon name="chevronLeft" className="w-4 h-4" /> Back to site
          </button>
          <span className="font-display font-bold">{state.shopName || 'Fade & Faro'}</span>
        </div>
        <div className="bg-ink-900/40 border border-ink-800 rounded-3xl p-6 sm:p-7">
          <h2 className="font-display font-bold text-xl mb-1">Your account</h2>
          <p className="text-sm text-slate-500 mb-5">Log in or create an account to see your visit history and lock in recurring slots.</p>
          <AccountAuth state={state} onAuthed={(id) => SessionStore.set(id)} />
        </div>
      </div>
    </div>
  );
}

// ---- Staff sign-in chooser: owner (email/password) vs. barber (phone-OTP) ---
function OwnerSignIn({ onEnterOwner }) {
  const [mode, setMode] = React.useState('login'); // login | signup
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6) { setError('Enter your email and a password (6+ characters).'); return; }
    setError(''); setBusy(true);
    try {
      if (mode === 'signup') await signUpOwner(email.trim(), password);
      else await signInOwner(email.trim(), password);
      onEnterOwner();
    } catch (e) { setError(e.message || 'Sign-in failed.'); }
    setBusy(false);
  };

  return (
    <div className="space-y-2.5">
      <input className={inputCls} type="email" placeholder="Owner email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className={inputCls} type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
      <Button className="w-full justify-center" onClick={submit} disabled={busy}>
        {busy ? 'Please wait…' : mode === 'signup' ? 'Create owner account' : 'Sign in'}
      </Button>
      <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }} className="text-xs text-slate-500 hover:text-slate-300">
        {mode === 'signup' ? 'Already have an account? Sign in' : "First time here? Create the owner account"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function BarberSignIn({ onEnterBarber }) {
  const [step, setStep] = React.useState('phone'); // phone | code
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const sendCode = async () => {
    if (normalizePhone(phone).length < 7) { setError('Enter your phone number.'); return; }
    setError(''); setBusy(true);
    try { await sendPhoneOtp(phone.trim()); setStep('code'); }
    catch (e) { setError(e.message || 'Could not send a code.'); }
    setBusy(false);
  };

  const verify = async () => {
    if (code.trim().length < 4) { setError('Enter the code we texted you.'); return; }
    setError(''); setBusy(true);
    try {
      await verifyPhoneOtp(phone.trim(), code.trim());
      const barberId = await linkBarberByPhone();
      if (!barberId) { setError("This phone number isn't on file for any barber here — ask the owner to add it on the Staff page."); setBusy(false); return; }
      onEnterBarber(barberId);
    } catch (e) { setError(e.message || 'That code was incorrect or expired.'); }
    setBusy(false);
  };

  if (step === 'code') {
    return (
      <div className="space-y-2.5">
        <p className="text-xs text-slate-500">We texted a code to {phone}.</p>
        <input autoFocus inputMode="numeric" className={inputCls + ' tracking-[0.3em] text-center'} maxLength={6} placeholder="000000" value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && verify()} />
        <Button className="w-full justify-center" onClick={verify} disabled={busy}>{busy ? 'Verifying…' : 'Sign in'}</Button>
        <button type="button" onClick={() => { setStep('phone'); setCode(''); setError(''); }} className="text-xs text-slate-500 hover:text-slate-300">← Use a different number</button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <Field label="I'm a barber — text me a code">
      <PhoneInput value={phone} onChange={setPhone} />
      <Button className="w-full justify-center mt-2.5" onClick={sendCode} disabled={busy || !phone.trim()}>{busy ? 'Sending…' : 'Send code'}</Button>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </Field>
  );
}

// Until a real Supabase project is connected there's nothing to authenticate
// against, so fall back to the old one-click chooser (same spirit as
// sendMessage() falling back to a simulated send) — this is what keeps the
// admin panel reachable for local demoing/testing before you've set up the
// backend described in the plan.
function DemoStaffChooser({ state, onEnterOwner, onEnterBarber }) {
  return (
    <div>
      <p className="text-xs text-amber-300/90 bg-amber-500/10 ring-1 ring-amber-500/20 rounded-lg px-3 py-2 mb-4">
        Demo mode — no Supabase project connected yet, so sign-in is a one-click stand-in. See supabase-client.js.
      </p>
      <button onClick={onEnterOwner} className="w-full flex items-center gap-3 bg-ink-900 hover:bg-ink-700 border border-ink-600 rounded-xl px-4 py-3.5 mb-3 transition text-left">
        <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
          <Icon name="building" className="w-4.5 h-4.5 text-brand-400" />
        </div>
        <div>
          <div className="font-medium text-sm">Continue as owner</div>
          <div className="text-xs text-slate-500">Full access to staff, settings, and reports</div>
        </div>
      </button>
      <div className="text-xs text-slate-500 mb-2">Or continue as a barber:</div>
      <div className="space-y-1.5">
        {state.barbers.map(b => (
          <button key={b.id} onClick={() => onEnterBarber(b.id)}
            className="w-full flex items-center gap-2.5 bg-ink-900 hover:bg-ink-700 border border-ink-600 rounded-lg px-3 py-2.5 transition text-left">
            <Avatar name={b.name} color={b.color} size={7} />
            <span className="text-sm font-medium">{b.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StaffSignInModal({ open, onClose, state, onEnterOwner, onEnterBarber }) {
  if (!SUPABASE_CONFIGURED) {
    return (
      <Modal open={open} onClose={onClose} title="Staff sign in">
        <DemoStaffChooser state={state} onEnterOwner={onEnterOwner} onEnterBarber={onEnterBarber} />
      </Modal>
    );
  }
  return (
    <Modal open={open} onClose={onClose} title="Staff sign in">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
            <Icon name="building" className="w-4.5 h-4.5 text-brand-400" />
          </div>
          <div>
            <div className="font-medium text-sm">Owner</div>
            <div className="text-xs text-slate-500">Full access to staff, settings, and reports</div>
          </div>
        </div>
        <OwnerSignIn onEnterOwner={onEnterOwner} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-px bg-ink-700 flex-1" /><span className="text-xs text-slate-600">or</span><div className="h-px bg-ink-700 flex-1" />
      </div>

      <BarberSignIn onEnterBarber={onEnterBarber} />
    </Modal>
  );
}

function PublicSite({ state, onStaff, onAgency }) {
  const [mode, setMode] = React.useState('home'); // home | booking | account
  const [showStaffSignIn, setShowStaffSignIn] = React.useState(false);
  const sessionClientId = useSession();

  if (mode === 'booking') {
    return <BookingWizard state={state} onExit={() => setMode('home')} presetClientId={sessionClientId} />;
  }
  if (mode === 'account') {
    return <AccountPage state={state} sessionClientId={sessionClientId} onExit={() => setMode('home')} onBook={() => setMode('booking')} />;
  }
  return (
    <>
      <Hero
        state={state}
        onStart={() => setMode('booking')}
        onStaff={() => setShowStaffSignIn(true)}
        onAgency={onAgency}
        onAccount={() => setMode('account')}
        client={sessionClientId ? getClient(state, sessionClientId) : null}
      />
      <StaffSignInModal
        open={showStaffSignIn}
        onClose={() => setShowStaffSignIn(false)}
        state={state}
        onEnterOwner={() => { setShowStaffSignIn(false); onStaff(null); }}
        onEnterBarber={(barberId) => { setShowStaffSignIn(false); onStaff(barberId); }}
      />
    </>
  );
}
