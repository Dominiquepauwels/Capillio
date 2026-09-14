// ---------------------------------------------------------------------------
// Vercel serverless function: sends one queued message via Twilio.
//
// Deliberately does NOT accept an arbitrary `to`/`body` straight from the
// browser — that would turn this into an open SMS relay anyone could abuse
// to spam premium numbers on the shop owner's Twilio bill. Instead it takes
// a `messageId` that must already exist in the `messages` table with
// status 'pending' (queued by the normal booking/reminder/reply flow), looks
// up the real phone number + body server-side with the service-role key,
// sends it, then marks that row 'sent' or 'failed'. Twilio/Supabase secrets
// live only in Vercel's environment variables — never shipped to the browser.
//
// Requires these Vercel project environment variables:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
// ---------------------------------------------------------------------------
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messageId } = req.body || {};
  if (!messageId) {
    res.status(400).json({ error: 'messageId is required' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!supabaseUrl || !serviceKey || !accountSid || !authToken || !fromNumber) {
    res.status(500).json({ error: 'Server is missing Supabase/Twilio environment variables.' });
    return;
  }

  const db = createClient(supabaseUrl, serviceKey);

  const { data: message, error: fetchErr } = await db
    .from('messages')
    .select('id, body, status, client_id')
    .eq('id', messageId)
    .single();
  if (fetchErr || !message) {
    res.status(404).json({ error: 'No queued message with that id.' });
    return;
  }
  if (message.status === 'sent') {
    res.status(200).json({ ok: true, alreadySent: true });
    return;
  }

  const { data: client, error: clientErr } = await db
    .from('clients')
    .select('phone')
    .eq('id', message.client_id)
    .single();
  if (clientErr || !client || !client.phone) {
    await db.from('messages').update({ status: 'failed', error: 'Client has no phone number on file.' }).eq('id', messageId);
    res.status(400).json({ error: 'Client has no phone number on file.' });
    return;
  }

  try {
    const twilioClient = twilio(accountSid, authToken);
    const sent = await twilioClient.messages.create({
      to: client.phone,
      from: fromNumber,
      body: message.body,
    });
    await db.from('messages').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', messageId);
    res.status(200).json({ ok: true, sid: sent.sid });
  } catch (err) {
    await db.from('messages').update({ status: 'failed', error: String(err.message || err) }).eq('id', messageId);
    res.status(502).json({ error: 'Twilio send failed', detail: String(err.message || err) });
  }
};
