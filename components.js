// ---------------------------------------------------------------------------
// Shared UI: icons, primitives, modal, booking form
// ---------------------------------------------------------------------------

function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    dashboard: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />,
    calendar: <path d="M7 2v3M17 2v3M3.5 9h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fillOpacity="0" />,
    users: <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fillOpacity="0" />,
    message: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fillOpacity="0" />,
    settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fillOpacity="0" />,
    plus: <path d="M12 5v14M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    chevronLeft: <path d="M15 18l-6-6 6-6" />,
    chevronRight: <path d="M9 18l6-6-6-6" />,
    check: <path d="M20 6 9 17l-5-5" />,
    clock: <g><circle cx="12" cy="12" r="9" fillOpacity="0" /><path d="M12 7v5l3 3" /></g>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" fillOpacity="0" />,
    trash: <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z" fillOpacity="0" />,
    scissors: <g><circle cx="6" cy="6" r="3" fillOpacity="0" /><circle cx="6" cy="18" r="3" fillOpacity="0" /><path d="M8.5 8.5 19 19M8.5 15.5 19 5M8.8 8.8 6 12" /></g>,
    search: <g><circle cx="11" cy="11" r="7" fillOpacity="0" /><path d="M21 21l-4.35-4.35" /></g>,
    send: <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />,
    star: <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.8l7.1-.7z" fillOpacity="0" />,
    bell: <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" fillOpacity="0" />,
    filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" fillOpacity="0" />,
    lock: <g><rect x="4" y="11" width="16" height="10" rx="2" fillOpacity="0" /><path d="M8 11V7a4 4 0 0 1 8 0v4" fillOpacity="0" /></g>,
    user: <g><circle cx="12" cy="8" r="4" fillOpacity="0" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" fillOpacity="0" /></g>,
    building: <g><rect x="4" y="3" width="16" height="18" rx="1" fillOpacity="0" /><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1M10 21v-4h4v4" /></g>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name] || null}
    </svg>
  );
}

