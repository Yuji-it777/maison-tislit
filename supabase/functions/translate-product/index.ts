// Supabase Edge Function — translate-product
// Translates a product's French name + description to English and Dutch.
// Called by the admin dashboard when the French name/description changed
// (auto-translate). Price/stock-only saves skip it entirely.
// Deploy: supabase functions deploy translate-product
//
// Body:   { "name": "...", "description": "..." }
// Returns: { name_en, name_nl, description_en, description_nl }
//
// Uses the DeepL API (DEEPL_API_KEY secret). Free-tier keys (:fx) hit
// api-free.deepl.com, full keys hit api.deepl.com. Source is French (the
// admin writes French; translations trigger only when it changes). On
// failure the admin offers to save without translations (front end then
// falls back to the French text).

interface Payload {
  name: string;
  description: string;
}

const MAX_LENGTHS = {
  name: 300,
  description: 5000,
} as const;

// Auth is a public anon key sent in headers (no cookies), so reflecting the
// request origin does not widen any trust boundary — and it keeps the admin
// working from preview/staging deployments, not just the listed origins.
function getCorsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/** Translate one French text into `target` via DeepL. */
async function translate(
  text: string,
  target: 'en' | 'nl',
  label: string,
  apiKey: string,
  apiBase: string,
): Promise<string> {
  if (!text.trim()) return '';
  let res: Response;
  try {
    // Bound the upstream call: without this a throttled DeepL endpoint hangs
    // the admin save until the platform kills the function with no message.
    res = await fetch(`${apiBase}/v2/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: [text], source_lang: 'FR', target_lang: target.toUpperCase() }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    throw new Error(`${label} (${target}): DeepL unreachable — ${err instanceof Error ? err.message : err}`);
  }
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 200);
    throw new Error(`${label} (${target}): DeepL ${res.status}${detail ? ` — ${detail}` : ''}`);
  }
  const data = await res.json();
  const out = data?.translations?.[0]?.text;
  if (typeof out !== 'string' || !out) {
    throw new Error(`${label} (${target}): DeepL returned no translation`);
  }
  return out;
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

    const apiKey = Deno.env.get('DEEPL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'DEEPL_API_KEY is not configured' }),
        { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }
    // Free-tier keys (:fx) must use the api-free host; full keys use api.
    const apiBase = apiKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';

    const [name_en, name_nl, description_en, description_nl] = await Promise.all([
      translate(name, 'en', 'name', apiKey, apiBase),
      translate(name, 'nl', 'name', apiKey, apiBase),
      translate(description, 'en', 'description', apiKey, apiBase),
      translate(description, 'nl', 'description', apiKey, apiBase),
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
