// ---------------------------------------------------------------------------
// Vercel serverless function: Twilio inbound-SMS webhook.
//
// Point your Twilio number's "A message comes in" webhook (in the Twilio
// console, under Phone Numbers) at:
//   https://<your-vercel-app>.vercel.app/api/incoming-sms
// once the app is deployed. Twilio POSTs form-encoded { From, To, Body } for
// every text a client sends to the shop's number; this matches `From`
// against a known client's phone and appends it to that client's message
// thread (direction: 'in'), which then shows up in the Messages tab exactly
// like a reply simulated in the UI does today.
//
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-only — bypasses
// RLS, needed since Twilio's webhook carries no Supabase auth session).
// ---------------------------------------------------------------------------
const { createClient } = require('@supabase/supabase-js');

function normalizePhone(p) {
  return (p || '').replace(/\D/g, '');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).send('Server is missing Supabase environment variables.');
    return;
  }

  const from = req.body && req.body.From;
  const body = (req.body && req.body.Body) || '';
  if (!from) {
    res.status(400).send('Missing From');
    return;
  }

  const db = createClient(supabaseUrl, serviceKey);
  const digits = normalizePhone(from);

  const { data: clients } = await db.from('clients').select('id, shop_id, phone');
  const client = (clients || []).find(c => normalizePhone(c.phone) === digits && digits);

  if (client) {
    await db.from('messages').insert({
      id: 'm_' + Math.random().toString(36).slice(2, 11),
      shop_id: client.shop_id,
      type: 'reply',
      appointment_id: null,
      client_id: client.id,
      barber_id: null,
      direction: 'in',
      status: 'received',
      body,
      scheduled_for: new Date().toISOString(),
      sent_at: new Date().toISOString(),
    });
  }

  // Empty TwiML response — we don't auto-reply, just record the message.
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send('<Response></Response>');
};
