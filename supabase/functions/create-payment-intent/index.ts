// Supabase Edge Function — create-payment-intent
// Deploy: supabase functions deploy create-payment-intent
// Set secret: supabase functions secrets set STRIPE_SECRET_KEY=sk_live_...
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';
import { jwtVerify } from 'https://esm.sh/jose@5';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

const CartItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(100),
  selected_size: z.string().max(50),
  selected_color: z.string().max(50),
});

const PayloadSchema = z.object({
  currency: z.string().length(3).default('eur'),
  country: z.string().max(100).default('Maroc'),
  payment_method: z.enum(['stripe', 'cod']).default('stripe'),
  cart_items: z.array(CartItemSchema).min(1, 'Cart must have at least 1 item').max(50, 'Cart too large'),
});

const SHIPPING_CONFIG = {
  domestic: { freeThreshold: 2000, cost: 60 },
  international: { cost: 200 },
  codFeePercent: 0.05,
} as const;

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

  let userId: string;
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
    userId = payload.sub;
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

    const { currency, country, payment_method, cart_items } = parsed.data;

    // Server-side Supabase client with service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Fetch actual product prices and stock from the database
    const productIds = cart_items.map(item => item.product_id);
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, price, stock, name')
      .in('id', productIds);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify cart items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build a lookup map
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate all items exist and have sufficient stock
    for (const item of cart_items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product ${item.product_id} not found` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (product.stock < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Compute subtotal from server-side prices (never trust client prices)
    const subtotal = cart_items.reduce((sum, item) => {
      const product = productMap.get(item.product_id)!;
      return sum + product.price * item.quantity;
    }, 0);

    // Compute shipping
    const isMorocco = country === 'Maroc' || country === 'Morocco';
    const shipping = isMorocco
      ? (subtotal >= SHIPPING_CONFIG.domestic.freeThreshold ? 0 : SHIPPING_CONFIG.domestic.cost)
      : SHIPPING_CONFIG.international.cost;

    // Compute COD fee
    const codFee = payment_method === 'cod' ? Math.round(subtotal * SHIPPING_CONFIG.codFeePercent) : 0;

    // Server-computed total (in cents for Stripe)
    const serverTotalCents = Math.round((subtotal + shipping + codFee) * 100);

    // For Stripe: create PaymentIntent with server-computed amount
    if (payment_method === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: serverTotalCents,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          user_id: userId,
          subtotal_mad: subtotal.toString(),
          shipping_mad: shipping.toString(),
          cod_fee_mad: codFee.toString(),
        },
      });

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          serverTotal: subtotal + shipping + codFee,
          subtotal,
          shipping,
          codFee,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For COD: just return the server-computed totals (no Stripe PaymentIntent needed)
    return new Response(
      JSON.stringify({
        serverTotal: subtotal + shipping + codFee,
        subtotal,
        shipping,
        codFee,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('create-payment-intent error:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
