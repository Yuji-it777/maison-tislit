// Supabase Edge Function — create-payment-intent
// Deploy: supabase functions deploy create-payment-intent
// Set secret: supabase functions secrets set STRIPE_SECRET_KEY=sk_live_...
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';
import { jwtVerify } from 'https://esm.sh/jose@5';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://maison-tislit.com',
  'https://www.maison-tislit.com',
  'https://chdbhqdhivupvawfriyi.supabase.co',
];

const PayloadSchema = z.object({
  amount: z.number().int().min(50, 'Amount must be at least 50 cents').max(99999999, 'Amount exceeds maximum'),
  currency: z.string().length(3).default('eur'),
});

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function unauthorized(headers: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  const corsHeaders = getCorsHeaders(req);

  // Verify JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(corsHeaders);
  }

  const token = authHeader.slice(7);
  const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
  if (!jwtSecret) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
      {
        issuer: `${Deno.env.get('SUPABASE_URL')}/auth/v1`,
      }
    );

    if (!payload.sub || payload.aud !== 'authenticated') {
      return unauthorized(corsHeaders);
    }
  } catch {
    return unauthorized(corsHeaders);
  }

  try {
    const body = await req.json();
    const parsed = PayloadSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      return new Response(
        JSON.stringify({ error: `Validation failed: ${errors.join('; ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency } = parsed.data;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
