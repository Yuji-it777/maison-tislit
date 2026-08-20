import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

const LOCALES = ['en', 'nl'];
const PAGES = ['', 'shop', 'about', 'contact', 'shipping', 'returns', 'tracking'];
const PAGE_META = {
  '':      { priority: 1.0, changefreq: 'weekly' },
  shop:    { priority: 0.9, changefreq: 'weekly' },
  about:   { priority: 0.6, changefreq: 'monthly' },
  contact: { priority: 0.5, changefreq: 'yearly' },
  shipping:{ priority: 0.4, changefreq: 'yearly' },
  returns: { priority: 0.4, changefreq: 'yearly' },
  tracking:{ priority: 0.3, changefreq: 'yearly' },
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

function fail(msg) {
  console.error(`[prerender] ERROR: ${msg}`);
  process.exit(1);
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

async function waitForServer(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  fail('vite preview did not start in time');
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildSitemap(slugs) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];
  for (const locale of LOCALES) {
    for (const p of PAGES) {
      const route = p ? `/${locale}/${p}` : `/${locale}/`;
      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(SITE_URL + route)}</loc>`);
      for (const alt of ['en', 'nl']) {
        const altRoute = p ? `/${alt}/${p}` : `/${alt}/`;
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(SITE_URL + altRoute)}"/>`);
      }
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(SITE_URL + (p ? `/en/${p}` : '/en/'))}"/>`);
      lines.push(`    <changefreq>${PAGE_META[p].changefreq}</changefreq>`);
      lines.push(`    <priority>${PAGE_META[p].priority}</priority>`);
      lines.push('  </url>');
    }
  }
  for (const slug of slugs) {
    for (const locale of LOCALES) {
      const route = `/${locale}/product/${slug}`;
      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(SITE_URL + route)}</loc>`);
      for (const alt of ['en', 'nl']) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(SITE_URL + `/${alt}/product/${slug}`)}"/>`);
      }
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(SITE_URL + `/en/product/${slug}`)}"/>`);
      lines.push('    <changefreq>weekly</changefreq>');
      lines.push('    <priority>0.8</priority>');
      lines.push('  </url>');
    }
  }
  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverLog = '';
preview.stdout.on('data', d => { serverLog += d; });
preview.stderr.on('data', d => { serverLog += d; });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  await waitForServer();
  const slugs = await fetchSlugs();

  const routes = [];
  for (const locale of LOCALES) {
    for (const p of PAGES) routes.push(p ? `/${locale}/${p}` : `/${locale}/`);
    for (const slug of slugs) routes.push(`/${locale}/product/${slug}`);
  }

  let ok = 0;
  for (const route of routes) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(400);
      const hreflangCount = await page.locator('link[rel="alternate"][hreflang]').count();
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      const title = await page.title();
      if (hreflangCount !== 3 || !canonical || !title) {
        fail(`route ${route}: expected 3 hreflang + canonical + title, got ${hreflangCount}/${canonical}/"${title}"`);
      }
      const html = await page.evaluate(() => '<!DOCTYPE html>' + document.documentElement.outerHTML);
      const outFile = path.join(DIST, ...route.split('/').filter(Boolean), 'index.html');
      await mkdir(path.dirname(outFile), { recursive: true });
      await writeFile(outFile, html, 'utf8');
      ok++;
      log(`snapshot ${route} -> ${path.relative(ROOT, outFile)}`);
    } catch (err) {
      fail(`route ${route}: ${err.message}`);
    }
  }

  await writeFile(path.join(DIST, 'sitemap.xml'), buildSitemap(slugs), 'utf8');
  log('wrote dist/sitemap.xml with hreflang alternates');

  log(`done: ${ok}/${routes.length} routes prerendered`);
} finally {
  await browser.close();
  preview.kill();
  if (serverLog.includes('Error') || serverLog.includes('ERROR')) {
    console.error(serverLog);
  }
}