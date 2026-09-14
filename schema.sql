-- ---------------------------------------------------------------------------
-- Fade & Faro — Supabase schema.
-- Paste this whole file into the Supabase SQL editor (Project > SQL Editor >
-- New query) and run it once. Safe to re-run: everything is IF NOT EXISTS /
-- CREATE OR REPLACE.
-- ---------------------------------------------------------------------------

-- ---- shops -------------------------------------------------------------
create table if not exists shops (
  id text primary key,
  owner_id uuid references auth.users(id) on delete set null,
  name text not null default 'New shop',
  slug text unique,
  owner_name text default '',
  owner_phone text default '',
  setup_complete boolean not null default false,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

-- ---- barbers -------------------------------------------------------------
create table if not exists barbers (
  id text primary key,
  shop_id text not null references shops(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  title text default 'Barber',
  color text default '#1eb86b',
  color_soft text default 'rgba(30,184,107,0.14)',
  avatar text default '',
  hours jsonb not null default '{"start":9,"end":18}',
  phone text default '',
  time_off jsonb not null default '[]',
  service_overrides jsonb not null default '{}'
);

-- ---- services -------------------------------------------------------------
create table if not exists services (
  id text primary key,
  shop_id text not null references shops(id) on delete cascade,
  name text not null,
  duration int not null default 30,
  price numeric not null default 0
);

-- ---- clients -------------------------------------------------------------
create table if not exists clients (
  id text primary key,
  shop_id text not null references shops(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text default '',
  notes text default '',
  has_account boolean not null default false,
  account_nudge_sent boolean not null default false,
  referral_code text,
  referred_by_code text,
  credit_balance numeric not null default 0,
  referral_reward_granted boolean not null default false,
  winback_sent boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- appointments -------------------------------------------------------------
create table if not exists appointments (
  id text primary key,
  shop_id text not null references shops(id) on delete cascade,
  barber_id text references barbers(id) on delete set null,
  client_id text references clients(id) on delete cascade,
  service_id text references services(id) on delete set null,
  start timestamptz not null,
  duration int not null default 30,
  status text not null default 'upcoming',
  reminder_sent boolean not null default false,
  day_before_sent boolean not null default false,
  review_requested boolean not null default false,
  rating int,
  review_text text,
  reviewed_at timestamptz,
  recurring_id text,
  created_at timestamptz not null default now()
);

-- ---- recurring_bookings -------------------------------------------------------------
create table if not exists recurring_bookings (
  id text primary key,
  shop_id text not null references shops(id) on delete cascade,
  client_id text references clients(id) on delete cascade,
  barber_id text references barbers(id) on delete set null,
  service_id text references services(id) on delete set null,
  frequency text not null default 'weekly',
  first_start timestamptz not null,
  active boolean not null default true,
  booked_count int not null default 8,
  created_at timestamptz not null default now()
);

-- ---- messages -------------------------------------------------------------
create table if not exists messages (
  id text primary key,
  shop_id text not null references shops(id) on delete cascade,
  type text not null,
  appointment_id text,
  client_id text references clients(id) on delete cascade,
  barber_id text,
  direction text not null default 'out',
  status text not null default 'pending',
  body text not null,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  error text
);

-- ---- templates: one JSON blob per shop -------------------------------------
create table if not exists templates (
  shop_id text primary key references shops(id) on delete cascade,
  data jsonb not null default '{}'
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table shops enable row level security;
alter table barbers enable row level security;
alter table services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table recurring_bookings enable row level security;
alter table messages enable row level security;
alter table templates enable row level security;

create or replace function is_shop_owner(p_shop_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from shops where id = p_shop_id and owner_id = auth.uid());
$$;

create or replace function is_shop_barber(p_shop_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from barbers where shop_id = p_shop_id and auth_user_id = auth.uid());
$$;

create or replace function is_shop_staff(p_shop_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select is_shop_owner(p_shop_id) or is_shop_barber(p_shop_id);
$$;

-- shops: anyone can read (public booking site needs shop name/slug); only the
-- signed-in owner can write; any authenticated user may create a shop they
-- then own (agency owners creating a new location).
drop policy if exists shops_select on shops;
create policy shops_select on shops for select using (true);
drop policy if exists shops_insert on shops;
create policy shops_insert on shops for insert with check (auth.uid() is not null and owner_id = auth.uid());
drop policy if exists shops_update on shops;
create policy shops_update on shops for update using (is_shop_owner(id));
drop policy if exists shops_delete on shops;
create policy shops_delete on shops for delete using (is_shop_owner(id));

-- barbers: public read (booking site shows the team + hours); owner manages
-- the roster; a barber may update their own row (time off, availability).
drop policy if exists barbers_select on barbers;
create policy barbers_select on barbers for select using (true);
drop policy if exists barbers_insert on barbers;
create policy barbers_insert on barbers for insert with check (is_shop_owner(shop_id));
drop policy if exists barbers_update on barbers;
create policy barbers_update on barbers for update using (is_shop_owner(shop_id) or auth_user_id = auth.uid());
drop policy if exists barbers_delete on barbers;
create policy barbers_delete on barbers for delete using (is_shop_owner(shop_id));

-- services: public read; owner-only write.
drop policy if exists services_select on services;
create policy services_select on services for select using (true);
drop policy if exists services_write on services;
create policy services_write on services for all using (is_shop_owner(shop_id)) with check (is_shop_owner(shop_id));

-- clients: shop staff see their shop's clients; a client can see/update their
-- own linked row; anyone (including anonymous guests) can create a client
-- record — that's how guest checkout works.
drop policy if exists clients_select on clients;
create policy clients_select on clients for select using (is_shop_staff(shop_id) or auth_user_id = auth.uid());
drop policy if exists clients_insert on clients;
create policy clients_insert on clients for insert with check (true);
drop policy if exists clients_update on clients;
create policy clients_update on clients for update using (is_shop_staff(shop_id) or auth_user_id = auth.uid());
drop policy if exists clients_delete on clients;
create policy clients_delete on clients for delete using (is_shop_owner(shop_id));

-- appointments: shop staff full access; a client can see/update their own
-- appointments (e.g. leave a review); anyone can create one (booking flow,
-- including guests with no auth session yet).
drop policy if exists appointments_select on appointments;
create policy appointments_select on appointments for select using (
  is_shop_staff(shop_id) or exists (select 1 from clients c where c.id = appointments.client_id and c.auth_user_id = auth.uid())
);
drop policy if exists appointments_insert on appointments;
create policy appointments_insert on appointments for insert with check (true);
drop policy if exists appointments_update on appointments;
create policy appointments_update on appointments for update using (
  is_shop_staff(shop_id) or exists (select 1 from clients c where c.id = appointments.client_id and c.auth_user_id = auth.uid())
);
drop policy if exists appointments_delete on appointments;
create policy appointments_delete on appointments for delete using (is_shop_staff(shop_id));

-- recurring_bookings: same shape as appointments.
drop policy if exists recurring_select on recurring_bookings;
create policy recurring_select on recurring_bookings for select using (
  is_shop_staff(shop_id) or exists (select 1 from clients c where c.id = recurring_bookings.client_id and c.auth_user_id = auth.uid())
);
drop policy if exists recurring_write on recurring_bookings;
create policy recurring_write on recurring_bookings for all using (
  is_shop_staff(shop_id) or exists (select 1 from clients c where c.id = recurring_bookings.client_id and c.auth_user_id = auth.uid())
) with check (true);

-- messages: staff-only inbox; insert stays open since booking/referral flows
-- queue a message on behalf of a guest with no session.
drop policy if exists messages_select on messages;
create policy messages_select on messages for select using (is_shop_staff(shop_id));
drop policy if exists messages_insert on messages;
create policy messages_insert on messages for insert with check (true);
drop policy if exists messages_update on messages;
create policy messages_update on messages for update using (is_shop_staff(shop_id));
drop policy if exists messages_delete on messages;
create policy messages_delete on messages for delete using (is_shop_staff(shop_id));

-- templates: public read (message previews), owner-only write.
drop policy if exists templates_select on templates;
create policy templates_select on templates for select using (true);
drop policy if exists templates_write on templates;
create policy templates_write on templates for all using (is_shop_owner(shop_id)) with check (is_shop_owner(shop_id));

-- ---------------------------------------------------------------------------
-- Phone-OTP login helpers.
-- A barber/client authenticates with Supabase's built-in phone-OTP flow
-- (auth.users, no password) and then calls one of these to link that auth
-- session to their existing barbers/clients row (matched by phone number).
-- security definer because a not-yet-linked user can't otherwise update a
-- barbers/clients row that isn't theirs yet — this is the one safe, narrow
-- exception, scoped to "only touch the row whose phone matches your own
-- verified phone number".
-- ---------------------------------------------------------------------------
create or replace function link_barber_by_phone() returns text
language plpgsql security definer set search_path = public as $$
declare
  v_phone text;
  v_barber_id text;
begin
  v_phone := (auth.jwt() ->> 'phone');
  if v_phone is null or v_phone = '' then
    return null;
  end if;
  select id into v_barber_id from barbers
    where auth_user_id is null
      and regexp_replace(phone, '\D', '', 'g') = regexp_replace(v_phone, '\D', '', 'g')
    limit 1;
  if v_barber_id is not null then
    update barbers set auth_user_id = auth.uid() where id = v_barber_id;
  end if;
  return v_barber_id;
end;
$$;
grant execute on function link_barber_by_phone() to authenticated;

create or replace function link_client_by_phone(p_shop_id text) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_phone text;
  v_client_id text;
begin
  v_phone := (auth.jwt() ->> 'phone');
  if v_phone is null or v_phone = '' then
    return null;
  end if;
  select id into v_client_id from clients
    where shop_id = p_shop_id
      and regexp_replace(phone, '\D', '', 'g') = regexp_replace(v_phone, '\D', '', 'g')
    limit 1;
  if v_client_id is not null then
    update clients set auth_user_id = auth.uid(), has_account = true where id = v_client_id and auth_user_id is null;
  else
    v_client_id := 'c_' || substr(md5(random()::text || clock_timestamp()::text), 1, 9);
    insert into clients (id, shop_id, auth_user_id, name, phone, has_account, referral_code)
    values (v_client_id, p_shop_id, auth.uid(), 'New client', v_phone, true, upper(substr(md5(random()::text), 1, 7)));
  end if;
  return v_client_id;
end;
$$;
grant execute on function link_client_by_phone(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: let the frontend subscribe to live changes on every table above.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table shops, barbers, services, clients, appointments, recurring_bookings, messages, templates;
  exception when duplicate_object then null;
  end;
end $$;