function Avatar({ name, color, size = 9 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ring-1 ring-white/10`}
      style={{ backgroundColor: color || '#4a5568', width: size * 4, height: size * 4, fontSize: size * 1.5 }}
    >
      {initials}
    </div>
  );
}

function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-ink-700 text-slate-300',
    green: 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30',
    amber: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
    red: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
    blue: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

function statusTone(status) {
  return { upcoming: 'blue', completed: 'green', cancelled: 'red', 'no-show': 'amber' }[status] || 'slate';
}

function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition active:scale-[.98] disabled:opacity-40 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-400 text-ink-950 shadow-glow',
    secondary: 'bg-ink-700 hover:bg-ink-600 text-slate-100',
    ghost: 'hover:bg-ink-800 text-slate-300',
    danger: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 ring-1 ring-rose-500/30',
    outline: 'border border-ink-600 hover:border-ink-500 text-slate-200',
  };
  const sizes = { sm: 'text-xs px-2.5 py-1.5', md: 'text-sm px-3.5 py-2', lg: 'text-sm px-5 py-2.5' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

function Modal({ open, onClose, title, children, footer, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className={`relative w-full ${width} bg-ink-850 border border-ink-700 rounded-2xl shadow-soft animate-popIn max-h-[88vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700 shrink-0">
          <h3 className="font-display font-bold text-[15px]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700 text-slate-400"><Icon name="x" className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-ink-700 flex items-center justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-3.5">
      <span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 transition';

// ---- Country codes + phone input --------------------------------------------
function flagEmoji(iso2) {
  return String.fromCodePoint(...iso2.toUpperCase().split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const COUNTRIES = [
  ['DZ', '+213', 'Algeria'], ['AO', '+244', 'Angola'], ['BJ', '+229', 'Benin'], ['BW', '+267', 'Botswana'],
  ['BF', '+226', 'Burkina Faso'], ['BI', '+257', 'Burundi'], ['CV', '+238', 'Cabo Verde'], ['CM', '+237', 'Cameroon'],
  ['CF', '+236', 'Central African Republic'], ['TD', '+235', 'Chad'], ['KM', '+269', 'Comoros'], ['CG', '+242', 'Congo-Brazzaville'],
  ['CD', '+243', 'Congo-Kinshasa'], ['CI', '+225', "Côte d'Ivoire"], ['DJ', '+253', 'Djibouti'], ['EG', '+20', 'Egypt'],
  ['GQ', '+240', 'Equatorial Guinea'], ['ER', '+291', 'Eritrea'], ['SZ', '+268', 'Eswatini'], ['ET', '+251', 'Ethiopia'],
  ['GA', '+241', 'Gabon'], ['GM', '+220', 'Gambia'], ['GH', '+233', 'Ghana'], ['GN', '+224', 'Guinea'],
  ['GW', '+245', 'Guinea-Bissau'], ['KE', '+254', 'Kenya'], ['LS', '+266', 'Lesotho'], ['LR', '+231', 'Liberia'],
  ['LY', '+218', 'Libya'], ['MG', '+261', 'Madagascar'], ['MW', '+265', 'Malawi'], ['ML', '+223', 'Mali'],
  ['MR', '+222', 'Mauritania'], ['MU', '+230', 'Mauritius'], ['MA', '+212', 'Morocco'], ['MZ', '+258', 'Mozambique'],
  ['NA', '+264', 'Namibia'], ['NE', '+227', 'Niger'], ['NG', '+234', 'Nigeria'], ['RW', '+250', 'Rwanda'],
  ['ST', '+239', 'Sao Tome and Principe'], ['SN', '+221', 'Senegal'], ['SC', '+248', 'Seychelles'], ['SL', '+232', 'Sierra Leone'],
  ['SO', '+252', 'Somalia'], ['ZA', '+27', 'South Africa'], ['SS', '+211', 'South Sudan'], ['SD', '+249', 'Sudan'],
  ['TZ', '+255', 'Tanzania'], ['TG', '+228', 'Togo'], ['TN', '+216', 'Tunisia'], ['UG', '+256', 'Uganda'],
  ['ZM', '+260', 'Zambia'], ['ZW', '+263', 'Zimbabwe'],
  ['AG', '+1', 'Antigua and Barbuda'], ['AR', '+54', 'Argentina'], ['BS', '+1', 'Bahamas'], ['BB', '+1', 'Barbados'],
  ['BZ', '+501', 'Belize'], ['BO', '+591', 'Bolivia'], ['BR', '+55', 'Brazil'], ['CA', '+1', 'Canada'],
  ['CL', '+56', 'Chile'], ['CO', '+57', 'Colombia'], ['CR', '+506', 'Costa Rica'], ['CU', '+53', 'Cuba'],
  ['DM', '+1', 'Dominica'], ['DO', '+1', 'Dominican Republic'], ['EC', '+593', 'Ecuador'], ['SV', '+503', 'El Salvador'],
  ['GD', '+1', 'Grenada'], ['GT', '+502', 'Guatemala'], ['GY', '+592', 'Guyana'], ['HT', '+509', 'Haiti'],
  ['HN', '+504', 'Honduras'], ['JM', '+1', 'Jamaica'], ['MX', '+52', 'Mexico'], ['NI', '+505', 'Nicaragua'],
  ['PA', '+507', 'Panama'], ['PY', '+595', 'Paraguay'], ['PE', '+51', 'Peru'], ['KN', '+1', 'Saint Kitts and Nevis'],
  ['LC', '+1', 'Saint Lucia'], ['VC', '+1', 'Saint Vincent and the Grenadines'], ['SR', '+597', 'Suriname'],
  ['TT', '+1', 'Trinidad and Tobago'], ['US', '+1', 'United States'], ['UY', '+598', 'Uruguay'], ['VE', '+58', 'Venezuela'],
  ['AF', '+93', 'Afghanistan'], ['AM', '+374', 'Armenia'], ['AZ', '+994', 'Azerbaijan'], ['BH', '+973', 'Bahrain'],
  ['BD', '+880', 'Bangladesh'], ['BT', '+975', 'Bhutan'], ['BN', '+673', 'Brunei'], ['KH', '+855', 'Cambodia'],
  ['CN', '+86', 'China'], ['CY', '+357', 'Cyprus'], ['GE', '+995', 'Georgia'], ['IN', '+91', 'India'],
  ['ID', '+62', 'Indonesia'], ['IR', '+98', 'Iran'], ['IQ', '+964', 'Iraq'], ['IL', '+972', 'Israel'],
  ['JP', '+81', 'Japan'], ['JO', '+962', 'Jordan'], ['KZ', '+7', 'Kazakhstan'], ['KW', '+965', 'Kuwait'],
  ['KG', '+996', 'Kyrgyzstan'], ['LA', '+856', 'Laos'], ['LB', '+961', 'Lebanon'], ['MY', '+60', 'Malaysia'],
  ['MV', '+960', 'Maldives'], ['MN', '+976', 'Mongolia'], ['MM', '+95', 'Myanmar'], ['NP', '+977', 'Nepal'],
  ['KP', '+850', 'North Korea'], ['OM', '+968', 'Oman'], ['PK', '+92', 'Pakistan'], ['PS', '+970', 'Palestine'],
  ['PH', '+63', 'Philippines'], ['QA', '+974', 'Qatar'], ['SA', '+966', 'Saudi Arabia'], ['SG', '+65', 'Singapore'],
  ['KR', '+82', 'South Korea'], ['LK', '+94', 'Sri Lanka'], ['SY', '+963', 'Syria'], ['TW', '+886', 'Taiwan'],
  ['TJ', '+992', 'Tajikistan'], ['TH', '+66', 'Thailand'], ['TL', '+670', 'Timor-Leste'], ['TR', '+90', 'Turkey'],
  ['TM', '+993', 'Turkmenistan'], ['AE', '+971', 'United Arab Emirates'], ['UZ', '+998', 'Uzbekistan'], ['VN', '+84', 'Vietnam'],
  ['YE', '+967', 'Yemen'],
  ['AL', '+355', 'Albania'], ['AD', '+376', 'Andorra'], ['AT', '+43', 'Austria'], ['BY', '+375', 'Belarus'],
  ['BE', '+32', 'Belgium'], ['BA', '+387', 'Bosnia and Herzegovina'], ['BG', '+359', 'Bulgaria'], ['HR', '+385', 'Croatia'],
  ['CZ', '+420', 'Czechia'], ['DK', '+45', 'Denmark'], ['EE', '+372', 'Estonia'], ['FI', '+358', 'Finland'],
  ['FR', '+33', 'France'], ['DE', '+49', 'Germany'], ['GR', '+30', 'Greece'], ['HU', '+36', 'Hungary'],
  ['IS', '+354', 'Iceland'], ['IE', '+353', 'Ireland'], ['IT', '+39', 'Italy'], ['XK', '+383', 'Kosovo'],
  ['LV', '+371', 'Latvia'], ['LI', '+423', 'Liechtenstein'], ['LT', '+370', 'Lithuania'], ['LU', '+352', 'Luxembourg'],
  ['MT', '+356', 'Malta'], ['MD', '+373', 'Moldova'], ['MC', '+377', 'Monaco'], ['ME', '+382', 'Montenegro'],
  ['NL', '+31', 'Netherlands'], ['MK', '+389', 'North Macedonia'], ['NO', '+47', 'Norway'], ['PL', '+48', 'Poland'],
  ['PT', '+351', 'Portugal'], ['RO', '+40', 'Romania'], ['RU', '+7', 'Russia'], ['SM', '+378', 'San Marino'],
  ['RS', '+381', 'Serbia'], ['SK', '+421', 'Slovakia'], ['SI', '+386', 'Slovenia'], ['ES', '+34', 'Spain'],
  ['SE', '+46', 'Sweden'], ['CH', '+41', 'Switzerland'], ['UA', '+380', 'Ukraine'], ['GB', '+44', 'United Kingdom'],
  ['VA', '+379', 'Vatican City'],
  ['AU', '+61', 'Australia'], ['FJ', '+679', 'Fiji'], ['KI', '+686', 'Kiribati'], ['MH', '+692', 'Marshall Islands'],
  ['FM', '+691', 'Micronesia'], ['NR', '+674', 'Nauru'], ['NZ', '+64', 'New Zealand'], ['PW', '+680', 'Palau'],
  ['PG', '+675', 'Papua New Guinea'], ['WS', '+685', 'Samoa'], ['SB', '+677', 'Solomon Islands'], ['TO', '+676', 'Tonga'],
  ['TV', '+688', 'Tuvalu'], ['VU', '+678', 'Vanuatu'],
].map(([iso2, dial, name]) => ({ iso2, dial, name, flag: flagEmoji(iso2) })).sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_COUNTRY_ISO = 'NL';

// Country-code dropdown (flag + dial code) paired with a national-number
// field. Defaults to the Netherlands (+31); the composed value passed to
// onChange is "<dial code> <national number>".
function PhoneInput({ value, onChange, placeholder = 'Phone number' }) {
  const [iso2, setIso2] = React.useState(DEFAULT_COUNTRY_ISO);
  const [national, setNational] = React.useState('');

  const emit = (nextIso2, nextNational) => {
    const dial = COUNTRIES.find(c => c.iso2 === nextIso2)?.dial || '';
    onChange(nextNational.trim() ? `${dial} ${nextNational.trim()}` : '');
  };

  return (
    <div className="flex gap-2">
      <select
        value={iso2}
        onChange={e => { setIso2(e.target.value); emit(e.target.value, national); }}
        className={inputCls + ' !w-auto shrink-0 max-w-[9.5rem]'}
      >
        {COUNTRIES.map(c => (
          <option key={c.iso2} value={c.iso2}>{c.flag} {c.name} {c.dial}</option>
        ))}
      </select>
      <input
        className={inputCls}
        placeholder={placeholder}
        inputMode="numeric"
        value={national}
        onChange={e => { const digits = e.target.value.replace(/\D/g, ''); setNational(digits); emit(iso2, digits); }}
      />
    </div>
  );
}

// ---- Client picker with inline "create new" --------------------------------
function ClientPicker({ state, value, onChange }) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const selected = value ? getClient(state, value) : null;

  const filtered = state.clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query));

  if (creating) {
    return (
      <div className="border border-ink-600 rounded-lg p-3 bg-ink-900 space-y-2.5">
        <input autoFocus className={inputCls} placeholder="Full name" value={newName} onChange={e => setNewName(e.target.value)} />
        <PhoneInput value={newPhone} onChange={setNewPhone} />
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
          <Button size="sm" disabled={!newName.trim() || !newPhone.trim()} onClick={() => {
            const c = addClient({ name: newName.trim(), phone: newPhone.trim() });
            onChange(c.id);
            setCreating(false); setOpen(false); setNewName(''); setNewPhone('');
          }}>Add client</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {selected && !open ? (
        <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center gap-2.5 bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-left hover:border-ink-500 transition">
          <Avatar name={selected.name} size={7} />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{selected.name}</div>
            <div className="text-xs text-slate-500 truncate">{selected.phone}</div>
          </div>
        </button>
      ) : (
        <input autoFocus={open} className={inputCls} placeholder="Search client by name or phone..." value={query}
          onChange={e => setQuery(e.target.value)} onFocus={() => setOpen(true)} />
      )}
      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-ink-800 border border-ink-600 rounded-lg shadow-soft max-h-56 overflow-y-auto animate-fadeIn">
          {filtered.slice(0, 30).map(c => {
            const { totalVisits } = clientStats(state, c.id);
            return (
              <button key={c.id} type="button" onClick={() => { onChange(c.id); setOpen(false); setQuery(''); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-ink-700 text-left transition">
                <Avatar name={c.name} size={7} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-slate-500 truncate">{c.phone}</div>
                </div>
                {totalVisits > 0 && <Badge tone="green">{totalVisits} visit{totalVisits > 1 ? 's' : ''}</Badge>}
              </button>
            );
          })}
          {filtered.length === 0 && <div className="px-3 py-3 text-sm text-slate-500">No matches.</div>}
          <button type="button" onClick={() => setCreating(true)} className="w-full flex items-center gap-2 px-3 py-2.5 text-brand-400 hover:bg-ink-700 text-sm font-medium border-t border-ink-700">
            <Icon name="plus" className="w-4 h-4" /> Add new client
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Booking modal (create appointment) ------------------------------------
function BookingModal({ state, open, onClose, barberId, initialDate, initialSlot, editingAppt }) {
  const isEdit = !!editingAppt;
  const [clientId, setClientId] = React.useState('');
  const [serviceId, setServiceId] = React.useState(state.services[0].id);
  const [date, setDate] = React.useState(initialDate || new Date());
  const [time, setTime] = React.useState(null); // Date object for the selected slot, or null
  const [chosenBarber, setChosenBarber] = React.useState(barberId || state.barbers[0].id);

  React.useEffect(() => {
    if (open) {
      if (editingAppt) {
        setClientId(editingAppt.clientId);
        setServiceId(editingAppt.serviceId);
        setChosenBarber(editingAppt.barberId);
        setDate(new Date(editingAppt.start));
        setTime(new Date(editingAppt.start));
      } else {
        setClientId('');
        setServiceId(state.services[0].id);
        setChosenBarber(barberId || state.barbers[0].id);
        const d = initialDate || new Date();
        setDate(d);
        if (initialSlot) {
          const [hh, mm] = initialSlot.split(':').map(Number);
          setTime(combineDateTime(startOfDay(d), hh, mm));
        } else {
          setTime(null);
        }
      }
    }
  }, [open, editingAppt, barberId, initialDate, initialSlot]);

  const service = getService(state, serviceId);
  const slots = getAvailableSlots(state, chosenBarber, date, service.duration, editingAppt?.id);
  const groups = groupSlotsByPeriod(slots);

  const handleSubmit = () => {
    if (isEdit) {
      updateAppointment(editingAppt.id, { clientId, serviceId, barberId: chosenBarber, start: time.toISOString(), duration: service.duration });
    } else {
      addAppointment(state, { clientId, serviceId, barberId: chosenBarber, start: time.toISOString(), duration: service.duration, status: 'upcoming' });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit appointment' : 'Book appointment'}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!clientId || !time} onClick={handleSubmit}>{isEdit ? 'Save changes' : 'Confirm booking'}</Button>
      </>}>
      <Field label="Barber">
        <div className="grid grid-cols-2 gap-2">
          {state.barbers.map(b => (
            <button key={b.id} type="button" onClick={() => { setChosenBarber(b.id); setTime(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${chosenBarber === b.id ? 'border-brand-500/60 bg-brand-500/10' : 'border-ink-600 hover:border-ink-500'}`}>
              <Avatar name={b.name} color={b.color} size={7} />
              <span className="text-sm font-medium truncate">{b.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Client">
        <ClientPicker state={state} value={clientId} onChange={setClientId} />
      </Field>
      <Field label="Service">
        <select className={inputCls} value={serviceId} onChange={e => { setServiceId(e.target.value); setTime(null); }}>
          {state.services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.duration}min · ${s.price}</option>)}
        </select>
      </Field>
      <Field label="Date">
        <input type="date" className={inputCls} value={toInputDate(date)} onChange={e => { setDate(new Date(e.target.value + 'T00:00:00')); setTime(null); }} />
      </Field>
      <Field label="Time">
        {slots.length === 0 ? (
          <div className="text-sm text-slate-500 bg-ink-900 border border-ink-600 rounded-lg px-3 py-3 text-center">
            No open slots for a {service.duration}-min {service.name.toLowerCase()} on this date — try another day or barber.
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {Object.entries(groups).filter(([, s]) => s.length).map(([period, periodSlots]) => (
              <div key={period}>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{period}</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {periodSlots.map(s => {
                    const isSel = time && time.getTime() === s.getTime();
                    return (
                      <button key={s.toISOString()} type="button" onClick={() => setTime(s)}
                        className={`py-1.5 rounded-lg text-xs font-medium border-2 transition tabular-nums ${isSel ? 'border-brand-500 bg-brand-500 text-ink-950' : 'border-ink-600 bg-ink-900 hover:border-ink-500 text-slate-200'}`}>
                        {fmtTime(s)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Field>
    </Modal>
  );
}

function toInputDate(d) {
  const x = new Date(d);
  const off = x.getTimezoneOffset();
  return new Date(x.getTime() - off * 60000).toISOString().slice(0, 10);
}

// ---- Appointment detail modal ------------------------------------------------
function AppointmentDetailModal({ state, open, onClose, appt, onEdit }) {
  if (!open || !appt) return null;
  const client = getClient(state, appt.clientId);
  const barber = getBarber(state, appt.barberId);
  const service = getService(state, appt.serviceId);
  const { totalVisits } = clientStats(state, appt.clientId);

  return (
    <Modal open={open} onClose={onClose} title="Appointment details" footer={
      <>
        <Button variant="danger" onClick={() => { deleteAppointment(appt.id); onClose(); }}><Icon name="trash" className="w-3.5 h-3.5" />Delete</Button>
        <div className="flex-1" />
        {appt.status === 'upcoming' && <Button variant="secondary" onClick={() => updateAppointment(appt.id, { status: 'cancelled' })}>Cancel visit</Button>}
        {appt.status === 'upcoming' && <Button variant="secondary" onClick={() => updateAppointment(appt.id, { status: 'completed' })}>Mark completed</Button>}
        <Button onClick={onEdit}>Edit</Button>
      </>
    }>
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={client.name} size={11} />
        <div>
          <div className="font-semibold">{client.name}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1"><Icon name="phone" className="w-3 h-3" />{client.phone}</div>
        </div>
        <div className="ml-auto"><Badge tone={statusTone(appt.status)}>{appt.status}</Badge></div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="bg-ink-900 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Barber</div>
          <div className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 rounded-full" style={{ background: barber.color }}></span>{barber.name}</div>
        </div>
        <div className="bg-ink-900 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Service</div>
          <div className="font-medium">{service.name} · ${service.price}</div>
        </div>
        <div className="bg-ink-900 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">When</div>
          <div className="font-medium">{fmtDateTime(appt.start)}</div>
        </div>
        <div className="bg-ink-900 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Client history</div>
          <div className="font-medium">{totalVisits} completed visit{totalVisits !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => queueMessageNow('reminder', appt)}>
          <Icon name="send" className="w-3.5 h-3.5" /> Send WhatsApp reminder now
        </Button>
        {appt.status === 'completed' && (
          <Button size="sm" variant="outline" onClick={() => queueMessageNow('review', appt)}>
            <Icon name="star" className="w-3.5 h-3.5" /> Request review now
          </Button>
        )}
      </div>
    </Modal>
  );
}
