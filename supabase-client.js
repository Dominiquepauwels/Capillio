// ---------------------------------------------------------------------------
// Supabase bootstrap. Loaded via a CDN <script> before this file (see
// index.html), so `window.supabase.createClient` is already available — no
// build step, no npm install needed to run this locally.
//
// Fill in SUPABASE_URL / SUPABASE_ANON_KEY once you've created a project
// (see schema.sql for the database setup). The anon key is meant to be
// public — it's safe to commit; access is enforced by the RLS policies in
// schema.sql, not by keeping this key secret.
//
// Until these are filled in, `SUPABASE_CONFIGURED` is false and every data.js
// function falls back to the original localStorage-only behavior, so the app
// keeps working exactly as before while you set the real backend up.
// ---------------------------------------------------------------------------
const SUPABASE_URL = 'https://otdovsaboiqbhxuyaujn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RPN84QKhqfO37imgiGcFYQ_-FAhSmJ7';

const SUPABASE_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabaseClient = SUPABASE_CONFIGURED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
