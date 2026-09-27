// Supabase Edge Function — translate-product
// Translates a product's French name + description to English and Dutch.
// Called by the admin dashboard on every product save (auto-translate).
// Deploy: supabase functions deploy translate-product
//
// Body:   { "name": "...", "description": "..." }
// Returns: { name_en, name_nl, description_en, description_nl }
//
// Uses the public Google Translate endpoint (client=gtx) — no API key.
// This is the same approach many static sites use for build-time
// translation; it has no official quota but is best-effort. On failure
// the admin offers to save without translations (front end then falls
// back to the French text).

interface Payload {
  name: string;
  description: string;
}

const MAX_LENGTHS = {
  name: 300,
  description: 5000,
} as const;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://maisontislit.com',
  'https://www.maisontislit.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/** Translate one text into `target` (auto-detects the source language). */
async function translate(text: string, target: 'en' | 'nl'): Promise<string> {
  if (!text.trim()) return '';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate.googleapis.com ${res.status}`);
  const data = await res.json();
  // Response shape: [[["segment", "original", ...], ...], ...]
  const segments = Array.isArray(data?.[0]) ? data[0] : [];
  return segments.map((s: unknown[]): string => (Array.isArray(s) ? String(s[0] ?? '') : '')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const body: Payload = await req.json();
    const name = (body.name || '').trim().slice(0, MAX_LENGTHS.name);
    const description = (body.description || '').trim().slice(0, MAX_LENGTHS.description);

    if (!name) {
      return new Response(
        JSON.stringify({ error: 'name is required' }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const [name_en, name_nl, description_en, description_nl] = await Promise.all([
      translate(name, 'en'),
      translate(name, 'nl'),
      translate(description, 'en'),
      translate(description, 'nl'),
    ]);

    return new Response(
      JSON.stringify({ name_en, name_nl, description_en, description_nl }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Translation failed' }),
      { status: 502, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
