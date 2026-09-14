// ---------------------------------------------------------------------------
// Fade & Faro — mock data layer + tiny local-storage backed store
// No backend yet: everything lives in localStorage so the prototype behaves
// like a real app across reloads. Swap `Store` internals for API calls later.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'fadefaro_crm_v1';
const DEFAULT_SHOP_ID = 'default';
function shopStorageKey(shopId) {
  return shopId === DEFAULT_SHOP_ID ? STORAGE_KEY : `fadefaro_crm_v1__${shopId}`;
}

function uid(prefix) {
  return (prefix ? prefix + '_' : '') + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

// ---- date helpers ----------------------------------------------------------
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function addMinutes(d, n) { const x = new Date(d); x.setMinutes(x.getMinutes() + n); return x; }
function isSameDay(a, b) { return startOfDay(a).getTime() === startOfDay(b).getTime(); }
function combineDateTime(dateAtMidnight, hh, mm) {
  const x = new Date(dateAtMidnight);
  x.setHours(hh, mm, 0, 0);
  return x;
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
function fmtDayLabel(d) {
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return new Date(d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtDateShort(d) {
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function fmtDateTime(d) {
  return `${fmtDayLabel(d)}, ${fmtTime(d)}`;
}
function minutesBetween(a, b) { return (new Date(a) - new Date(b)) / 60000; }

// ---- seed data --------------------------------------------------------------
const BARBERS = [
  {
    id: 'b1',
    name: 'Marco Ricci',
    title: 'Master Barber · Fades & Beards',
    color: '#1eb86b',
    colorSoft: 'rgba(30,184,107,0.14)',
    avatar: 'MR',
    hours: { start: 9, end: 18 },
    phone: '+1 (555) 010-1111',
    authUserId: null,
    timeOff: [],
    serviceOverrides: {},
  },
  {
    id: 'b2',
    name: 'Sofia Alvarez',
    title: 'Senior Stylist · Color & Cuts',
    color: '#f0a83c',
    colorSoft: 'rgba(240,168,60,0.14)',
    avatar: 'SA',
    hours: { start: 10, end: 19 },
    phone: '+1 (555) 010-2222',
    authUserId: null,
    timeOff: [],
    serviceOverrides: {},
  },
];

// Palette cycled through when the agency setup wizard creates new barbers
// (mirrors the greens/ambers already used for Marco/Sofia).
const BARBER_COLORS = ['#1eb86b', '#f0a83c', '#4f9fee', '#e0607e', '#a978e8', '#e8b23c'];
function barberColor(index) { return BARBER_COLORS[index % BARBER_COLORS.length]; }
function colorSoft(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.14)`;
}

const SERVICES = [
  { id: 's1', name: 'Classic Haircut', duration: 30, price: 28 },
  { id: 's2', name: 'Skin Fade', duration: 45, price: 35 },
  { id: 's3', name: 'Beard Trim', duration: 20, price: 15 },
  { id: 's4', name: 'Cut + Beard Combo', duration: 60, price: 45 },
  { id: 's5', name: 'Hot Towel Shave', duration: 30, price: 25 },
  { id: 's6', name: "Kid's Cut", duration: 25, price: 20 },
];

const CLIENT_NAMES = [
  ['Liam Turner', '+1 (555) 201-0192'],
  ['Noah Bennett', '+1 (555) 201-0234'],
  ['Ethan Brooks', '+1 (555) 201-0355'],
  ['Mason Reid', '+1 (555) 201-0467'],
  ['James Coleman', '+1 (555) 201-0521'],
  ['Lucas Ferreira', '+1 (555) 201-0678'],
  ['Oliver Vance', '+1 (555) 201-0789'],
  ['Daniel Ortiz', '+1 (555) 201-0890'],
  ['Derek Cole', '+1 (555) 201-0999'],
  ['Grace Whitman', '+1 (555) 201-1088'],
];

function generateReferralCode(name) {
  const base = (name || 'FRIEND').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'FADE';
  return base + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function seedClients() {
  return CLIENT_NAMES.map(([name, phone], i) => ({
    id: uid('c'),
    name,
    phone,
    notes: '',
    hasAccount: false,
    authUserId: null,
    accountNudgeSent: false,
    referralCode: generateReferralCode(name),
    referredByCode: null,
    creditBalance: 0,
    referralRewardGranted: false,
    winbackSent: false,
    createdAt: addDays(new Date(), -60 + i * 3).toISOString(),
  }));
}

function seedAppointments(clients) {
  const appts = [];
  const now = new Date();
  const today = startOfDay(now);

  const push = (barberId, client, dayOffset, hh, mm, serviceId, status) => {
    const day = addDays(today, dayOffset);
    const start = combineDateTime(day, hh, mm);
    const service = SERVICES.find(s => s.id === serviceId);
    appts.push({
      id: uid('a'),
      barberId,
      clientId: client.id,
      serviceId,
      start: start.toISOString(),
      duration: service.duration,
      status, // 'upcoming' | 'completed' | 'cancelled' | 'no-show'
      reminderSent: status !== 'upcoming',
      dayBeforeSent: status !== 'upcoming',
      reviewRequested: false,
      rating: null,
      reviewText: null,
      createdAt: addDays(now, -1).toISOString(),
    });
  };

  // --- Today: a spread of appointments for both barbers ---
  push('b1', clients[0], 0, 9, 0, 's2', 'completed');
  push('b1', clients[1], 0, 10, 0, 's1', 'completed');
  push('b2', clients[2], 0, 10, 30, 's4', 'completed');
  push('b1', clients[3], 0, 13, 0, 's3', 'upcoming');
  push('b2', clients[4], 0, 14, 0, 's1', 'upcoming');
  push('b1', clients[5], 0, 16, 30, 's5', 'upcoming');

  // A guaranteed "reminder due soon" demo appointment, ~40 min from now
  const soon = addMinutes(now, 40);
  appts.push({
    id: uid('a'),
    barberId: 'b2',
    clientId: clients[6].id,
    serviceId: 's4',
    start: soon.toISOString(),
    duration: 60,
    status: 'upcoming',
    reminderSent: false,
    dayBeforeSent: false,
    reviewRequested: false,
    rating: null,
    reviewText: null,
    createdAt: now.toISOString(),
  });

  // --- Tomorrow ---
  push('b1', clients[6], 1, 9, 30, 's4', 'upcoming');
  push('b1', clients[7], 1, 11, 0, 's2', 'upcoming');
  push('b2', clients[0], 1, 11, 30, 's1', 'upcoming');
  push('b2', clients[2], 1, 15, 0, 's6', 'upcoming');
  push('b1', clients[4], 1, 17, 0, 's3', 'upcoming');

  // --- Day after tomorrow ---
  push('b2', clients[1], 2, 10, 0, 's4', 'upcoming');
  push('b1', clients[3], 2, 12, 0, 's2', 'upcoming');
  push('b2', clients[5], 2, 13, 30, 's1', 'upcoming');
  push('b1', clients[7], 2, 15, 30, 's5', 'upcoming');

  // --- A completed visit ~ a few hours ago, ready to trigger a review request ---
  const past = addMinutes(now, -150);
  appts.push({
    id: uid('a'),
    barberId: 'b1',
    clientId: clients[1].id,
    serviceId: 's2',
    start: past.toISOString(),
    duration: 45,
    status: 'completed',
    reminderSent: true,
    dayBeforeSent: true,
    reviewRequested: false,
    rating: null,
    reviewText: null,
    createdAt: addDays(now, -1).toISOString(),
  });

  // --- A completed visit yesterday, review already requested ---
  push('b2', clients[3], -1, 11, 0, 's1', 'completed');
  appts[appts.length - 1].reviewRequested = true;

  // --- A guest who visits like clockwork every week, no account yet ---
  // Demonstrates the "detect a weekly regular" nudge on load.
  push('b1', clients[8], -21, 14, 0, 's1', 'completed');
  push('b1', clients[8], -14, 14, 0, 's1', 'completed');
  push('b1', clients[8], -7, 14, 0, 's1', 'completed');

  // --- A client who hasn't been back in 75 days — demo case for the win-back campaign ---
  push('b2', clients[9], -75, 13, 0, 's1', 'completed');

  return appts;
}

const DEFAULT_TEMPLATES = {
  confirmation: "Hi {clientName}! ✅ You're booked for a {service} with {barberName} on {date} at {time} at {shopName}. We'll send a reminder beforehand. See you soon!",
  dayBefore: "Hi {clientName}! 📅 Just a heads up — you've got a {service} with {barberName} tomorrow at {time} at {shopName}. Can't make it? Change your time here: {rescheduleLink}. Reply STOP to opt out.",
  reminder: "Hi {clientName}! 👋 This is {barberName} from {shopName}. Just a reminder about your {service} appointment today at {time}. See you soon! Reply STOP to opt out.",
  review: "Hey {clientName}, thanks for coming in for your {service} with {barberName}! ✂️ We'd love it if you could leave us a quick review: {reviewLink} — it really helps the shop. Thank you!",
  accountNudge: "Hi {clientName}! We've noticed you've been coming in every week ✂️ — create a free account to lock in your weekly slot in advance and skip the booking hassle: {accountLink}. Reply STOP to opt out.",
  winback: "Hi {clientName}, we miss you at {shopName}! 👋 It's been {days} days since your last visit — come see us again: {bookLink}. Reply STOP to opt out.",
  referralReward: "Hi {clientName}! 🎉 {refereeName} just booked using your referral code — you've both earned ${amount} credit at {shopName}. Thanks for spreading the word!",
};

function seedState() {
  const clients = seedClients();
  const appointments = seedAppointments(clients);
  return {
    shopName: 'Fade & Faro',
    barbers: BARBERS,
    services: SERVICES,
    clients,
    appointments,
    recurringBookings: [], // {id, clientId, barberId, serviceId, frequency, firstStart, createdAt, active}
    messages: [], // {id, clientId, appointmentId, barberId, type: 'reminder'|'review'|'confirmation'|'accountNudge'|'recurringConfirmation', status:'pending'|'sent', body, scheduledFor, sentAt}
    templates: DEFAULT_TEMPLATES,
  };
}

// A freshly-launched shop from the agency wizard: no demo clients/history,
// just the barbers/services the owner entered during setup.
function seedEmptyShopState({ shopName, barbers = [], services = [] }) {
  return {
    shopName: shopName || 'New shop',
    barbers,
    services,
    clients: [],
    appointments: [],
    recurringBookings: [],
    messages: [],
    templates: DEFAULT_TEMPLATES,
  };
}

// ---- tiny external store ----------------------------------------------------
function loadState(shopId) {
  try {
    const raw = localStorage.getItem(shopStorageKey(shopId));
    if (raw) {
      const saved = JSON.parse(raw);
      // Merge in any template keys / fields added since this browser last saved state.
      saved.templates = { ...DEFAULT_TEMPLATES, ...saved.templates };
      saved.recurringBookings = (saved.recurringBookings || []).map(r => ({ bookedCount: 8, ...r }));
      saved.clients = (saved.clients || []).map(c => ({
        hasAccount: false, authUserId: null, accountNudgeSent: false,
        referredByCode: null, creditBalance: 0, referralRewardGranted: false, winbackSent: false,
        ...c,
        referralCode: c.referralCode || generateReferralCode(c.name),
      }));
      saved.appointments = (saved.appointments || []).map(a => ({ dayBeforeSent: false, rating: null, reviewText: null, ...a }));
      saved.barbers = (saved.barbers || []).map(b => ({ authUserId: null, timeOff: [], serviceOverrides: {}, ...b }));
      saved.messages = (saved.messages || []).map(m => ({ direction: 'out', ...m }));
      return saved;
    }
  } catch (e) { /* ignore corrupt storage */ }
  return shopId === DEFAULT_SHOP_ID ? seedState() : seedEmptyShopState({});
}

const Store = {
  shopId: DEFAULT_SHOP_ID,
  state: loadState(DEFAULT_SHOP_ID),
  listeners: new Set(),
  _unsubRealtime: null,
  get() { return this.state; },
  set(updater) {
    const prev = this.state;
    this.state = typeof updater === 'function' ? updater(this.state) : updater;
    try { localStorage.setItem(shopStorageKey(this.shopId), JSON.stringify(this.state)); } catch (e) {}
    this.listeners.forEach(fn => fn(this.state));
    syncStateToSupabase(this.shopId, prev, this.state);
  },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  reset() { this.set(seedState()); },
  // Switches the active shop. Pass `initialState` when launching a brand new
  // shop (writes it as that shop's first save); omit it to load an existing
  // shop's saved state from localStorage.
  switchShop(shopId, initialState) {
    this.shopId = shopId;
    this.state = initialState || loadState(shopId);
    try { localStorage.setItem(shopStorageKey(shopId), JSON.stringify(this.state)); } catch (e) {}
    this.listeners.forEach(fn => fn(this.state));
    this._connectSupabase(shopId);
  },
  // Pulls this shop's real state from Supabase (if configured) once it
  // resolves, and opens a Realtime subscription so appointments/messages/etc.
  // booked from another device or tab merge in live. No-op until
  // supabase-client.js has real project credentials.
  _connectSupabase(shopId) {
    if (this._unsubRealtime) { this._unsubRealtime(); this._unsubRealtime = null; }
    if (!SUPABASE_CONFIGURED) return;
    fetchShopStateFromSupabase(shopId).then(remote => {
      if (remote && this.shopId === shopId) {
        this.state = remote;
        try { localStorage.setItem(shopStorageKey(shopId), JSON.stringify(this.state)); } catch (e) {}
        this.listeners.forEach(fn => fn(this.state));
      }
    }).catch(e => console.warn('Supabase fetch failed', e));
    this._unsubRealtime = subscribeShopRealtime(shopId);
  },
};

function useStore() {
  const [state, setState] = React.useState(Store.get());
  React.useEffect(() => Store.subscribe(setState), []);
  return state;
}

// ---- agency layer: registry of shops, one level above the per-shop Store ----
const AGENCY_STORAGE_KEY = 'fadefaro_agency_v1';

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || uid('shop');
}

function loadAgencyState() {
  try {
    const raw = localStorage.getItem(AGENCY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore corrupt storage */ }
  // First run: register the existing single shop as the default so nothing
  // already saved under STORAGE_KEY is orphaned.
  return {
    shops: [{
      id: DEFAULT_SHOP_ID,
      name: 'Fade & Faro',
      slug: 'fade-and-faro',
      ownerName: '',
      ownerPhone: '',
      createdAt: new Date().toISOString(),
      setupComplete: true,
      status: 'active',
    }],
  };
}

const AgencyStore = {
  state: loadAgencyState(),
  listeners: new Set(),
  get() { return this.state; },
  set(updater) {
    const prev = this.state;
    this.state = typeof updater === 'function' ? updater(this.state) : updater;
    try { localStorage.setItem(AGENCY_STORAGE_KEY, JSON.stringify(this.state)); } catch (e) {}
    this.listeners.forEach(fn => fn(this.state));
    if (this.state.shops !== prev.shops) syncShopsListToSupabase(prev.shops, this.state.shops);
  },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  // Replaces the local shop registry with the signed-in owner's real shops
  // from Supabase, once auth is ready. No-op until configured/signed in.
  _refreshFromSupabase() {
    if (!SUPABASE_CONFIGURED) return;
    fetchOwnerShopsFromSupabase().then(shops => {
      if (shops && shops.length) this.set(s => ({ ...s, shops }));
    }).catch(e => console.warn('Supabase shops fetch failed', e));
  },
  getShop(id) { return this.state.shops.find(s => s.id === id); },
  createShop({ name, ownerName, ownerPhone }) {
    const shop = {
      id: uid('shop'),
      name,
      slug: slugify(name),
      ownerName,
      ownerPhone,
      createdAt: new Date().toISOString(),
      setupComplete: false,
      status: 'draft',
    };
    this.set(s => ({ ...s, shops: [...s.shops, shop] }));
    return shop;
  },
  updateShop(id, patch) {
    this.set(s => ({ ...s, shops: s.shops.map(sh => sh.id === id ? { ...sh, ...patch } : sh) }));
  },
  deleteShop(id) {
    try { localStorage.removeItem(shopStorageKey(id)); } catch (e) {}
    this.set(s => ({ ...s, shops: s.shops.filter(sh => sh.id !== id) }));
  },
};

function useAgencyStore() {
  const [state, setState] = React.useState(AgencyStore.get());
  React.useEffect(() => AgencyStore.subscribe(setState), []);
  return state;
}

// ---- derived lookups ----------------------------------------------------
function getBarber(state, id) { return state.barbers.find(b => b.id === id); }
function getClient(state, id) { return state.clients.find(c => c.id === id); }
function getService(state, id) { return state.services.find(s => s.id === id); }

function clientStats(state, clientId) {
  const visits = state.appointments.filter(a => a.clientId === clientId && a.status === 'completed');
  const last = visits.sort((a, b) => new Date(b.start) - new Date(a.start))[0];
  return { totalVisits: visits.length, lastVisit: last ? last.start : null };
}

// Lifetime value + churn status for the retention view — 30+ days since the
// last completed visit is "at risk", 60+ (matching the win-back threshold) is "churned".
function clientChurnInfo(state, clientId) {
  const visits = state.appointments.filter(a => a.clientId === clientId && a.status === 'completed');
  const revenue = visits.reduce((sum, a) => sum + (getEffectiveService(state, a.barberId, a.serviceId)?.price || 0), 0);
  const last = visits.sort((a, b) => new Date(b.start) - new Date(a.start))[0];
  const daysSince = last ? Math.floor(minutesBetween(new Date(), last.start) / 1440) : null;
  const status = daysSince == null ? 'No visits' : daysSince >= 60 ? 'Churned' : daysSince >= 30 ? 'At risk' : 'Active';
  return { revenue, visits: visits.length, daysSince, status };
}

// Merges a barber's per-service price/duration override onto the base
// service record. Everywhere price/duration is shown or used for booking
// math should read through this instead of the raw services array.
function getEffectiveService(state, barberId, serviceId) {
  const service = getService(state, serviceId);
  if (!service) return service;
  const barber = getBarber(state, barberId);
  const override = barber && barber.serviceOverrides ? barber.serviceOverrides[serviceId] : null;
  if (!override) return service;
  return { ...service, ...override };
}

function fillTemplate(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => (vars[key] != null ? vars[key] : `{${key}}`));
}

// ---- scheduling / availability ----------------------------------------------
// Booking granularity: candidate start times every 15 min. A slot is only
// offered if the full service duration fits before closing time and doesn't
// overlap any existing (non-cancelled) appointment for that barber that day.
// This is what makes longer services (e.g. a 60min combo) show fewer open
// slots than a quick 20min beard trim on the same busy day.
const SLOT_STEP_MIN = 15;
const MIN_LEAD_MIN = 30; // can't book starting less than 30 min from now

// A time-off entry is { id, start: ISOString, end: ISOString, label }. Blocks
// booking for that barber across the whole range without touching their
// regular weekly hours.
function isDateInTimeOff(barber, day) {
  if (!barber.timeOff || !barber.timeOff.length) return false;
  const dayStart = startOfDay(day).getTime();
  const dayEnd = addDays(startOfDay(day), 1).getTime();
  return barber.timeOff.some(t => new Date(t.start).getTime() < dayEnd && new Date(t.end).getTime() > dayStart);
}
function addTimeOff(barberId, { start, end, label }) {
  const entry = { id: uid('to'), start, end, label: label || 'Time off' };
  Store.set(s => ({ ...s, barbers: s.barbers.map(b => b.id === barberId ? { ...b, timeOff: [...(b.timeOff || []), entry] } : b) }));
  return entry;
}
function removeTimeOff(barberId, timeOffId) {
  Store.set(s => ({ ...s, barbers: s.barbers.map(b => b.id === barberId ? { ...b, timeOff: (b.timeOff || []).filter(t => t.id !== timeOffId) } : b) }));
}

function getAvailableSlots(state, barberId, day, durationMin, excludeApptId) {
  const barber = getBarber(state, barberId);
  if (isDateInTimeOff(barber, day)) return [];
  const dayStart = startOfDay(day);
  const startMin = barber.hours.start * 60;
  const endMin = barber.hours.end * 60;
  const now = new Date();
  const isToday = isSameDay(day, now);

  const busy = state.appointments
    .filter(a => a.barberId === barberId && a.status !== 'cancelled' && isSameDay(a.start, day) && a.id !== excludeApptId)
    .map(a => {
      const s = new Date(a.start).getTime();
      return [s, s + (a.duration || 30) * 60000];
    });

  const slots = [];
  for (let t = startMin; t + durationMin <= endMin; t += SLOT_STEP_MIN) {
    const slotStart = combineDateTime(dayStart, Math.floor(t / 60), t % 60);
    if (isToday && minutesBetween(slotStart, now) < MIN_LEAD_MIN) continue;
    const s0 = slotStart.getTime();
    const s1 = s0 + durationMin * 60000;
    const overlaps = busy.some(([bs, be]) => s0 < be && s1 > bs);
    if (!overlaps) slots.push(slotStart);
  }
  return slots;
}

function groupSlotsByPeriod(slots) {
  const groups = { Morning: [], Afternoon: [], Evening: [] };
  slots.forEach(s => {
    const h = s.getHours();
    if (h < 12) groups.Morning.push(s);
    else if (h < 17) groups.Afternoon.push(s);
    else groups.Evening.push(s);
  });
  return groups;
}

function normalizePhone(p) { return (p || '').replace(/\D/g, ''); }

// ---- appointment mutations --------------------------------------------------
function addAppointment(state, appt) {
  const created = { ...appt, id: uid('a'), reminderSent: false, dayBeforeSent: false, reviewRequested: false, rating: null, reviewText: null };
  Store.set(s => ({
    ...s,
    appointments: [...s.appointments, created],
    clients: s.clients.map(c => c.id === appt.clientId ? { ...c, winbackSent: false } : c),
  }));
  applyReferralRewardIfEligible(created);
  return created;
}
function updateAppointment(id, patch) {
  Store.set(s => ({ ...s, appointments: s.appointments.map(a => a.id === id ? { ...a, ...patch } : a) }));
}
// Moves a single appointment to a new time without touching the recurring
// series it may belong to — resets the reminder flags so both the day-before
// and hour-before messages queue again for the new slot.
function rescheduleAppointment(id, newStart) {
  Store.set(s => ({
    ...s,
    appointments: s.appointments.map(a => a.id === id
      ? { ...a, start: newStart.toISOString(), reminderSent: false, dayBeforeSent: false }
      : a),
  }));
}
function deleteAppointment(id) {
  Store.set(s => ({ ...s, appointments: s.appointments.filter(a => a.id !== id) }));
}
// Captures the star+comment left behind the (mock) review link — surfaced as
// a prompt in the client dashboard for any completed visit missing a rating.
function addReview(appointmentId, { rating, comment }) {
  Store.set(s => ({
    ...s,
    appointments: s.appointments.map(a => a.id === appointmentId ? { ...a, rating, reviewText: comment || '', reviewedAt: new Date().toISOString() } : a),
  }));
}
function addClient(client) {
  const c = {
    id: uid('c'), notes: '', hasAccount: false, authUserId: null, accountNudgeSent: false,
    referredByCode: null, creditBalance: 0, referralRewardGranted: false, winbackSent: false,
    createdAt: new Date().toISOString(),
    ...client,
    referralCode: generateReferralCode(client.name),
  };
  Store.set(s => ({ ...s, clients: [...s.clients, c] }));
  return c;
}
function updateClient(id, patch) {
  Store.set(s => ({ ...s, clients: s.clients.map(c => c.id === id ? { ...c, ...patch } : c) }));
}
function getClientByReferralCode(state, code) {
  if (!code) return null;
  const norm = code.trim().toUpperCase();
  return state.clients.find(c => (c.referralCode || '').toUpperCase() === norm) || null;
}
const REFERRAL_REWARD_AMOUNT = 10;
// Grants credit to both sides of a referral the first time the referred
// client's first-ever appointment is booked. Runs inside addAppointment.
function applyReferralRewardIfEligible(appt) {
  const s = Store.get();
  const referee = s.clients.find(c => c.id === appt.clientId);
  if (!referee || !referee.referredByCode || referee.referralRewardGranted) return;
  const priorVisits = s.appointments.filter(a => a.clientId === referee.id && a.id !== appt.id);
  if (priorVisits.length > 0) return;
  const referrer = getClientByReferralCode(s, referee.referredByCode);
  if (!referrer) return;
  Store.set(cur => ({
    ...cur,
    clients: cur.clients.map(c => {
      if (c.id === referee.id) return { ...c, referralRewardGranted: true, creditBalance: (c.creditBalance || 0) + REFERRAL_REWARD_AMOUNT };
      if (c.id === referrer.id) return { ...c, creditBalance: (c.creditBalance || 0) + REFERRAL_REWARD_AMOUNT };
      return c;
    }),
  }));
  queueReferralRewardMessage(Store.get(), referrer, referee);
}
function updateTemplates(patch) {
  Store.set(s => ({ ...s, templates: { ...s.templates, ...patch } }));
}

// ---- barber roster -----------------------------------------------------------
// Adding a barber here is all it takes for them to show up everywhere else —
// the public site's team section and booking flow, the admin calendar/sidebar,
// and the booking modal all read straight from state.barbers.
function addBarber(state, { name, title, phone, hours }) {
  const c = barberColor(state.barbers.length);
  const barber = {
    id: uid('b'), name, title: title || 'Barber', phone: phone || '',
    color: c, colorSoft: colorSoft(c),
    avatar: name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
    hours: hours || { start: 9, end: 18 },
    authUserId: null, timeOff: [], serviceOverrides: {},
  };
  Store.set(s => ({ ...s, barbers: [...s.barbers, barber] }));
  return barber;
}
function updateBarber(id, patch) {
  Store.set(s => ({ ...s, barbers: s.barbers.map(b => b.id === id ? { ...b, ...patch } : b) }));
}

// ---- client accounts ---------------------------------------------------------
// Real auth: a client "logs in" or "signs up" by verifying a text code sent
// to their phone (see sendPhoneOtp/verifyPhoneOtp/linkClientByPhone above),
// not by matching a PIN. findAccountByPhone stays as a lookup helper for the
// UI (e.g. showing "welcome back" before the code is even sent) and for
// migrating an existing guest record when they upgrade to a real account.
function findAccountByPhone(state, phone) {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  return state.clients.find(c => c.hasAccount && normalizePhone(c.phone) === digits) || null;
}

// Upgrades an existing guest client record (found by phone) so their prior
// visit history carries over instead of forking into a duplicate client.
// Call after verifyPhoneOtp() succeeds for a phone that already has guest
// visits on file but no linked auth user yet.
function upgradeGuestToAccount(state, { upgradeClientId, name, phone, authUserId }) {
  Store.set(s => ({
    ...s,
    clients: s.clients.map(c => c.id === upgradeClientId
      ? { ...c, name: name?.trim() || c.name, phone: phone?.trim() || c.phone, hasAccount: true, authUserId }
      : c),
  }));
  return getClient(Store.get(), upgradeClientId);
}

function daysSinceLastVisit(state, clientId) {
  const { lastVisit } = clientStats(state, clientId);
  if (!lastVisit) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(lastVisit).getTime()) / 86400000));
}

// ---- recurring bookings -------------------------------------------------------
// "monthly" is a 4-week rotation, not a calendar month — a calendar month
// would drift onto a different weekday each time (e.g. the 12th falls on a
// Monday one month and a Wednesday the next), which breaks a fixed weekly slot.
function addWeeksOrMonths(date, frequency, n) {
  const d = new Date(date);
  const days = frequency === 'monthly' ? 28 : frequency === 'biweekly' ? 14 : 7;
  d.setDate(d.getDate() + days * n);
  return d;
}

function isSlotFree(state, barberId, start, durationMin, excludeApptId) {
  const s0 = start.getTime();
  const s1 = s0 + durationMin * 60000;
  return !state.appointments.some(a => {
    if (a.barberId !== barberId || a.status === 'cancelled' || a.id === excludeApptId) return false;
    const bs = new Date(a.start).getTime();
    const be = bs + (a.duration || 30) * 60000;
    return s0 < be && s1 > bs;
  });
}

// Books the next `occurrences` visits up front at the same weekday/time so a
// regular client is locked in without rebooking each time. Any occurrence
// that would collide with an existing appointment is skipped rather than
// double-booked. `bookedCount` tracks how far into the weekly/biweekly/4-week
// sequence we've generated so far — topUpRecurringBookings() keeps advancing
// it so the series never runs out on its own; only cancelling stops it.
function createRecurringBooking(state, { clientId, barberId, serviceId, frequency, firstStart, occurrences = 8 }) {
  const service = getService(state, serviceId);
  const recurring = {
    id: uid('r'), clientId, barberId, serviceId, frequency,
    firstStart: firstStart.toISOString(),
    createdAt: new Date().toISOString(),
    active: true,
    bookedCount: occurrences,
  };
  const created = [];
  const skipped = [];
  for (let i = 0; i < occurrences; i++) {
    const start = addWeeksOrMonths(firstStart, frequency, i);
    if (isSlotFree(state, barberId, start, service.duration)) {
      created.push({
        id: uid('a'), barberId, clientId, serviceId,
        start: start.toISOString(), duration: service.duration,
        status: 'upcoming', reminderSent: false, dayBeforeSent: false, reviewRequested: false,
        recurringId: recurring.id,
      });
    } else {
      skipped.push(start);
    }
  }
  Store.set(s => ({ ...s, recurringBookings: [...s.recurringBookings, recurring], appointments: [...s.appointments, ...created] }));
  return { recurring, created, skipped };
}

function cancelRecurringBooking(id) {
  Store.set(s => ({
    ...s,
    recurringBookings: s.recurringBookings.map(r => r.id === id ? { ...r, active: false } : r),
    appointments: s.appointments.map(a => a.recurringId === id && a.status === 'upcoming' ? { ...a, status: 'cancelled' } : a),
  }));
}

// ---- keeping recurring slots going indefinitely -----------------------------
// A recurring booking only ever pre-books a batch of visits (RECURRING_TOPUP_TARGET)
// so the schedule doesn't fill up with years of appointments no one asked for.
// Once a client works through most of that batch, this tops it back up using
// the ORIGINAL firstStart + bookedCount as the sequence anchor (not the date of
// whatever appointment happens to be latest), so an individually rescheduled
// visit never shifts where the next batch picks up. Cancelling the recurring
// booking (active: false) is the only thing that stops this.
const RECURRING_TOPUP_THRESHOLD = 3; // top up once upcoming visits drop below this
const RECURRING_TOPUP_TARGET = 8;    // ...back up to this many upcoming visits
const RECURRING_TOPUP_MAX_LOOKAHEAD = 52; // safety cap on collision-skip retries

function topUpRecurringBookings(state) {
  const now = new Date();
  let appointments = state.appointments;
  const recurringPatches = [];

  state.recurringBookings.filter(r => r.active).forEach(r => {
    const upcomingCount = appointments.filter(a => a.recurringId === r.id && a.status === 'upcoming' && new Date(a.start) > now).length;
    if (upcomingCount >= RECURRING_TOPUP_THRESHOLD) return;

    const service = getService(state, r.serviceId);
    let bookedCount = r.bookedCount || 0;
    const newAppts = [];
    let guard = 0;
    while (newAppts.length < RECURRING_TOPUP_TARGET - upcomingCount && guard < RECURRING_TOPUP_MAX_LOOKAHEAD) {
      const start = addWeeksOrMonths(new Date(r.firstStart), r.frequency, bookedCount);
      bookedCount++;
      guard++;
      if (isSlotFree({ ...state, appointments }, r.barberId, start, service.duration)) {
        const appt = {
          id: uid('a'), barberId: r.barberId, clientId: r.clientId, serviceId: r.serviceId,
          start: start.toISOString(), duration: service.duration,
          status: 'upcoming', reminderSent: false, dayBeforeSent: false, reviewRequested: false,
          recurringId: r.id,
        };
        newAppts.push(appt);
        appointments = [...appointments, appt];
      }
    }
    if (bookedCount !== r.bookedCount) recurringPatches.push([r.id, bookedCount]);
  });

  if (recurringPatches.length) {
    Store.set(s => ({
      ...s,
      recurringBookings: s.recurringBookings.map(r => {
        const patch = recurringPatches.find(([id]) => id === r.id);
        return patch ? { ...r, bookedCount: patch[1] } : r;
      }),
      appointments,
    }));
  }
}

// ---- weekly-regular detection -------------------------------------------------
// Looks for accountless clients whose last 3 visits landed ~7 days apart and
// flags them once (via accountNudgeSent) so the message engine can nudge
// them to create an account and lock in a recurring slot.
function detectWeeklyRegulars(state) {
  const byClient = {};
  state.appointments.forEach(a => {
    if (a.status === 'cancelled') return;
    (byClient[a.clientId] = byClient[a.clientId] || []).push(a);
  });
  const flagged = [];
  Object.keys(byClient).forEach(clientId => {
    const client = getClient(state, clientId);
    if (!client || client.hasAccount || client.accountNudgeSent) return;
    const past = byClient[clientId]
      .map(a => new Date(a.start))
      .filter(d => d <= new Date())
      .sort((a, b) => a - b);
    if (past.length < 3) return;
    const [d1, d2, d3] = past.slice(-3);
    const gap1 = (d2 - d1) / 86400000;
    const gap2 = (d3 - d2) / 86400000;
    if (gap1 >= 5 && gap1 <= 9 && gap2 >= 5 && gap2 <= 9) flagged.push(clientId);
  });
  return flagged;
}

// ---------------------------------------------------------------------------
// Supabase sync layer.
// Everything above this line works purely against `state` in memory and
// knows nothing about where that state is persisted. Below here is the only
// place that talks to Supabase — it mirrors whatever Store.set()/AgencyStore
// .set() just changed into the real database in the background, and pulls
// remote changes (another tab, another device, another barber) back in via
// Realtime. All of it is a no-op (localStorage keeps working exactly as
// before) until supabase-client.js has real project credentials.
// ---------------------------------------------------------------------------

// Maps each top-level `state` collection to its Supabase table and the
// camelCase <-> snake_case field translation for one row.
const TABLE_SPECS = {
  barbers: {
    table: 'barbers',
    toRow: (b, shopId) => ({
      id: b.id, shop_id: shopId, auth_user_id: b.authUserId || null, name: b.name,
      title: b.title, color: b.color, color_soft: b.colorSoft, avatar: b.avatar,
      hours: b.hours, phone: b.phone, time_off: b.timeOff || [], service_overrides: b.serviceOverrides || {},
    }),
    fromRow: r => ({
      id: r.id, authUserId: r.auth_user_id, name: r.name, title: r.title, color: r.color,
      colorSoft: r.color_soft, avatar: r.avatar, hours: r.hours, phone: r.phone,
      timeOff: r.time_off || [], serviceOverrides: r.service_overrides || {},
    }),
  },
  services: {
    table: 'services',
    toRow: (s, shopId) => ({ id: s.id, shop_id: shopId, name: s.name, duration: s.duration, price: s.price }),
    fromRow: r => ({ id: r.id, name: r.name, duration: r.duration, price: Number(r.price) }),
  },
  clients: {
    table: 'clients',
    toRow: (c, shopId) => ({
      id: c.id, shop_id: shopId, auth_user_id: c.authUserId || null, name: c.name, phone: c.phone,
      notes: c.notes || '', has_account: !!c.hasAccount, account_nudge_sent: !!c.accountNudgeSent,
      referral_code: c.referralCode, referred_by_code: c.referredByCode, credit_balance: c.creditBalance || 0,
      referral_reward_granted: !!c.referralRewardGranted, winback_sent: !!c.winbackSent, created_at: c.createdAt,
    }),
    fromRow: r => ({
      id: r.id, authUserId: r.auth_user_id, name: r.name, phone: r.phone, notes: r.notes || '',
      hasAccount: r.has_account, accountNudgeSent: r.account_nudge_sent, referralCode: r.referral_code,
      referredByCode: r.referred_by_code, creditBalance: Number(r.credit_balance || 0),
      referralRewardGranted: r.referral_reward_granted, winbackSent: r.winback_sent, createdAt: r.created_at,
    }),
  },
  appointments: {
    table: 'appointments',
    toRow: (a, shopId) => ({
      id: a.id, shop_id: shopId, barber_id: a.barberId, client_id: a.clientId, service_id: a.serviceId,
      start: a.start, duration: a.duration, status: a.status, reminder_sent: !!a.reminderSent,
      day_before_sent: !!a.dayBeforeSent, review_requested: !!a.reviewRequested, rating: a.rating,
      review_text: a.reviewText, reviewed_at: a.reviewedAt || null, recurring_id: a.recurringId || null,
      created_at: a.createdAt,
    }),
    fromRow: r => ({
      id: r.id, barberId: r.barber_id, clientId: r.client_id, serviceId: r.service_id, start: r.start,
      duration: r.duration, status: r.status, reminderSent: r.reminder_sent, dayBeforeSent: r.day_before_sent,
      reviewRequested: r.review_requested, rating: r.rating, reviewText: r.review_text,
      reviewedAt: r.reviewed_at, recurringId: r.recurring_id, createdAt: r.created_at,
    }),
  },
  recurringBookings: {
    table: 'recurring_bookings',
    toRow: (r, shopId) => ({
      id: r.id, shop_id: shopId, client_id: r.clientId, barber_id: r.barberId, service_id: r.serviceId,
      frequency: r.frequency, first_start: r.firstStart, active: !!r.active, booked_count: r.bookedCount || 0,
      created_at: r.createdAt,
    }),
    fromRow: r => ({
      id: r.id, clientId: r.client_id, barberId: r.barber_id, serviceId: r.service_id, frequency: r.frequency,
      firstStart: r.first_start, active: r.active, bookedCount: r.booked_count, createdAt: r.created_at,
    }),
  },
  messages: {
    table: 'messages',
    toRow: (m, shopId) => ({
      id: m.id, shop_id: shopId, type: m.type, appointment_id: m.appointmentId, client_id: m.clientId,
      barber_id: m.barberId, direction: m.direction, status: m.status, body: m.body,
      scheduled_for: m.scheduledFor, sent_at: m.sentAt || null,
    }),
    fromRow: r => ({
      id: r.id, type: r.type, appointmentId: r.appointment_id, clientId: r.client_id, barberId: r.barber_id,
      direction: r.direction, status: r.status, body: r.body, scheduledFor: r.scheduled_for, sentAt: r.sent_at,
    }),
  },
};

async function fetchShopStateFromSupabase(shopId) {
  if (!SUPABASE_CONFIGURED) return null;
  const { data: shopRow } = await supabaseClient.from('shops').select('*').eq('id', shopId).maybeSingle();
  if (!shopRow) return null; // not migrated to the cloud yet — keep using localStorage
  const collections = {};
  await Promise.all(Object.keys(TABLE_SPECS).map(async key => {
    const spec = TABLE_SPECS[key];
    const { data, error } = await supabaseClient.from(spec.table).select('*').eq('shop_id', shopId);
    collections[key] = error || !data ? [] : data.map(spec.fromRow);
  }));
  const { data: tplRow } = await supabaseClient.from('templates').select('data').eq('shop_id', shopId).maybeSingle();
  return {
    shopName: shopRow.name,
    ...collections,
    templates: { ...DEFAULT_TEMPLATES, ...(tplRow ? tplRow.data : {}) },
  };
}

// Upserts every row of one collection and deletes any that were removed.
// Re-sends the whole array rather than a granular per-field diff — simple,
// idempotent, and plenty fast at a single barbershop's data volume.
async function syncCollection(shopId, key, prevArr, nextArr) {
  const spec = TABLE_SPECS[key];
  try {
    const prevIds = new Set((prevArr || []).map(x => x.id));
    const nextIds = new Set((nextArr || []).map(x => x.id));
    const removed = [...prevIds].filter(id => !nextIds.has(id));
    const rows = (nextArr || []).map(x => spec.toRow(x, shopId));
    if (rows.length) {
      const { error } = await supabaseClient.from(spec.table).upsert(rows);
      if (error) console.warn('Supabase upsert failed for', key, error.message);
    }
    if (removed.length) {
      const { error } = await supabaseClient.from(spec.table).delete().in('id', removed);
      if (error) console.warn('Supabase delete failed for', key, error.message);
    }
  } catch (e) { console.warn('Supabase sync failed for', key, e); }
}

function syncStateToSupabase(shopId, prevState, nextState) {
  if (!SUPABASE_CONFIGURED) return;
  Object.keys(TABLE_SPECS).forEach(key => {
    if (nextState[key] !== prevState[key]) syncCollection(shopId, key, prevState[key], nextState[key]);
  });
  if (nextState.shopName !== prevState.shopName) {
    supabaseClient.from('shops').update({ name: nextState.shopName }).eq('id', shopId)
      .then(({ error }) => { if (error) console.warn('Supabase shop-name sync failed', error.message); });
  }
  if (nextState.templates !== prevState.templates) {
    supabaseClient.from('templates').upsert({ shop_id: shopId, data: nextState.templates })
      .then(({ error }) => { if (error) console.warn('Supabase templates sync failed', error.message); });
  }
}

// Publishes the shop's full current local state to Supabase for the first
// time — call this once, right after an owner signs in, if fetchShopState
// came back null (meaning this shop only exists in this browser so far).
async function pushShopStateToSupabase(shopId, state) {
  if (!SUPABASE_CONFIGURED) return;
  const user = getAuthUser();
  if (!user) return;
  const agencyShop = AgencyStore.getShop(shopId);
  await supabaseClient.from('shops').upsert({
    id: shopId,
    owner_id: user.id,
    name: state.shopName,
    slug: agencyShop ? agencyShop.slug : slugify(state.shopName || shopId),
    owner_name: agencyShop ? agencyShop.ownerName : '',
    owner_phone: agencyShop ? agencyShop.ownerPhone : '',
    setup_complete: true,
    status: 'active',
  });
  await Promise.all(Object.keys(TABLE_SPECS).map(key => syncCollection(shopId, key, [], state[key] || [])));
  await supabaseClient.from('templates').upsert({ shop_id: shopId, data: state.templates });
}

function subscribeShopRealtime(shopId) {
  if (!SUPABASE_CONFIGURED) return () => {};
  const channel = supabaseClient.channel('shop-' + shopId);
  Object.keys(TABLE_SPECS).forEach(key => {
    const spec = TABLE_SPECS[key];
    channel.on('postgres_changes', { event: '*', schema: 'public', table: spec.table, filter: `shop_id=eq.${shopId}` }, payload => {
      mergeRealtimeChange(shopId, key, payload);
    });
  });
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'shops', filter: `id=eq.${shopId}` }, payload => {
    if (Store.shopId === shopId && payload.new && payload.new.name != null) {
      Store.state = { ...Store.state, shopName: payload.new.name };
      Store.listeners.forEach(fn => fn(Store.state));
    }
  });
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'templates', filter: `shop_id=eq.${shopId}` }, payload => {
    if (Store.shopId === shopId && payload.new) {
      Store.state = { ...Store.state, templates: { ...DEFAULT_TEMPLATES, ...payload.new.data } };
      Store.listeners.forEach(fn => fn(Store.state));
    }
  });
  channel.subscribe();
  return () => { try { supabaseClient.removeChannel(channel); } catch (e) {} };
}

function mergeRealtimeChange(shopId, key, payload) {
  if (Store.shopId !== shopId) return;
  const spec = TABLE_SPECS[key];
  const arr = Store.state[key] || [];
  let nextArr;
  if (payload.eventType === 'DELETE') {
    nextArr = arr.filter(x => x.id !== payload.old.id);
  } else {
    const mapped = spec.fromRow(payload.new);
    const idx = arr.findIndex(x => x.id === mapped.id);
    nextArr = idx >= 0 ? arr.map((x, i) => i === idx ? mapped : x) : [...arr, mapped];
  }
  Store.state = { ...Store.state, [key]: nextArr };
  try { localStorage.setItem(shopStorageKey(shopId), JSON.stringify(Store.state)); } catch (e) {}
  Store.listeners.forEach(fn => fn(Store.state));
}

// ---- agency-level (shops list) sync -----------------------------------------
async function syncShopsListToSupabase(prevShops, nextShops) {
  if (!SUPABASE_CONFIGURED) return;
  const user = getAuthUser();
  if (!user) return; // shop rows require an owner_id; nothing to attribute to yet
  try {
    const prevIds = new Set((prevShops || []).map(s => s.id));
    const nextIds = new Set((nextShops || []).map(s => s.id));
    const removed = [...prevIds].filter(id => !nextIds.has(id));
    const rows = (nextShops || []).map(s => ({
      id: s.id, owner_id: user.id, name: s.name, slug: s.slug, owner_name: s.ownerName,
      owner_phone: s.ownerPhone, setup_complete: !!s.setupComplete, status: s.status,
    }));
    if (rows.length) await supabaseClient.from('shops').upsert(rows);
    if (removed.length) await supabaseClient.from('shops').delete().in('id', removed);
  } catch (e) { console.warn('Supabase shops-list sync failed', e); }
}

async function fetchOwnerShopsFromSupabase() {
  if (!SUPABASE_CONFIGURED) return null;
  const user = getAuthUser();
  if (!user) return null;
  const { data, error } = await supabaseClient.from('shops').select('*').eq('owner_id', user.id);
  if (error || !data || !data.length) return null;
  return data.map(r => ({
    id: r.id, name: r.name, slug: r.slug, ownerName: r.owner_name, ownerPhone: r.owner_phone,
    createdAt: r.created_at, setupComplete: r.setup_complete, status: r.status,
  }));
}

// ---- auth ---------------------------------------------------------------
// Shop owners: real email/password accounts. Barbers and clients: phone-OTP
// (a text with a 6-digit code, sent through the same Twilio account/number
// used for the rest of the app's messaging) instead of the old shared
// 4-digit PIN — this is the one part of "making it real" that changes the
// login UX, since there's no way to verify a phone number is really someone's
// without sending something to it.
let _authUser = null;
const _authListeners = new Set();
function getAuthUser() { return _authUser; }
function subscribeAuthUser(fn) { _authListeners.add(fn); return () => _authListeners.delete(fn); }
function useAuthUser() {
  const [user, setUser] = React.useState(_authUser);
  React.useEffect(() => subscribeAuthUser(setUser), []);
  return user;
}
if (SUPABASE_CONFIGURED) {
  supabaseClient.auth.getUser().then(({ data }) => {
    _authUser = data.user || null;
    _authListeners.forEach(fn => fn(_authUser));
  });
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    _authUser = session ? session.user : null;
    _authListeners.forEach(fn => fn(_authUser));
  });
}

function requireSupabase() {
  if (!SUPABASE_CONFIGURED) throw new Error('Backend not connected yet — add your Supabase project URL/key to supabase-client.js.');
}
// Updates _authUser synchronously from the just-resolved signUp/signIn result
// instead of waiting for onAuthStateChange to fire — that listener can lag
// just enough that a caller reading getAuthUser() on the very next line
// (e.g. ensureShopInCloud, called right after owner sign-in) still sees null.
function setAuthUser(user) {
  _authUser = user;
  _authListeners.forEach(fn => fn(_authUser));
}
async function signUpOwner(email, password) {
  requireSupabase();
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  setAuthUser(data.user);
  return data.user;
}
async function signInOwner(email, password) {
  requireSupabase();
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  setAuthUser(data.user);
  return data.user;
}
async function signOutAuth() {
  if (!SUPABASE_CONFIGURED) return;
  await supabaseClient.auth.signOut();
}
async function sendPhoneOtp(phone) {
  requireSupabase();
  const { error } = await supabaseClient.auth.signInWithOtp({ phone });
  if (error) throw error;
}
async function verifyPhoneOtp(phone, token) {
  requireSupabase();
  const { data, error } = await supabaseClient.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw error;
  return data.user;
}
// Call right after a barber verifies their code — links (or confirms) their
// auth session to a barbers row whose phone number matches.
// Call once an owner is signed in — if this shop has never been pushed to
// Supabase before (fetchShopStateFromSupabase comes back null), publishes
// the current local/demo state as that shop's first cloud copy so it's no
// longer stuck in one browser's localStorage.
async function ensureShopInCloud(shopId) {
  if (!SUPABASE_CONFIGURED) return;
  const user = getAuthUser();
  if (!user) return;
  const remote = await fetchShopStateFromSupabase(shopId);
  if (!remote) {
    await pushShopStateToSupabase(shopId, Store.get());
    Store._connectSupabase(shopId);
  }
}
async function linkBarberByPhone() {
  requireSupabase();
  const { data, error } = await supabaseClient.rpc('link_barber_by_phone');
  if (error) throw error;
  return data; // barber id, or null if no barber has this phone number
}
// Same idea for clients — creates a new client row if this phone has never
// booked before, so phone-OTP alone is enough to "sign up".
async function linkClientByPhone(shopId) {
  requireSupabase();
  const { data, error } = await supabaseClient.rpc('link_client_by_phone', { p_shop_id: shopId });
  if (error) throw error;
  return data; // client id
}

// Deferred to here (end of file) since it depends on fetchShopStateFromSupabase
// and subscribeShopRealtime, which are declared further down than Store itself.
// Deferred to here (end of file) since it depends on fetchShopStateFromSupabase
// and subscribeShopRealtime, which are declared further down than Store itself.
if (SUPABASE_CONFIGURED) Store._connectSupabase(DEFAULT_SHOP_ID);
// Fills in a freshly-linked client's name/referral code directly against
// Supabase (their own row, allowed by RLS via auth_user_id = auth.uid())
// rather than through Store.set, since the row may not have reached local
// `state` via Realtime yet right after linking.
async function patchOwnClientProfile(clientId, { name, referredByCode } = {}) {
  if (!SUPABASE_CONFIGURED) return;
  const row = {};
  if (name) row.name = name;
  if (referredByCode) row.referred_by_code = referredByCode;
  if (!Object.keys(row).length) return;
  const { error } = await supabaseClient.from('clients').update(row).eq('id', clientId);
  if (error) console.warn('patchOwnClientProfile failed', error.message);
}
