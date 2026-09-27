import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

/**
 * Reports which product media columns the live database actually has.
 *
 * A missing column fails the whole PostgREST select ("Could not find the
 * 'videos' column ... in the schema cache"), so each column is probed on its
 * own: that tells you exactly which migration still has to be run.
 *
 *   node scripts/check-media-columns.mjs
 *
 * Exits non-zero when a column is missing, so it can gate a deploy.
 */
function loadEnv(file = '.env') {
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const probes = [
  { column: 'image', migration: null, label: 'a cover photo', kind: 'scalar' },
  { column: 'gallery', migration: '00029_product_gallery.sql', label: 'extra photos', kind: 'array' },
  { column: 'videos', migration: '00030_product_videos.sql', label: 'clips', kind: 'array' },
];

console.log(`Checking products media columns in ${supabaseUrl}`);

let missing = 0;
let wrongType = 0;

for (const probe of probes) {
  const { data, error } = await supabase.from('products').select(`id, ${probe.column}`);
  if (error) {
    missing++;
    console.error(`  ${probe.column.padEnd(8)} MISSING  ${error.message}`);
    console.error(`           run supabase/migrations/${probe.migration} in the Supabase SQL Editor, then re-run this check`);
    continue;
  }

  // A paste that loses the brackets of `text[]` creates a scalar column: it
  // exists, and it takes one path, then breaks as soon as there are two. The
  // array-only operator `@>` (PostgREST `cs`) reports 42883 for non-arrays.
  if (probe.kind === 'array') {
    const { error: typeError } = await supabase.from('products').select('id').contains(probe.column, ['mt-probe']);
    if (typeError) {
      wrongType++;
      console.error(`  ${probe.column.padEnd(8)} WRONG TYPE  ${typeError.message}`);
      console.error(`           expected text[]: drop and re-add the column as an array (only while it holds no data)`);
      continue;
    }
  }
  const rows = data ?? [];
  const items = rows.flatMap(row => {
    const value = row[probe.column];
    return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
  });
  const filled = rows.filter(row => {
    const value = row[probe.column];
    return Array.isArray(value) ? value.filter(Boolean).length > 0 : Boolean(value);
  }).length;
  const isArray = rows.some(row => Array.isArray(row[probe.column]));
  const total = isArray ? ` (${items.length} in total)` : '';
  console.log(`  ${probe.column.padEnd(8)} OK       ${filled}/${rows.length} products have ${probe.label}${total}`);
}

if (missing > 0 || wrongType > 0) {
  const parts = [];
  if (missing > 0) parts.push(`${missing} column(s) missing`);
  if (wrongType > 0) parts.push(`${wrongType} with the wrong type`);
  console.error(`${parts.join(' and ')}: the migrations have not been applied properly to this database.`);
  process.exit(1);
}
console.log('All media columns present.');
