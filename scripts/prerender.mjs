import { chromium } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { readFileSync, existsSync } from 'node:fs';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const LOCALES = ['en', 'nl'];
const PAGES = ['', 'shop', 'about', 'contact', 'shipping', 'returns'];
const PAGE_META = {
  '':      { priority: 1.0, changefreq: 'weekly' },
  shop:    { priority: 0.9, changefreq: 'weekly' },
  about:   { priority: 0.6, changefreq: 'monthly' },
  contact: { priority: 0.5, changefreq: 'yearly' },
  shipping:{ priority: 0.4, changefreq: 'yearly' },
  returns: { priority: 0.4, changefreq: 'yearly' },
};

function loadEnv() {
  const env = { ...process.env };
  const envFile = path.join(ROOT, '.env');
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
  return env;
}

const env = loadEnv();
const SITE_URL = (env.VITE_SITE_URL || 'https://maisontislit.com').replace(/\/+$/, '');

function log(msg) { console.log(`[prerender] ${msg}`); }

// Throw instead of process.exit so the top-level finally always runs cleanup
// (killing the preview server). A bare process.exit() here was orphaning the
// `vite preview` process, which then held the port and broke later runs.
function fail(msg) {
  throw new Error(msg);
}

// Pick an OS-assigned free port so we can never collide with a stale/orphaned
// preview server (the previous hard-coded --strictPort 4173 was the root cause
// of "canonical not found on every route" + ERR_CONNECTION_REFUSED cascades).
function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function fetchSlugs() {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) fail('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY required to fetch product slugs');
  const res = await fetch(`${url}/rest/v1/products?select=slug&order=id.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) fail(`slug fetch failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  const slugs = rows.map(r => r.slug).filter(Boolean);
  if (!slugs.length) fail('no product slugs found');
  log(`fetched ${slugs.length} product slugs`);
  return slugs;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Canonical URLs carry a trailing slash: STRATO's Apache (mod_dir) redirects
// slash-less directory requests before .htaccess rules run, so the slashed
// form is the only one the server serves with 200. Sitemap and snapshots
// must agree with it.
function canonicalRoute(route) {
  return route.endsWith('/') ? route : `${route}/`;
}

function buildSitemap(slugs) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];
  for (const locale of LOCALES) {
    for (const p of PAGES) {
      const route = canonicalRoute(p ? `/${locale}/${p}` : `/${locale}/`);
      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(SITE_URL + route)}</loc>`);
      for (const alt of ['en', 'nl']) {
        const altRoute = canonicalRoute(p ? `/${alt}/${p}` : `/${alt}/`);
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(SITE_URL + altRoute)}"/>`);
      }
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(SITE_URL + canonicalRoute(p ? `/en/${p}` : '/en/'))}"/>`);
      lines.push(`    <changefreq>${PAGE_META[p].changefreq}</changefreq>`);
      lines.push(`    <priority>${PAGE_META[p].priority}</priority>`);
      lines.push('  </url>');
    }
  }
  for (const slug of slugs) {
    for (const locale of LOCALES) {
      const route = canonicalRoute(`/${locale}/product/${slug}`);
      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(SITE_URL + route)}</loc>`);
      for (const alt of ['en', 'nl']) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(SITE_URL + canonicalRoute(`/${alt}/product/${slug}`))}"/>`);
      }
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(SITE_URL + canonicalRoute(`/en/product/${slug}`))}"/>`);
      lines.push('    <changefreq>weekly</changefreq>');
      lines.push('    <priority>0.8</priority>');
      lines.push('  </url>');
    }
  }
  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

const PORT = await getFreePort();
const BASE = `http://localhost:${PORT}`;

let serverLog = '';
let previewExit = null; // { code, signal } once the preview process ends

const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});
preview.stdout.on('data', d => { serverLog += d; });
preview.stderr.on('data', d => { serverLog += d; });
preview.on('exit', (code, signal) => { previewExit = { code, signal }; });
preview.on('error', err => { previewExit = { code: null, signal: null }; serverLog += `\nspawn error: ${err.message}`; });

// Kill the preview (and any child tree) reliably, on every exit path.
let killed = false;
function killPreview() {
  if (killed || !preview.pid) return;
  killed = true;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try { preview.kill('SIGTERM'); } catch {}
    try { preview.kill('SIGKILL'); } catch {}
  }
}
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => { killPreview(); process.exit(1); });
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (previewExit) {
      fail(`vite preview exited early (code=${previewExit.code}, signal=${previewExit.signal})\n${serverLog}`);
    }
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  fail('vite preview did not start in time');
}

const browser = await chromium.launch();
let exitCode = 0;

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  log(`preview on ${BASE} (pid ${preview.pid})`);
  await waitForServer();
  const slugs = await fetchSlugs();

  // Remove any stale prerender snapshots so re-runs are idempotent. Leftover
  // dist/<locale> snapshots already contain 3 hreflang tags in <head>; serving
  // them and letting React hydrate on top produced 6 hreflang and failed
  // validation. Snapshots are prerender-owned (build assets live in dist/assets).
  for (const locale of LOCALES) {
    await rm(path.join(DIST, locale), { recursive: true, force: true });
  }

  const routes = [];
  for (const locale of LOCALES) {
    for (const p of PAGES) routes.push(p ? `/${locale}/${p}` : `/${locale}/`);
    for (const slug of slugs) routes.push(`/${locale}/product/${slug}`);
  }

  let ok = 0;
  for (const route of routes) {
    // Render the canonical (slashed) URL so SEO tags built from
    // window.location.pathname carry the trailing slash.
    await page.goto(`${BASE}${canonicalRoute(route)}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(600);
    // Wait for the canonical link to be ATTACHED (product pages render <head> after
    // async hydration). NOTE: must use state:'attached' — the default 'visible' never
    // matches a <head> <link> (no layout box), which made every route time out.
    const canonicalEl = await page
      .waitForSelector('link[rel="canonical"]', { state: 'attached', timeout: 15000 })
      .catch(() => null);
    if (!canonicalEl) {
      fail(`route ${route}: canonical not found after 15s (SPA failed to render <head>)`);
    }
    const canonical = await canonicalEl.getAttribute('href');
    const canonicalCount = await page.locator('link[rel="canonical"]').count();
    const hreflangCount = await page.locator('link[rel="alternate"][hreflang]').count();
    const title = await page.title();
    if (canonicalCount !== 1 || hreflangCount !== 3 || !canonical || !title) {
      fail(`route ${route}: expected 1 canonical + 3 hreflang + title, got ${canonicalCount} canonical / ${hreflangCount} hreflang / "${title}"`);
    }
    const html = await page.evaluate(() => '<!DOCTYPE html>' + document.documentElement.outerHTML);
    const outFile = path.join(DIST, ...route.split('/').filter(Boolean), 'index.html');
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, html, 'utf8');
    ok++;
    log(`snapshot ${route} -> ${path.relative(ROOT, outFile)}`);
  }

  if (ok !== routes.length) {
    fail(`only ${ok}/${routes.length} routes prerendered — refusing to produce an incomplete build`);
  }

  await writeFile(path.join(DIST, 'sitemap.xml'), buildSitemap(slugs), 'utf8');
  log('wrote dist/sitemap.xml with hreflang alternates');

  log(`done: ${ok}/${routes.length} routes prerendered`);
} catch (err) {
  console.error(`[prerender] ERROR: ${err.message}`);
  if (serverLog.includes('Error') || serverLog.includes('ERROR')) console.error(serverLog);
  exitCode = 1;
} finally {
  await browser.close().catch(() => {});
  killPreview();
}

process.exit(exitCode);
