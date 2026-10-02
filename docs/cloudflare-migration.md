# Cloudflare Pages Migration — maisontislit.com

Goal: move hosting from STRATO (503s under load) to Cloudflare Pages (free, global CDN),
**keeping STRATO email working**. Domain registration stays at STRATO.

## Current live DNS (verified 2026-10-03)

| Type   | Name                     | Value                            | Notes                                        |
|--------|--------------------------|----------------------------------|----------------------------------------------|
| NS     | apex                     | docks17.rzone.de                 | STRATO nameservers                           |
| NS     | apex                     | shades09.rzone.de                | STRATO nameservers                           |
| A      | apex                     | 217.160.0.84                     | STRATO web server                            |
| AAAA   | apex                     | 2001:8d8:100f:f000::200          | **REMOVE at cutover** — else IPv6 visitors keep hitting STRATO |
| CNAME  | www                      | → apex (217.160.0.84)            | replaced by Pages www domain at cutover      |
| MX     | apex                     | 5 → smtp.rzone.de                | **Email active — preserve, DNS only**        |
| TXT    | `_dmarc`                 | `v=DMARC1;p=reject;`             | **Preserve** — p=reject bounces mail if DKIM breaks |
| TXT    | `strato-dkim-0002._domainkey` | `v=DKIM1; k=rsa; p=MIIB…`   | **Preserve** — full value: `nslookup -type=TXT strato-dkim-0002._domainkey.maisontislit.com 1.1.1.1` |
| TXT    | apex (SPF)               | none found                       | No SPF record at apex                        |

STRATO panel: *Domains → DNS settings* shows all records. *Email* section shows mailboxes.
Cloudflare's zone scan queries STRATO's nameservers directly and should import all of the
above automatically — the job is to **verify** each record post-import, not retype them.

## Phase 1 — Pages project (dashboard, one-time)

Workers & Pages → Create → Pages → Connect to Git → repo `maison-tislit`:

- Project name: `maison-tislit` · Production branch: **`master`**
- Build command: `npm run build:cf` (repo script = `npx playwright install chromium &&
  npm run build:seo`. `--with-deps` is NOT used — it needs sudo, which the CF build
  image doesn't allow; the image ships the required system libraries. Chromium also
  launches with `--no-sandbox` in prerender.mjs for container safety.)
- Build output directory: `dist`
- Env vars (Production): `NODE_VERSION=22`, `VITE_SITE_URL=https://maisontislit.com`,
  `VITE_WHATSAPP_NUMBER=31620813588`, plus `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_TURNSTILE_SITE_KEY` (values in local `.env`, not committed).

Note: Cloudflare Pages does **not** read `pages.toml` — the values above must be entered
in the dashboard. `public/_redirects` **is** honored (301s + SPA fallback). Vite copies
`public/*` verbatim, so `_redirects` lands in `dist` on every build.

## Phase 2 — Verify *.pages.dev before touching DNS

- `/` → 301 to `/en/`; `/en/` → 200 with prerendered snapshot (canonical = maisontislit.com)
- `/assets/*.js` → 200, `content-type: application/javascript` (SPA fallback must NOT shadow assets)
- `/product/emerald-royal-djellaba` → 301 to slashed `/en/product/emerald-royal-djellaba/`
- If the `/* /index.html 200` fallback shadows snapshots, fix `public/_redirects` and redeploy.

## Phase 3 — DNS move (email-safe order)

1. Cloudflare dashboard → **Add a domain** → `maisontislit.com` → Free plan.
2. Review auto-imported records. Must exist after import:
   - `MX @ → smtp.rzone.de (prio 5)` — **DNS only (grey cloud), never proxied**
   - `TXT _dmarc → v=DMARC1;p=reject;`
   - `TXT strato-dkim-0002._domainkey → v=DKIM1; k=rsa; p=MIIB…` (compare against the
     `nslookup` command in the table above — DKIM keys must match exactly)
   - Old A `217.160.0.84` and AAAA may stay for now (AAAA removed at cutover step 4)
3. Add custom domain in Pages project (Custom domains → `maisontislit.com` and
   `www.maisontislit.com`). Cloudflare creates the apex CNAME (flattened) and www CNAME;
   let it replace the apex A record when prompted.
4. **Last**: at STRATO (*Domains → nameserver settings*) change nameservers to the two
   Cloudflare-assigned NS. Default TTL is 300s, so cutover is usually minutes.
5. Verify: `server: cloudflare` response header, site + email test (send/receive).

## Rollback

Change nameservers back to `docks17.rzone.de` / `shades09.rzone.de` — traffic returns to
STRATO immediately. Email is unaffected either way while MX → smtp.rzone.de stays in place.

## Aftermath

- Keep the STRATO package while mailboxes are hosted there (cancel web hosting only if the
  plan allows it).
- Deploys are now `git push origin master` — no SFTP. `npm run deploy` (STRATO) is obsolete.
