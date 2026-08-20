import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv(file = '.env') {
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product';
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}
if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: using the anon key. RLS will silently block updates unless the update policy allows it.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: products, error } = await supabase
  .from('products')
  .select('id, name, name_en')
  .order('id', { ascending: true });

if (error) {
  console.error('Failed to fetch products:', error.message);
  process.exit(1);
}

const taken = new Set();
let collisions = 0;
let applied = 0;
let failed = 0;

for (const p of products) {
  let slug = slugify(p.name_en || p.name);
  if (taken.has(slug)) {
    let counter = 2;
    while (taken.has(`${slug}-${counter}`)) counter++;
    slug = `${slug}-${counter}`;
    collisions++;
  }
  taken.add(slug);
  const { data: updated, error: updateError } = await supabase
    .from('products')
    .update({ slug })
    .eq('id', p.id)
    .select('id, slug');
  if (updateError || !updated || updated.length === 0) {
    failed++;
    console.error(`Failed to update product ${p.id} (${p.name}): ${updateError?.message || '0 rows updated — RLS is blocking the anon key. Use SUPABASE_SERVICE_ROLE_KEY in .env or apply the generated migration SQL.'}`);
  } else {
    applied++;
  }
}

console.log(`Backfill: ${applied} updated, ${failed} failed, ${collisions} slug collisions resolved.`);
if (failed > 0) process.exit(1);