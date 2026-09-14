// ---------------------------------------------------------------------------
// App shell + pages
// ---------------------------------------------------------------------------

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'clients', label: 'Clients', icon: 'users' },
  { id: 'staff', label: 'Staff', icon: 'scissors' },
  { id: 'messages', label: 'Messages', icon: 'message' },
  { id: 'reports', label: 'Reports', icon: 'dashboard' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

function Sidebar({ page, setPage, state, onExitToSite, navItems }) {
  const items = navItems || NAV;
  const pendingMsgs = state.messages.filter(m => m.status === 'pending').length;
  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-ink-900 border-r border-ink-800 flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
          <Icon name="scissors" className="w-5 h-5 text-ink-950" />
        </div>
        <div>
          <div className="font-display font-extrabold text-[15px] leading-tight">{state.shopName || 'Fade & Faro'}</div>
          <div className="text-[11px] text-slate-500 leading-tight">Barber CRM</div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {items.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${page === item.id ? 'bg-brand-500/15 text-brand-300' : 'text-slate-400 hover:text-slate-100 hover:bg-ink-800'}`}>
            <Icon name={item.icon} className="w-[18px] h-[18px]" />
            {item.label}
            {item.id === 'messages' && pendingMsgs > 0 && (
              <span className="ml-auto bg-amber-500 text-ink-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{pendingMsgs}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-3 space-y-1.5 border-t border-ink-800">
        {state.barbers.map(b => (
          <div key={b.id} className="flex items-center gap-2.5 px-3 py-2">
            <Avatar name={b.name} color={b.color} size={7} />
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{b.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{b.title}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-ink-800">
        <button onClick={onExitToSite} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-200 hover:bg-ink-800 transition">
          <Icon name="chevronLeft" className="w-4 h-4" /> View public booking site
        </button>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, action }) {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  return (
    <header className="flex items-center justify-between px-8 py-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium tabular-nums">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
          <div className="text-[11px] text-slate-500">{now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
        </div>
        {action}
      </div>
    </header>
  );
}

// ---- Dashboard ---------------------------------------------------------------
function StatCard({ icon, label, value, tone }) {
  const tones = { green: 'text-brand-400 bg-brand-500/10', amber: 'text-amber-400 bg-amber-500/10', blue: 'text-sky-400 bg-sky-500/10', slate: 'text-slate-300 bg-ink-700' };
  return (
    <div className="bg-ink-850 border border-ink-700 rounded-2xl p-4 flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones[tone]}`}><Icon name={icon} className="w-5 h-5" /></div>
      <div>
        <div className="text-2xl font-display font-extrabold leading-none">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

function AppointmentRow({ state, appt, onOpen }) {
  const client = getClient(state, appt.clientId);
  const barber = getBarber(state, appt.barberId);
  const service = getService(state, appt.serviceId);
  return (
    <button onClick={() => onOpen(appt)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-ink-800 transition text-left group">
      <div className="w-14 shrink-0 text-xs font-semibold tabular-nums text-slate-300">{fmtTime(appt.start)}</div>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: barber.color }} />
      <Avatar name={client.name} size={7} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{client.name}</div>
        <div className="text-xs text-slate-500 truncate">{service.name} · {barber.name.split(' ')[0]}</div>
      </div>
      <Badge tone={statusTone(appt.status)}>{appt.status}</Badge>
    </button>
  );
}

function DashboardPage({ state, onOpenAppt, onNewAppt }) {
  const today = startOfDay(new Date());
  const days = [0, 1, 2].map(n => addDays(today, n));
  const inNext3Days = state.appointments.filter(a => {
    const d = startOfDay(a.start);
    return d >= today && d <= days[2] && a.status !== 'cancelled';
  });
  const todays = inNext3Days.filter(a => isSameDay(a.start, today));
  const pendingReminders = state.messages.filter(m => m.type === 'reminder' && m.status === 'pending').length;
  const pendingReviews = state.messages.filter(m => m.type === 'review' && m.status === 'pending').length;

  return (
    <div className="px-8 pb-10 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="calendar" label="Appointments today" value={todays.length} tone="blue" />
        <StatCard icon="clock" label="Next 3 days" value={inNext3Days.length} tone="green" />
        <StatCard icon="bell" label="Reminders pending" value={pendingReminders} tone="amber" />
        <StatCard icon="star" label="Review requests pending" value={pendingReviews} tone="slate" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {days.map(day => {
          const dayAppts = inNext3Days.filter(a => isSameDay(a.start, day)).sort((a, b) => new Date(a.start) - new Date(b.start));
          return (
            <div key={day.toISOString()} className="bg-ink-850 border border-ink-700 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-ink-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{fmtDayLabel(day)}</div>
                  <div className="text-[11px] text-slate-500">{day.toLocaleDateString([], { weekday: 'long' })}</div>
                </div>
                <Badge>{dayAppts.length}</Badge>
              </div>
              <div className="p-1.5 space-y-0.5 flex-1 max-h-[440px] overflow-y-auto">
                {dayAppts.length === 0 && <div className="text-xs text-slate-600 text-center py-8">No appointments</div>}
                {dayAppts.map(a => <AppointmentRow key={a.id} state={state} appt={a} onOpen={onOpenAppt} />)}
              </div>
              <div className="p-2.5 border-t border-ink-700">
                <Button size="sm" variant="ghost" className="w-full" onClick={() => onNewAppt(null, day)}>
                  <Icon name="plus" className="w-3.5 h-3.5" /> Add appointment
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Calendar / Booking -------------------------------------------------------
function timeToMinutes(hh, mm) { return hh * 60 + mm; }

function CalendarPage({ state, onOpenAppt, onNewAppt }) {
  const [barberId, setBarberId] = React.useState(state.barbers[0].id);
  const [weekStart, setWeekStart] = React.useState(startOfDay(new Date()));
  const barber = getBarber(state, barberId);
  const rowH = 44;
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  const startMin = barber.hours.start * 60;
  const endMin = barber.hours.end * 60;
  const slots = [];
  for (let t = startMin; t < endMin; t += 30) slots.push(t);

  const apptsByDay = day => state.appointments.filter(a => a.barberId === barberId && isSameDay(a.start, day) && a.status !== 'cancelled');

  return (
    <div className="px-8 pb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 bg-ink-850 border border-ink-700 rounded-xl p-1">
          {state.barbers.map(b => (
            <button key={b.id} onClick={() => setBarberId(b.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${barberId === b.id ? 'bg-ink-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Avatar name={b.name} color={b.color} size={6} />
              {b.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(addDays(weekStart, -5))} className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink-600 hover:border-ink-500"><Icon name="chevronLeft" className="w-4 h-4" /></button>
          <button onClick={() => setWeekStart(startOfDay(new Date()))} className="px-3 py-2 rounded-lg border border-ink-600 hover:border-ink-500 text-sm">Today</button>
          <button onClick={() => setWeekStart(addDays(weekStart, 5))} className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink-600 hover:border-ink-500"><Icon name="chevronRight" className="w-4 h-4" /></button>
          <Button onClick={() => onNewAppt(barberId, new Date())}><Icon name="plus" className="w-4 h-4" />New appointment</Button>
        </div>
      </div>

      <div className="bg-ink-850 border border-ink-700 rounded-2xl overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          <div className="border-b border-r border-ink-700" />
          {days.map(d => (
            <div key={d.toISOString()} className={`border-b border-r last:border-r-0 border-ink-700 px-3 py-2.5 text-center ${isSameDay(d, new Date()) ? 'bg-brand-500/5' : ''}`}>
              <div className="text-xs text-slate-500">{d.toLocaleDateString([], { weekday: 'short' })}</div>
              <div className="text-sm font-semibold">{d.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)`, maxHeight: '620px', overflowY: 'auto' }}>
          <div className="border-r border-ink-700">
            {slots.map(t => (
              <div key={t} style={{ height: rowH }} className="text-[10px] text-slate-500 text-right pr-2 -translate-y-2 border-b border-ink-800">
                {t % 60 === 0 ? `${((t / 60 + 11) % 12) + 1}${t / 60 < 12 ? 'am' : 'pm'}` : ''}
              </div>
            ))}
          </div>
          {days.map(day => {
            const dayAppts = apptsByDay(day);
            return (
              <div key={day.toISOString()} className="relative border-r last:border-r-0 border-ink-700">
                {slots.map(t => (
                  <button key={t} style={{ height: rowH }}
                    onClick={() => onNewAppt(barberId, day, `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`)}
                    className="w-full border-b border-ink-800 hover:bg-ink-800/60 transition block" />
                ))}
                <div className="absolute inset-0 pointer-events-none px-1">
                  {dayAppts.map(a => {
                    const d = new Date(a.start);
                    const mins = timeToMinutes(d.getHours(), d.getMinutes());
                    const top = ((mins - startMin) / 30) * rowH;
                    const height = Math.max((a.duration / 30) * rowH - 2, 20);
                    const client = getClient(state, a.clientId);
                    const service = getService(state, a.serviceId);
                    return (
                      <div key={a.id} onClick={() => onOpenAppt(a)}
                        style={{ top, height, background: barber.colorSoft, borderColor: barber.color }}
                        className="pointer-events-auto absolute left-1 right-1 rounded-lg border-l-[3px] px-2 py-1 overflow-hidden cursor-pointer hover:brightness-125 transition">
                        <div className="text-[11px] font-semibold truncate" style={{ color: barber.color }}>{client.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{service.name} · {fmtTime(a.start)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Clients -------------------------------------------------------------
function ClientDetail({ state, client, onClose, onOpenAppt }) {
  const history = state.appointments.filter(a => a.clientId === client.id).sort((a, b) => new Date(b.start) - new Date(a.start));
  const msgs = state.messages.filter(m => m.clientId === client.id).sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor));
  const { totalVisits } = clientStats(state, client.id);
  return (
    <Modal open={!!client} onClose={onClose} title="Client profile" width="max-w-2xl">
      <div className="flex items-center gap-3.5 mb-5">
        <Avatar name={client.name} size={12} />
        <div>
          <div className="font-display font-bold text-lg">{client.name}</div>
          <div className="text-sm text-slate-500 flex items-center gap-1.5"><Icon name="phone" className="w-3.5 h-3.5" />{client.phone}</div>
        </div>
        <Badge tone="green">{totalVisits} visits</Badge>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Appointment history</div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {history.length === 0 && <div className="text-sm text-slate-600">No appointments yet.</div>}
            {history.map(a => {
              const barber = getBarber(state, a.barberId);
              const service = getService(state, a.serviceId);
              return (
                <button key={a.id} onClick={() => onOpenAppt(a)} className="w-full text-left bg-ink-900 hover:bg-ink-800 rounded-lg px-3 py-2 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{service.name}</span>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{fmtDateTime(a.start)} · {barber.name.split(' ')[0]}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">WhatsApp message log</div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {msgs.length === 0 && <div className="text-sm text-slate-600">No messages yet.</div>}
            {msgs.map(m => (
              <div key={m.id} className="bg-ink-900 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{m.type}</span>
                  <Badge tone={m.status === 'sent' ? 'green' : 'amber'}>{m.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{m.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ClientsPage({ state, onOpenAppt }) {
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const filtered = state.clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query));

  return (
    <div className="px-8 pb-10">
      <div className="relative mb-5 max-w-sm">
        <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className={inputCls + ' pl-9'} placeholder="Search clients..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      <div className="bg-ink-850 border border-ink-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-ink-700">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Visits</th>
              <th className="px-4 py-3 font-medium">Last visit</th>
              <th className="px-4 py-3 font-medium">Lifetime value</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const { totalVisits, lastVisit } = clientStats(state, c.id);
              const churn = clientChurnInfo(state, c.id);
              const churnTone = { Active: 'green', 'At risk': 'amber', Churned: 'red', 'No visits': 'slate' }[churn.status];
              return (
                <tr key={c.id} className="border-b border-ink-800 last:border-0 hover:bg-ink-800/50 transition cursor-pointer" onClick={() => setSelected(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} size={7} />
                      <span className="font-medium">{c.name}</span>
                      {totalVisits >= 3 && <Badge tone="green">Regular</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.phone}</td>
                  <td className="px-4 py-3 text-slate-400">{totalVisits}</td>
                  <td className="px-4 py-3 text-slate-400">{lastVisit ? fmtDateShort(lastVisit) : '—'}</td>
                  <td className="px-4 py-3 text-slate-300 font-medium">${churn.revenue}</td>
                  <td className="px-4 py-3"><Badge tone={churnTone}>{churn.status}</Badge></td>
                  <td className="px-4 py-3 text-right text-slate-500"><Icon name="chevronRight" className="w-4 h-4 inline" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected && <ClientDetail state={state} client={selected} onClose={() => setSelected(null)} onOpenAppt={a => { setSelected(null); onOpenAppt(a); }} />}
    </div>
  );
}

// ---- Messages / WhatsApp center ------------------------------------------------
function messageTypeTone(type) { return { confirmation: 'green', dayBefore: 'blue', reminder: 'blue', review: 'amber', accountNudge: 'red', recurringConfirmation: 'green', winback: 'amber', referralReward: 'green', broadcast: 'blue', reply: 'slate' }[type] || 'slate'; }
function messageTypeLabel(type) { return { confirmation: 'Booking confirmation', dayBefore: 'Day-before reminder', reminder: 'Appointment reminder', review: 'Review request', accountNudge: 'Account nudge', recurringConfirmation: 'Recurring slot locked in', winback: 'Win-back nudge', referralReward: 'Referral reward', broadcast: 'Broadcast', reply: 'Reply' }[type] || type; }

// ---- Conversations: two-way reply thread per client ------------------------
function ConversationThread({ state, client }) {
  const [text, setText] = React.useState('');
  const [simText, setSimText] = React.useState('');
  const [simulating, setSimulating] = React.useState(false);
  const msgs = state.messages.filter(m => m.clientId === client.id).sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
  const lastBarberId = [...msgs].reverse().find(m => m.barberId)?.barberId || state.barbers[0]?.id;
  const scrollRef = React.useRef(null);
  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs.length]);

  return (
    <div className="bg-ink-850 border border-ink-700 rounded-2xl flex flex-col h-[620px]">
      <div className="px-4 py-3 border-b border-ink-700 flex items-center gap-2.5">
        <Avatar name={client.name} size={8} />
        <div>
          <div className="text-sm font-semibold">{client.name}</div>
          <div className="text-xs text-slate-500">{client.phone}</div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {msgs.length === 0 && <div className="text-sm text-slate-600 text-center py-10">No messages with this client yet.</div>}
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.direction === 'in' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-[13px] ${m.direction === 'in' ? 'bg-ink-700 text-slate-100' : 'bg-[#005c4b] text-emerald-50'}`}>
              <div className="whitespace-pre-wrap">{m.body}</div>
              <div className="text-[10px] opacity-60 mt-1 flex items-center gap-1.5">
                {m.type !== 'reply' && <Badge tone={messageTypeTone(m.type)}>{messageTypeLabel(m.type)}</Badge>}
                <span>{fmtDateTime(m.scheduledFor)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-ink-700 space-y-2">
        {simulating ? (
          <div className="flex gap-2">
            <input autoFocus className={inputCls} placeholder={`Type a reply as ${client.name.split(' ')[0]}...`} value={simText}
              onChange={e => setSimText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && simText.trim()) { simulateIncomingReply(client.id, lastBarberId, simText.trim()); setSimText(''); setSimulating(false); } }} />
            <Button size="sm" disabled={!simText.trim()} onClick={() => { simulateIncomingReply(client.id, lastBarberId, simText.trim()); setSimText(''); setSimulating(false); }}>Send</Button>
            <Button size="sm" variant="ghost" onClick={() => setSimulating(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input className={inputCls} placeholder="Reply as the shop..." value={text}
              onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && text.trim()) { sendReply(client.id, lastBarberId, text.trim()); setText(''); } }} />
            <Button size="sm" disabled={!text.trim()} onClick={() => { sendReply(client.id, lastBarberId, text.trim()); setText(''); }}><Icon name="send" className="w-4 h-4" /></Button>
          </div>
        )}
        {!simulating && (
          <button onClick={() => setSimulating(true)} className="text-[11px] text-slate-500 hover:text-slate-300">
            Simulate an incoming reply from {client.name.split(' ')[0]} (no live WhatsApp connection yet)
          </button>
        )}
      </div>
    </div>
  );
}

function ConversationsPage({ state }) {
  const [query, setQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState(null);
  const clientsWithMsgs = state.clients
    .map(c => ({ client: c, last: [...state.messages].filter(m => m.clientId === c.id).sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor))[0] }))
    .filter(x => x.last)
    .filter(x => x.client.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => new Date(b.last.scheduledFor) - new Date(a.last.scheduledFor));

  React.useEffect(() => { if (!selectedId && clientsWithMsgs.length) setSelectedId(clientsWithMsgs[0].client.id); }, [clientsWithMsgs.length]);
  const selectedClient = state.clients.find(c => c.id === selectedId);

  return (
    <div className="flex gap-5">
      <div className="w-[320px] shrink-0">
        <input className={inputCls + ' mb-3'} placeholder="Search conversations..." value={query} onChange={e => setQuery(e.target.value)} />
        <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
          {clientsWithMsgs.length === 0 && <div className="text-sm text-slate-600 text-center py-10">No conversations yet.</div>}
          {clientsWithMsgs.map(({ client, last }) => (
            <button key={client.id} onClick={() => setSelectedId(client.id)}
              className={`w-full text-left px-3.5 py-3 rounded-xl border transition ${selectedId === client.id ? 'bg-ink-800 border-brand-500/40' : 'bg-ink-850 border-ink-700 hover:border-ink-600'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Avatar name={client.name} size={6} />
                <span className="text-sm font-medium">{client.name}</span>
                {last.direction === 'in' && <Badge tone="green">New</Badge>}
              </div>
              <div className="text-xs text-slate-500 line-clamp-1">{last.direction === 'in' ? `${client.name.split(' ')[0]}: ` : ''}{last.body}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        {selectedClient ? <ConversationThread state={state} client={selectedClient} /> : (
          <div className="h-[620px] flex items-center justify-center text-slate-600 text-sm bg-ink-850 border border-ink-700 rounded-2xl">Select a conversation</div>
        )}
      </div>
    </div>
  );
}

function MessagesPage({ state }) {
  const [tab, setTab] = React.useState('queue'); // 'queue' | 'conversations'
  const [filter, setFilter] = React.useState('pending');
  const [selectedId, setSelectedId] = React.useState(null);

  const msgs = state.messages
    .filter(m => m.type !== 'reply')
    .filter(m => filter === 'all' ? true : m.status === filter)
    .sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor));

  React.useEffect(() => {
    if (!selectedId && msgs.length) setSelectedId(msgs[0].id);
  }, [msgs.length]);

  const selected = state.messages.find(m => m.id === selectedId);
  const client = selected ? getClient(state, selected.clientId) : null;
  const barber = selected ? getBarber(state, selected.barberId) : null;
  const appt = selected ? state.appointments.find(a => a.id === selected.appointmentId) : null;

  return (
    <div className="px-8 pb-10">
      <div className="flex items-center gap-1.5 bg-ink-850 border border-ink-700 rounded-xl p-1 mb-5 w-fit">
        {[['queue', 'Automated queue'], ['conversations', 'Conversations']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === id ? 'bg-ink-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{label}</button>
        ))}
      </div>

      {tab === 'conversations' ? <ConversationsPage state={state} /> : (
      <>
      <div className="bg-ink-850 border border-ink-700 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0"><Icon name="bell" className="w-4.5 h-4.5" /></div>
        <div className="text-sm text-slate-400">
          <span className="text-slate-200 font-medium">WhatsApp isn't connected yet.</span> Reminders auto-queue ~1 hour before each appointment, and review requests queue ~1 hour after a completed visit. Hit <span className="text-slate-200">Send</span> below to simulate delivery — wire this panel up to the WhatsApp Business API (e.g. Twilio or Meta Cloud API) to make it live.
        </div>
      </div>

      <div className="flex gap-5">
        <div className="w-[380px] shrink-0">
          <div className="flex items-center gap-1.5 bg-ink-850 border border-ink-700 rounded-xl p-1 mb-3">
            {['pending', 'sent', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${filter === f ? 'bg-ink-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{f}</button>
            ))}
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {msgs.length === 0 && <div className="text-sm text-slate-600 text-center py-10">No messages here.</div>}
            {msgs.map(m => {
              const c = getClient(state, m.clientId);
              const b = m.barberId ? getBarber(state, m.barberId) : null;
              return (
                <button key={m.id} onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border transition ${selectedId === m.id ? 'bg-ink-800 border-brand-500/40' : 'bg-ink-850 border-ink-700 hover:border-ink-600'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.name} size={6} color={b?.color} />
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                    <Badge tone={messageTypeTone(m.type)}>{m.type}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">{m.body}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-600">{fmtDateTime(m.scheduledFor)}</span>
                    <Badge tone={m.status === 'sent' ? 'green' : 'amber'}>{m.status}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          {selected ? (
            <div className="bg-ink-850 border border-ink-700 rounded-2xl p-6 flex flex-col items-center">
              <div className="w-full max-w-[300px] flex items-center justify-between mb-3">
                <div className="text-xs text-slate-500">Preview{barber ? ` — as ${barber.name.split(' ')[0]} on WhatsApp` : ''}</div>
                <Badge tone={messageTypeTone(selected.type)}>{messageTypeLabel(selected.type)}</Badge>
              </div>
              <WhatsAppPreview
                contactName={client.name}
                subtitle={client.phone}
                body={selected.body}
                time={fmtTime(selected.scheduledFor)}
                status={selected.status}
              />
              <div className="w-full max-w-[300px] mt-5 space-y-2.5">
                <div className="text-xs text-slate-500 flex justify-between"><span>Appointment</span><span className="text-slate-300">{appt ? fmtDateTime(appt.start) : '—'}</span></div>
                <div className="text-xs text-slate-500 flex justify-between"><span>Barber</span><span className="text-slate-300">{barber ? barber.name : '—'}</span></div>
                <div className="text-xs text-slate-500 flex justify-between"><span>Status</span><Badge tone={selected.status === 'sent' ? 'green' : 'amber'}>{selected.status}</Badge></div>
                {selected.status === 'pending' ? (
                  <Button className="w-full mt-2" onClick={() => sendMessage(selected.id)}><Icon name="send" className="w-4 h-4" />Send via WhatsApp (simulated)</Button>
                ) : (
                  <div className="w-full mt-2 text-center text-xs text-brand-400 flex items-center justify-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5" />Sent {fmtDateTime(selected.sentAt)}</div>
                )}
                <Button variant="ghost" className="w-full" onClick={() => deleteMessage(selected.id)}><Icon name="trash" className="w-3.5 h-3.5" />Discard</Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">Select a message to preview</div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

// ---- Reports: revenue/performance dashboard + client LTV/churn -----------
function revenueOf(state, appt) {
  return getEffectiveService(state, appt.barberId, appt.serviceId)?.price || 0;
}

function ReportsPage({ state }) {
  const now = new Date();
  const today = startOfDay(now);
  const weekStart = addDays(today, -6);
  const completed = state.appointments.filter(a => a.status === 'completed');

  const revenueToday = completed.filter(a => isSameDay(a.start, today)).reduce((sum, a) => sum + revenueOf(state, a), 0);
  const revenueWeek = completed.filter(a => new Date(a.start) >= weekStart).reduce((sum, a) => sum + revenueOf(state, a), 0);

  const hourCounts = {};
  const dayCounts = {};
  completed.forEach(a => {
    const d = new Date(a.start);
    const h = d.getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;
    const wd = d.toLocaleDateString([], { weekday: 'long' });
    dayCounts[wd] = (dayCounts[wd] || 0) + 1;
  });
  const busiestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
  const fmtHour12 = h => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? 'pm' : 'am'}`;

  const clientsWithVisits = state.clients.filter(c => completed.some(a => a.clientId === c.id));
  const rebooked = clientsWithVisits.filter(c => completed.filter(a => a.clientId === c.id).length > 1);
  const rebookRate = clientsWithVisits.length ? Math.round((rebooked.length / clientsWithVisits.length) * 100) : 0;

  const revenueByBarber = state.barbers.map(b => ({
    barber: b,
    revenue: completed.filter(a => a.barberId === b.id).reduce((sum, a) => sum + revenueOf(state, a), 0),
    visits: completed.filter(a => a.barberId === b.id).length,
  })).sort((a, b) => b.revenue - a.revenue);
  const maxBarberRevenue = Math.max(1, ...revenueByBarber.map(r => r.revenue));

  const ltv = state.clients.map(c => ({ client: c, ...clientChurnInfo(state, c.id) }))
    .sort((a, b) => b.revenue - a.revenue);

  const churnTone = { Active: 'green', 'At risk': 'amber', Churned: 'red', 'No visits': 'slate' };

  return (
    <div className="px-8 pb-10 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="dashboard" label="Revenue today" value={`$${revenueToday}`} tone="green" />
        <StatCard icon="calendar" label="Revenue (7 days)" value={`$${revenueWeek}`} tone="blue" />
        <StatCard icon="clock" label="Busiest hour" value={busiestHour ? fmtHour12(Number(busiestHour[0])) : '—'} tone="amber" />
        <StatCard icon="users" label="Rebooking rate" value={`${rebookRate}%`} tone="slate" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
          <div className="font-semibold mb-3">Revenue per barber (all-time)</div>
          <div className="space-y-3">
            {revenueByBarber.map(r => (
              <div key={r.barber.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2"><Avatar name={r.barber.name} color={r.barber.color} size={6} />{r.barber.name}</span>
                  <span className="text-slate-400">${r.revenue} · {r.visits} visits</span>
                </div>
                <div className="h-2 bg-ink-900 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(r.revenue / maxBarberRevenue) * 100}%`, background: r.barber.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
          <div className="font-semibold mb-3">Busiest day</div>
          <div className="text-2xl font-display font-extrabold mb-1">{busiestDay ? busiestDay[0] : '—'}</div>
          <p className="text-sm text-slate-500">{busiestDay ? `${busiestDay[1]} completed visits historically` : 'Not enough data yet.'}</p>
        </div>
      </div>

      <div className="bg-ink-850 border border-ink-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-700 font-semibold">Client lifetime value & churn risk</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-ink-700">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Lifetime value</th>
              <th className="px-4 py-3 font-medium">Visits</th>
              <th className="px-4 py-3 font-medium">Last visit</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ltv.map(row => (
              <tr key={row.client.id} className="border-b border-ink-800 last:border-0">
                <td className="px-4 py-3 flex items-center gap-2.5"><Avatar name={row.client.name} size={7} />{row.client.name}</td>
                <td className="px-4 py-3 text-slate-300 font-medium">${row.revenue}</td>
                <td className="px-4 py-3 text-slate-400">{row.visits}</td>
                <td className="px-4 py-3 text-slate-400">{row.daysSince == null ? '—' : `${row.daysSince}d ago`}</td>
                <td className="px-4 py-3"><Badge tone={churnTone[row.status]}>{row.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Staff --------------------------------------------------------------
// Barber roster management. A barber added here shows up immediately
// everywhere else in the app (public site team section + booking flow,
// admin calendar/sidebar, booking modal) since they all read from
// state.barbers, which this page mutates directly via the shared Store.
function BarberEditForm({ barber, onSave, onCancel }) {
  const [name, setName] = React.useState(barber?.name || '');
  const [title, setTitle] = React.useState(barber?.title || '');
  const [phone, setPhone] = React.useState(barber?.phone || '');
  const [start, setStart] = React.useState(String(barber?.hours.start ?? 9));
  const [end, setEnd] = React.useState(String(barber?.hours.end ?? 18));

  const fmtHour = h => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? 'pm' : 'am'}`;

  return (
    <div className="border border-ink-600 rounded-lg p-3.5 bg-ink-900 space-y-2.5">
      <input autoFocus className={inputCls} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
      <input className={inputCls} placeholder="Title (e.g. Senior Stylist · Fades)" value={title} onChange={e => setTitle(e.target.value)} />
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Phone (the barber signs in with a text code sent here)</label>
        <PhoneInput value={phone} onChange={setPhone} placeholder="Phone" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Opens</label>
          <select className={inputCls} value={start} onChange={e => setStart(e.target.value)}>
            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{fmtHour(h)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Closes</label>
          <select className={inputCls} value={end} onChange={e => setEnd(e.target.value)}>
            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{fmtHour(h)}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={!name.trim() || Number(end) <= Number(start)}
          onClick={() => onSave({ name: name.trim(), title: title.trim() || 'Barber', phone, hours: { start: Number(start), end: Number(end) } })}>
          Save
        </Button>
      </div>
    </div>
  );
}

// ---- per-barber time off ------------------------------------------------
function TimeOffManager({ barber }) {
  const [adding, setAdding] = React.useState(false);
  const [label, setLabel] = React.useState('');
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const timeOff = barber.timeOff || [];

  const submit = () => {
    if (!start || !end) return;
    addTimeOff(barber.id, { start: new Date(start).toISOString(), end: new Date(end).toISOString(), label: label.trim() || 'Time off' });
    setLabel(''); setStart(''); setEnd(''); setAdding(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-ink-700">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Time off</div>
      <div className="space-y-1.5 mb-2">
        {timeOff.length === 0 && !adding && <div className="text-xs text-slate-600">No time off scheduled.</div>}
        {timeOff.map(t => (
          <div key={t.id} className="flex items-center justify-between bg-ink-900 rounded-lg px-3 py-2">
            <div className="text-xs">
              <span className="font-medium">{t.label}</span>
              <span className="text-slate-500"> · {fmtDateShort(t.start)} – {fmtDateShort(t.end)}</span>
            </div>
            <button onClick={() => removeTimeOff(barber.id, t.id)} className="text-xs text-slate-500 hover:text-rose-300">Remove</button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="border border-ink-600 rounded-lg p-3 bg-ink-900 space-y-2">
          <input className={inputCls} placeholder="Label (e.g. Vacation)" value={label} onChange={e => setLabel(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className={inputCls} value={start} onChange={e => setStart(e.target.value)} />
            <input type="date" className={inputCls} value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" disabled={!start || !end} onClick={submit}>Add</Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)}><Icon name="plus" className="w-3.5 h-3.5" /> Add time off</Button>
      )}
    </div>
  );
}

// ---- per-barber service pricing/duration overrides -----------------------
function ServiceOverridesManager({ state, barber }) {
  const overrides = barber.serviceOverrides || {};
  const [draft, setDraft] = React.useState(() => {
    const d = {};
    state.services.forEach(s => {
      const o = overrides[s.id];
      d[s.id] = { price: o?.price != null ? String(o.price) : '', duration: o?.duration != null ? String(o.duration) : '' };
    });
    return d;
  });

  const save = (serviceId) => {
    const { price, duration } = draft[serviceId];
    const next = { ...overrides };
    if (price === '' && duration === '') {
      delete next[serviceId];
    } else {
      next[serviceId] = {};
      if (price !== '') next[serviceId].price = Number(price);
      if (duration !== '') next[serviceId].duration = Number(duration);
    }
    updateBarber(barber.id, { serviceOverrides: next });
  };

  return (
    <div className="mt-3 pt-3 border-t border-ink-700">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Service pricing overrides</div>
      <p className="text-xs text-slate-600 mb-2">Leave blank to use the shop's default price/duration for this barber.</p>
      <div className="space-y-1.5">
        {state.services.map(s => (
          <div key={s.id} className="flex items-center gap-2 bg-ink-900 rounded-lg px-3 py-2">
            <div className="flex-1 text-xs font-medium">{s.name} <span className="text-slate-600">(default ${s.price} · {s.duration}min)</span></div>
            <input className={inputCls + ' !w-20 !py-1.5 text-xs'} type="number" min="0" placeholder="Price" value={draft[s.id].price}
              onChange={e => setDraft(d => ({ ...d, [s.id]: { ...d[s.id], price: e.target.value } }))}
              onBlur={() => save(s.id)} />
            <input className={inputCls + ' !w-20 !py-1.5 text-xs'} type="number" min="5" step="5" placeholder="Min" value={draft[s.id].duration}
              onChange={e => setDraft(d => ({ ...d, [s.id]: { ...d[s.id], duration: e.target.value } }))}
              onBlur={() => save(s.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffCard({ state, barber }) {
  const [editing, setEditing] = React.useState(false);
  const [expanded, setExpanded] = React.useState(null); // null | 'timeOff' | 'pricing'

  return (
    <div className="bg-ink-850 border border-ink-700 rounded-2xl p-4">
      {editing ? (
        <BarberEditForm
          barber={barber}
          onCancel={() => setEditing(false)}
          onSave={patch => { updateBarber(barber.id, patch); setEditing(false); }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={barber.name} color={barber.color} size={11} />
              <div>
                <div className="text-sm font-semibold">{barber.name}</div>
                <div className="text-xs text-slate-500">{barber.title}{barber.phone ? ` · ${barber.phone}` : ''}</div>
                <div className="text-xs text-slate-600 mt-0.5">Available {barber.hours.start > 12 ? barber.hours.start - 12 : barber.hours.start}{barber.hours.start >= 12 ? 'pm' : 'am'} – {barber.hours.end > 12 ? barber.hours.end - 12 : barber.hours.end}pm{barber.authUserId ? ' · Signed in' : barber.phone ? ' · Not signed in yet' : ''}</div>
              </div>
            </div>
            <button onClick={() => setEditing(true)} className="text-xs text-slate-500 hover:text-brand-300">Edit</button>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <button onClick={() => setExpanded(expanded === 'timeOff' ? null : 'timeOff')}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition ${expanded === 'timeOff' ? 'bg-ink-700 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-ink-800'}`}>
              Time off {barber.timeOff?.length ? `(${barber.timeOff.length})` : ''}
            </button>
            <button onClick={() => setExpanded(expanded === 'pricing' ? null : 'pricing')}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition ${expanded === 'pricing' ? 'bg-ink-700 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-ink-800'}`}>
              Service pricing {Object.keys(barber.serviceOverrides || {}).length ? `(${Object.keys(barber.serviceOverrides).length})` : ''}
            </button>
          </div>
          {expanded === 'timeOff' && <TimeOffManager barber={barber} />}
          {expanded === 'pricing' && <ServiceOverridesManager state={state} barber={barber} />}
        </>
      )}
    </div>
  );
}

function StaffPage({ state }) {
  const [adding, setAdding] = React.useState(false);

  return (
    <div className="px-8 pb-10">
      <div className="space-y-3 mb-5">
        {state.barbers.map(b => <StaffCard key={b.id} state={state} barber={b} />)}
      </div>

      {adding ? (
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-4">
          <div className="font-semibold text-sm mb-3">Add barber</div>
          <BarberEditForm
            onCancel={() => setAdding(false)}
            onSave={patch => { addBarber(state, patch); setAdding(false); }}
          />
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}><Icon name="plus" className="w-4 h-4" /> Add barber</Button>
      )}
    </div>
  );
}

// ---- Settings ---------------------------------------------------------------
function SettingsPage({ state }) {
  const [dayBefore, setDayBefore] = React.useState(state.templates.dayBefore);
  const [reminder, setReminder] = React.useState(state.templates.reminder);
  const [review, setReview] = React.useState(state.templates.review);
  const [winback, setWinback] = React.useState(state.templates.winback);
  const [referralReward, setReferralReward] = React.useState(state.templates.referralReward);
  const shopName = state.shopName || 'Fade & Faro';
  const dummy = {
    clientName: 'Liam', barberName: 'Marco', service: 'Skin Fade', time: '3:00 PM', date: 'Sep 12',
    reviewLink: 'fadeandfaro.com/review', rescheduleLink: 'fadeandfaro.com/reschedule/ab12cd', bookLink: 'fadeandfaro.com/book',
    days: 68, refereeName: 'Noah', amount: REFERRAL_REWARD_AMOUNT, shopName,
  };

  return (
    <div className="px-8 pb-10 max-w-4xl">
      <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5 mb-5">
        <div className="font-semibold mb-1">Automation rules</div>
        <p className="text-sm text-slate-500 mb-4">These control when WhatsApp messages are queued. Sending itself stays manual until the API is connected.</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-ink-900 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">Day-before reminder sent</div>
            <div className="font-medium text-sm">{DAY_BEFORE_LEAD_MIN / 60} hours before appointment</div>
          </div>
          <div className="bg-ink-900 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">Reminder sent</div>
            <div className="font-medium text-sm">{REMINDER_LEAD_MIN} minutes before appointment</div>
          </div>
          <div className="bg-ink-900 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">Review request sent</div>
            <div className="font-medium text-sm">{REVIEW_DELAY_MIN} minutes after visit completes</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
          <div className="font-semibold mb-1">Day-before reminder template</div>
          <p className="text-xs text-slate-500 mb-3">Variables: {'{clientName} {barberName} {service} {time} {date} {rescheduleLink}'}</p>
          <textarea className={inputCls + ' h-28 resize-none'} value={dayBefore} onChange={e => setDayBefore(e.target.value)} />
          <Button size="sm" className="mt-2.5" onClick={() => updateTemplates({ dayBefore })}>Save template</Button>
        </div>
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
          <div className="font-semibold mb-1">Reminder template</div>
          <p className="text-xs text-slate-500 mb-3">Variables: {'{clientName} {barberName} {service} {time} {date}'}</p>
          <textarea className={inputCls + ' h-28 resize-none'} value={reminder} onChange={e => setReminder(e.target.value)} />
          <Button size="sm" className="mt-2.5" onClick={() => updateTemplates({ reminder })}>Save template</Button>
        </div>
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
          <div className="font-semibold mb-1">Review request template</div>
          <p className="text-xs text-slate-500 mb-3">Variables: {'{clientName} {barberName} {service} {reviewLink}'}</p>
          <textarea className={inputCls + ' h-28 resize-none'} value={review} onChange={e => setReview(e.target.value)} />
          <Button size="sm" className="mt-2.5" onClick={() => updateTemplates({ review })}>Save template</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-5">
        <div className="flex flex-col items-center">
          <WhatsAppPreview contactName="Marco Ricci" subtitle={shopName} body={fillTemplate(dayBefore, dummy)} time="9:14 AM" status="sent" />
        </div>
        <div className="flex flex-col items-center">
          <WhatsAppPreview contactName="Marco Ricci" subtitle={shopName} body={fillTemplate(reminder, dummy)} time="9:14 AM" status="sent" />
        </div>
        <div className="flex flex-col items-center">
          <WhatsAppPreview contactName="Marco Ricci" subtitle={shopName} body={fillTemplate(review, dummy)} time="9:14 AM" status="pending" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5">
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
          <div className="font-semibold mb-1">"We miss you" win-back template</div>
          <p className="text-xs text-slate-500 mb-3">Variables: {'{clientName} {shopName} {days} {bookLink}'} · sent once a client has gone {WINBACK_INACTIVE_DAYS}+ days without a booking</p>
          <textarea className={inputCls + ' h-24 resize-none'} value={winback} onChange={e => setWinback(e.target.value)} />
          <Button size="sm" className="mt-2.5" onClick={() => updateTemplates({ winback })}>Save template</Button>
        </div>
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
          <div className="font-semibold mb-1">Referral reward template</div>
          <p className="text-xs text-slate-500 mb-3">Variables: {'{clientName} {refereeName} {shopName} {amount}'} · sent to the referrer once their friend's first visit is booked</p>
          <textarea className={inputCls + ' h-24 resize-none'} value={referralReward} onChange={e => setReferralReward(e.target.value)} />
          <Button size="sm" className="mt-2.5" onClick={() => updateTemplates({ referralReward })}>Save template</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 mt-5">
        <div className="flex flex-col items-center">
          <WhatsAppPreview contactName="Grace Whitman" subtitle={shopName} body={fillTemplate(winback, dummy)} time="9:14 AM" status="pending" />
        </div>
        <div className="flex flex-col items-center">
          <WhatsAppPreview contactName="Liam Turner" subtitle={shopName} body={fillTemplate(referralReward, dummy)} time="9:14 AM" status="pending" />
        </div>
      </div>
    </div>
  );
}

// ---- Agency console -------------------------------------------------------
// One level above any single shop: lets the owner see every barbershop on
// the platform and jump into a shop's staff dashboard or public site. Adding
// a shop hands the owner a guided setup wizard so nothing gets launched
// half-configured (no barbers to book, no services to sell).
const SHOP_WIZARD_STEPS = ['Shop details', 'Add barbers', 'Add services', 'Review & launch'];

function ShopSetupWizard({ onLaunch, onCancel }) {
  const [step, setStep] = React.useState(0);
  const [shopName, setShopName] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [ownerPhone, setOwnerPhone] = React.useState('');
  const [barbers, setBarbers] = React.useState([]);
  const [services, setServices] = React.useState([]);

  const [bName, setBName] = React.useState('');
  const [bTitle, setBTitle] = React.useState('');
  const [bPhone, setBPhone] = React.useState('');

  const [sName, setSName] = React.useState('');
  const [sDuration, setSDuration] = React.useState('30');
  const [sPrice, setSPrice] = React.useState('');

  const addBarberDraft = () => {
    if (!bName.trim()) return;
    setBarbers(bs => [...bs, { name: bName.trim(), title: bTitle.trim() || 'Barber', phone: bPhone }]);
    setBName(''); setBTitle(''); setBPhone('');
  };
  const addServiceDraft = () => {
    if (!sName.trim() || !sPrice) return;
    setServices(ss => [...ss, { name: sName.trim(), duration: Number(sDuration) || 30, price: Number(sPrice) || 0 }]);
    setSName(''); setSDuration('30'); setSPrice('');
  };

  const canNext = [
    !!(shopName.trim() && ownerName.trim() && ownerPhone.trim()),
    barbers.length > 0,
    services.length > 0,
    true,
  ][step];

  const handleLaunch = () => {
    const builtBarbers = barbers.map((b, i) => {
      const c = barberColor(i);
      return {
        id: uid('b'), name: b.name, title: b.title, phone: b.phone,
        color: c, colorSoft: colorSoft(c),
        avatar: b.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
        hours: { start: 9, end: 18 },
      };
    });
    const builtServices = services.map(s => ({ id: uid('s'), name: s.name, duration: s.duration, price: s.price }));
    onLaunch({ name: shopName.trim(), ownerName: ownerName.trim(), ownerPhone: ownerPhone.trim(), barbers: builtBarbers, services: builtServices });
  };

  return (
    <div className="max-w-xl mx-auto">
      <StepDots step={step} steps={SHOP_WIZARD_STEPS} />
      <div className="bg-ink-900/40 border border-ink-800 rounded-3xl p-6 sm:p-7">
        {step === 0 && (
          <>
            <h2 className="font-display font-bold text-xl mb-1">Shop details</h2>
            <p className="text-sm text-slate-500 mb-4">This becomes the shop's public name and its owner's contact for account-related setup.</p>
            <div className="space-y-3">
              <input autoFocus className={inputCls} placeholder="Shop name (e.g. Ivy Cutz)" value={shopName} onChange={e => setShopName(e.target.value)} />
              <input className={inputCls} placeholder="Owner's full name" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
              <PhoneInput value={ownerPhone} onChange={setOwnerPhone} placeholder="Owner's phone number" />
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="font-display font-bold text-xl mb-1">Add barbers</h2>
            <p className="text-sm text-slate-500 mb-4">Add everyone who'll take appointments at {shopName || 'this shop'}. You need at least one to continue.</p>
            <div className="space-y-2 mb-4">
              {barbers.map((b, i) => (
                <div key={i} className="flex items-center justify-between bg-ink-850 border border-ink-700 rounded-xl px-4 py-2.5">
                  <div>
                    <div className="text-sm font-medium">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.title}{b.phone ? ` · ${b.phone}` : ''}</div>
                  </div>
                  <button onClick={() => setBarbers(bs => bs.filter((_, idx) => idx !== i))} className="text-xs text-slate-500 hover:text-rose-300">Remove</button>
                </div>
              ))}
            </div>
            <div className="border border-ink-600 rounded-lg p-3 bg-ink-900 space-y-2.5">
              <input className={inputCls} placeholder="Barber's full name" value={bName} onChange={e => setBName(e.target.value)} />
              <input className={inputCls} placeholder="Title (e.g. Senior Stylist · Fades)" value={bTitle} onChange={e => setBTitle(e.target.value)} />
              <PhoneInput value={bPhone} onChange={setBPhone} placeholder="Barber's phone (optional)" />
              <div className="flex justify-end">
                <Button size="sm" variant="outline" disabled={!bName.trim()} onClick={addBarberDraft}><Icon name="plus" className="w-4 h-4" /> Add barber</Button>
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="font-display font-bold text-xl mb-1">Add services</h2>
            <p className="text-sm text-slate-500 mb-4">What can clients book at {shopName || 'this shop'}? You need at least one to continue.</p>
            <div className="space-y-2 mb-4">
              {services.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-ink-850 border border-ink-700 rounded-xl px-4 py-2.5">
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.duration} min · ${s.price}</div>
                  </div>
                  <button onClick={() => setServices(ss => ss.filter((_, idx) => idx !== i))} className="text-xs text-slate-500 hover:text-rose-300">Remove</button>
                </div>
              ))}
            </div>
            <div className="border border-ink-600 rounded-lg p-3 bg-ink-900">
              <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                <input className={inputCls + ' col-span-3 sm:col-span-1'} placeholder="Service name" value={sName} onChange={e => setSName(e.target.value)} />
                <input className={inputCls} type="number" min="5" step="5" placeholder="Minutes" value={sDuration} onChange={e => setSDuration(e.target.value)} />
                <input className={inputCls} type="number" min="0" step="1" placeholder="Price $" value={sPrice} onChange={e => setSPrice(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" disabled={!sName.trim() || !sPrice} onClick={addServiceDraft}><Icon name="plus" className="w-4 h-4" /> Add service</Button>
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="font-display font-bold text-xl mb-1">Review & launch</h2>
            <p className="text-sm text-slate-500 mb-4">Double-check everything below — you can always fine-tune barbers, services, and message templates from the shop's own dashboard after it's live.</p>
            <div className="space-y-3">
              <div className="bg-ink-850 border border-ink-700 rounded-xl px-4 py-3">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Shop</div>
                <div className="text-sm font-medium">{shopName}</div>
                <div className="text-xs text-slate-500 mt-0.5">Owner: {ownerName} · {ownerPhone}</div>
              </div>
              <div className="bg-ink-850 border border-ink-700 rounded-xl px-4 py-3">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{barbers.length} barber{barbers.length !== 1 ? 's' : ''}</div>
                <div className="text-sm">{barbers.map(b => b.name).join(', ')}</div>
              </div>
              <div className="bg-ink-850 border border-ink-700 rounded-xl px-4 py-3">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{services.length} service{services.length !== 1 ? 's' : ''}</div>
                <div className="text-sm">{services.map(s => s.name).join(', ')}</div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 justify-between pt-5">
          <Button variant="ghost" onClick={() => step === 0 ? onCancel() : setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button disabled={!canNext} onClick={() => setStep(s => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleLaunch}><Icon name="check" className="w-4 h-4" /> Launch shop</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopCard({ shop, onManage, onViewSite, onDelete }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const shopState = React.useMemo(() => loadState(shop.id), [shop.id]);

  if (confirmDelete) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
        <div className="text-sm font-medium text-amber-200 mb-1">Delete {shop.name}?</div>
        <p className="text-xs text-amber-100/80 mb-3">This permanently removes its barbers, services, clients, and appointment history. This can't be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Go back</Button>
          <Button size="sm" onClick={() => onDelete(shop.id)}>Yes, delete it</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-display font-bold text-lg">{shop.name}</div>
          <div className="text-xs text-slate-500">Owner: {shop.ownerName || '—'}{shop.ownerPhone ? ` · ${shop.ownerPhone}` : ''}</div>
        </div>
        <Badge tone={shop.status === 'active' ? 'green' : 'amber'}>{shop.status === 'active' ? 'Active' : 'Draft'}</Badge>
      </div>
      <div className="flex gap-4 text-xs text-slate-500 mb-4">
        <span>{shopState.barbers.length} barber{shopState.barbers.length !== 1 ? 's' : ''}</span>
        <span>{shopState.services.length} service{shopState.services.length !== 1 ? 's' : ''}</span>
        <span>{shopState.clients.length} client{shopState.clients.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => setConfirmDelete(true)} className="text-xs text-slate-500 hover:text-rose-300">Delete</button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewSite(shop.id)}>View site</Button>
          <Button size="sm" onClick={() => onManage(shop.id)}>Manage</Button>
        </div>
      </div>
    </div>
  );
}

// ---- Agency: cross-shop revenue/clients/bookings rollup -------------------
function AgencyRollup({ agency }) {
  const totals = React.useMemo(() => {
    return agency.shops.reduce((acc, shop) => {
      const s = loadState(shop.id);
      const revenue = s.appointments.filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (getEffectiveService(s, a.barberId, a.serviceId)?.price || 0), 0);
      acc.revenue += revenue;
      acc.clients += s.clients.length;
      acc.bookings += s.appointments.length;
      return acc;
    }, { revenue: 0, clients: 0, bookings: 0 });
  }, [agency.shops]);

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-ink-850 border border-ink-700 rounded-2xl p-4">
        <div className="text-2xl font-display font-extrabold">${totals.revenue}</div>
        <div className="text-xs text-slate-500 mt-1">Total revenue across {agency.shops.length} shop{agency.shops.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="bg-ink-850 border border-ink-700 rounded-2xl p-4">
        <div className="text-2xl font-display font-extrabold">{totals.clients}</div>
        <div className="text-xs text-slate-500 mt-1">Total clients</div>
      </div>
      <div className="bg-ink-850 border border-ink-700 rounded-2xl p-4">
        <div className="text-2xl font-display font-extrabold">{totals.bookings}</div>
        <div className="text-xs text-slate-500 mt-1">Total bookings</div>
      </div>
    </div>
  );
}

// ---- Agency: shared client directory ---------------------------------------
// Recognizes the same person across shops by matching normalized phone
// numbers — there's no real shared-identity backend, so this is a best-effort
// join done client-side each time the console renders.
function SharedClientDirectory({ agency }) {
  const [open, setOpen] = React.useState(false);
  const groups = React.useMemo(() => {
    const byPhone = new Map();
    agency.shops.forEach(shop => {
      const s = loadState(shop.id);
      s.clients.forEach(c => {
        const key = normalizePhone(c.phone);
        if (!key) return;
        if (!byPhone.has(key)) byPhone.set(key, []);
        byPhone.get(key).push({ shopName: shop.name, client: c });
      });
    });
    return [...byPhone.values()].filter(g => g.length > 1);
  }, [agency.shops]);

  return (
    <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5 mb-5">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
        <div className="text-left">
          <div className="font-semibold">Shared client directory</div>
          <p className="text-xs text-slate-500 mt-0.5">{groups.length} client{groups.length !== 1 ? 's' : ''} recognized at more than one shop</p>
        </div>
        <Icon name={open ? 'chevronLeft' : 'chevronRight'} className="w-4 h-4 text-slate-500" style={{ transform: open ? 'rotate(-90deg)' : 'rotate(0deg)' }} />
      </button>
      {open && (
        <div className="space-y-2 mt-3">
          {groups.length === 0 && <div className="text-sm text-slate-600">No clients have booked at more than one shop yet.</div>}
          {groups.map((g, i) => (
            <div key={i} className="bg-ink-900 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5 mb-1.5">
                <Avatar name={g[0].client.name} size={7} />
                <span className="font-medium text-sm">{g[0].client.name}</span>
                <span className="text-xs text-slate-500">{g[0].client.phone}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.map((entry, j) => <Badge key={j}>{entry.shopName}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Agency: broadcast a message to every shop's clients -------------------
function AgencyBroadcast({ agency }) {
  const [body, setBody] = React.useState('');
  const [sentCount, setSentCount] = React.useState(null);

  const send = () => {
    if (!body.trim()) return;
    const count = broadcastToAllShops(agency, body.trim());
    setSentCount(count);
    setBody('');
  };

  return (
    <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5 mb-5">
      <div className="font-semibold mb-1">Agency-wide broadcast</div>
      <p className="text-xs text-slate-500 mb-3">Send the same WhatsApp message to every client across all {agency.shops.length} shop{agency.shops.length !== 1 ? 's' : ''} at once (e.g. a holiday hours notice). Messages queue as pending in each shop's own Messages page.</p>
      <textarea className={inputCls + ' h-20 resize-none'} placeholder="e.g. We'll be closed Dec 25 for the holiday — see you back Dec 26!" value={body} onChange={e => setBody(e.target.value)} />
      <div className="flex items-center gap-3 mt-2.5">
        <Button size="sm" disabled={!body.trim() || !agency.shops.length} onClick={send}><Icon name="send" className="w-3.5 h-3.5" /> Send to all shops</Button>
        {sentCount != null && <span className="text-xs text-brand-400">Queued {sentCount} message{sentCount !== 1 ? 's' : ''}.</span>}
      </div>
    </div>
  );
}

function AgencyConsole({ onManageShop, onViewShopSite, onLaunchShop, onDeleteShop, onExit }) {
  const agency = useAgencyStore();
  const [showWizard, setShowWizard] = React.useState(false);

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onExit} className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1">
            <Icon name="chevronLeft" className="w-4 h-4" /> Back to site
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
              <Icon name="building" className="w-5 h-5 text-ink-950" />
            </div>
            <span className="font-display font-extrabold text-lg">Agency console</span>
          </div>
        </div>

        {showWizard ? (
          <>
            <h1 className="font-display font-extrabold text-2xl mb-1 text-center">Add a new shop</h1>
            <p className="text-sm text-slate-500 mb-8 text-center">Follow the steps below to get it fully set up before it goes live.</p>
            <ShopSetupWizard
              onCancel={() => setShowWizard(false)}
              onLaunch={(draft) => { onLaunchShop(draft); setShowWizard(false); }}
            />
          </>
        ) : (
          <>
            <AgencyRollup agency={agency} />

            <div className="flex items-center justify-between mb-5 mt-8">
              <div>
                <h1 className="font-display font-extrabold text-2xl">Your shops</h1>
                <p className="text-sm text-slate-500">Manage every barbershop on the platform from one place.</p>
              </div>
              <Button onClick={() => setShowWizard(true)}><Icon name="plus" className="w-4 h-4" /> Add shop</Button>
            </div>
            <div className="space-y-3">
              {agency.shops.map(shop => (
                <ShopCard key={shop.id} shop={shop} onManage={onManageShop} onViewSite={onViewShopSite} onDelete={onDeleteShop} />
              ))}
            </div>

            <SharedClientDirectory agency={agency} />
            <AgencyBroadcast agency={agency} />
          </>
        )}
      </div>
    </div>
  );
}

// ---- Root ---------------------------------------------------------------
// barberScope, when set, is a barber id — the signed-in barber only sees
// their own calendar/clients/messages, and Staff/Settings/Reports are hidden.
// The owner's "Continue as owner" path leaves barberScope null and is unaffected.
function AdminApp({ state, onExitToSite, barberScope }) {
  const [page, setPage] = React.useState('dashboard');
  const [bookingModal, setBookingModal] = React.useState(null); // {barberId, date, slot, editingAppt}
  const [detailAppt, setDetailAppt] = React.useState(null);

  const openNew = (barberId, date, slot) => setBookingModal({ barberId: barberScope || barberId, date, slot: slot || '09:00', editingAppt: null });
  const openEdit = (appt) => { setDetailAppt(null); setBookingModal({ barberId: appt.barberId, date: new Date(appt.start), editingAppt: appt }); };
  const openDetail = (appt) => setDetailAppt(appt);

  const viewState = React.useMemo(() => {
    if (!barberScope) return state;
    const appointments = state.appointments.filter(a => a.barberId === barberScope);
    const clientIds = new Set(appointments.map(a => a.clientId));
    return {
      ...state,
      barbers: state.barbers.filter(b => b.id === barberScope),
      appointments,
      messages: state.messages.filter(m => m.barberId === barberScope),
      clients: state.clients.filter(c => clientIds.has(c.id)),
    };
  }, [state, barberScope]);

  const barberCount = viewState.barbers.length;
  const titles = {
    dashboard: ['Dashboard', `Next 3 days across ${barberCount} barber${barberCount !== 1 ? 's' : ''}`],
    calendar: ['Calendar', 'Book and manage appointments per barber'],
    clients: ['Clients', 'Everyone who has booked with the shop'],
    staff: ['Staff', 'Manage barbers and their hours'],
    messages: ['Messages', 'WhatsApp reminders & review requests'],
    reports: ['Reports', 'Revenue, performance, and client retention'],
    settings: ['Settings', 'Automation rules and message templates'],
  };
  const [title, subtitle] = titles[page];
  const navItems = barberScope ? NAV.filter(n => !['staff', 'settings', 'reports'].includes(n.id)) : NAV;

  return (
    <div className="flex min-h-screen">
      <Sidebar page={page} setPage={setPage} state={viewState} onExitToSite={onExitToSite} navItems={navItems} />
      <main className="flex-1 min-w-0">
        <TopBar title={title} subtitle={subtitle} action={
          page !== 'settings' && page !== 'staff' && page !== 'reports' && <Button onClick={() => openNew(null, new Date())}><Icon name="plus" className="w-4 h-4" />New appointment</Button>
        } />
        {page === 'dashboard' && <DashboardPage state={viewState} onOpenAppt={openDetail} onNewAppt={openNew} />}
        {page === 'calendar' && <CalendarPage state={viewState} onOpenAppt={openDetail} onNewAppt={openNew} />}
        {page === 'clients' && <ClientsPage state={viewState} onOpenAppt={openDetail} />}
        {!barberScope && page === 'staff' && <StaffPage state={state} />}
        {page === 'messages' && <MessagesPage state={viewState} />}
        {!barberScope && page === 'reports' && <ReportsPage state={state} />}
        {!barberScope && page === 'settings' && <SettingsPage state={state} />}
      </main>

      <BookingModal
        state={state}
        open={!!bookingModal}
        onClose={() => setBookingModal(null)}
        barberId={bookingModal?.barberId}
        initialDate={bookingModal?.date}
        initialSlot={bookingModal?.slot}
        editingAppt={bookingModal?.editingAppt}
      />
      <AppointmentDetailModal
        state={state}
        open={!!detailAppt}
        onClose={() => setDetailAppt(null)}
        appt={detailAppt}
        onEdit={() => openEdit(detailAppt)}
      />
    </div>
  );
}

function RootApp() {
  const state = useStore();
  useMessageEngine();
  const [mode, setMode] = React.useState('site'); // 'site' | 'admin' | 'agency'
  const [barberScope, setBarberScope] = React.useState(null);

  const enterShop = (shopId, target) => {
    Store.switchShop(shopId);
    SessionStore.reload();
    setBarberScope(null);
    setMode(target);
  };
  const enterAdmin = (barberId) => {
    setBarberScope(barberId || null);
    setMode('admin');
    if (!barberId) {
      ensureShopInCloud(Store.shopId); // owner sign-in: publish local demo data to Supabase the first time
      AgencyStore._refreshFromSupabase(); // and pull in any other shops this owner already has in the cloud
    }
  };
  const exitAdmin = () => { setBarberScope(null); setMode('site'); };
  const handleLaunchShop = ({ name, ownerName, ownerPhone, barbers, services }) => {
    const shop = AgencyStore.createShop({ name, ownerName, ownerPhone });
    Store.switchShop(shop.id, seedEmptyShopState({ shopName: name, barbers, services }));
    AgencyStore.updateShop(shop.id, { setupComplete: true, status: 'active' });
    SessionStore.reload();
    setMode('admin');
  };

  return (
    <>
      {mode === 'site' && <PublicSite state={state} onStaff={enterAdmin} onAgency={() => setMode('agency')} />}
      {mode === 'admin' && <AdminApp state={state} onExitToSite={exitAdmin} barberScope={barberScope} />}
      {mode === 'agency' && (
        <AgencyConsole
          onExit={() => setMode('site')}
          onManageShop={(shopId) => enterShop(shopId, 'admin')}
          onViewShopSite={(shopId) => enterShop(shopId, 'site')}
          onLaunchShop={handleLaunchShop}
          onDeleteShop={(shopId) => AgencyStore.deleteShop(shopId)}
        />
      )}
      <ToastHost />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RootApp />);
