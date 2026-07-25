// Supabase Edge Function — submit-message
// Verifies Turnstile CAPTCHA then inserts a contact message
// Deploy: supabase functions deploy submit-message
// Set secret: supabase functions secrets set TURNSTILE_SECRET_KEY=0x4AAAA...
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Payload {
  name: string;
  email: string;
  subject: string;
  body: string;
  captchaToken: string;
}

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://maison-tislit.com',
  'https://www.maison-tislit.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const body: Payload = await req.json();

    if (!body.name || !body.email || !body.body || !body.captchaToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Verify Turnstile token with Cloudflare
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY') || '';
    const verifyResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: turnstileSecret, response: body.captchaToken }),
    });
    const verifyResult = await verifyResp.json();

    if (!verifyResult.success) {
      return new Response(
        JSON.stringify({ error: 'CAPTCHA verification failed' }),
        { status: 403, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Insert message using service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabase
      .from('messages')
      .insert({ name: body.name, email: body.email, subject: body.subject, body: body.body });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
