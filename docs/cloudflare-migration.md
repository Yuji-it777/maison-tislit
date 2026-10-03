# Cloudflare Pages Migration — maisontislit.com

Goal: move hosting from STRATO (503s under load) to Cloudflare Pages (free, global CDN),
**keeping STRATO email working**. Domain registration stays at STRATO.

## Status — 2026-10-03: live on Cloudflare Pages

- Cutover complete: nameservers are Cloudflare's, and apex + `www` are **Active** custom
  domains of the Pages project.
- New build confirmed live: `assets/index-C_UjGmR5.js` is served by apex, `www`, and
  `maison-tislit.pages.dev`.
- Email DNS survived the move (MX, DMARC, DKIM verified).
- Path redirects (`_redirects`), SPA fallback, HTTPS, and canonical/og/hreflang tags: all
  verified — details in [Post-cutover verification](#post-cutover-verification-live-2026-10-03).
- **Canonical host enforced:** `www.maisontislit.com` now 301s to `maisontislit.com` with
  paths and query strings preserved — see
  [Resolved: www redirects to the apex](#resolved-www-redirects-to-the-apex-2026-10-03).

## Pre-cutover DNS snapshot (STRATO, 2026-10-03)

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

This table is the migration-time record; the authoritative records now live in Cloudflare's
zone — see [Post-cutover verification](#post-cutover-verification-live-2026-10-03).

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

**Status: done (2026-10-03)** — the Pages project `maison-tislit` is live on branch `master`
with both custom domains Active.

## Phase 2 — Verify *.pages.dev before touching DNS

- `/` → 301 to `/en/`; `/en/` → 200 with prerendered snapshot (canonical = maisontislit.com)
- `/assets/*.js` → 200, `content-type: application/javascript` (SPA fallback must NOT shadow assets)
- `/product/emerald-royal-djellaba` → 301 to slashed `/en/product/emerald-royal-djellaba/`
- If the `/* /index.html 200` fallback shadows snapshots, fix `public/_redirects` and redeploy.

**Status: passed (2026-10-03)** — `maison-tislit.pages.dev/en/` serves the same build hash
(`assets/index-C_UjGmR5.js`) as the custom domains.

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

**Status: done (2026-10-03)** — steps 1–4 complete. Step 5: all site checks below pass and
the email DNS records are confirmed; a live mailbox send/receive test is still worth doing.

## Post-cutover verification (live, 2026-10-03)

Checked from a Dutch network with `curl.exe -sI` and `nslookup … 1.1.1.1`.

### Live DNS (Cloudflare zone)

| Type   | Name | Value | Notes |
|--------|------|-------|-------|
| NS     | apex | `jay.ns.cloudflare.com`, `mina.ns.cloudflare.com` | Replaced the STRATO nameservers |
| A/AAAA | apex | `188.114.96.6` / `188.114.97.6`, `2606:4700:…` | Cloudflare anycast (Pages, flattened) |
| A      | `www` | `104.21.52.254` / `172.67.206.77` | Proxied (same Pages project) |
| MX     | apex | `5 → smtp.rzone.de` | **Preserved** — STRATO mailboxes still work |
| TXT    | `_dmarc` | `v=DMARC1;p=reject;` | **Preserved** |
| TXT    | `strato-dkim-0002._domainkey` | `v=DKIM1; k=rsa; p=MIIB…` | **Preserved** — matches the pre-cutover key |
| TXT    | apex (SPF) | none found | Unchanged (was already absent) |

### HTTP checks

| Request | Result | Verdict |
|---------|--------|---------|
| `http://maisontislit.com/` | 301 → `https://maisontislit.com/` | ✅ |
| `http://www.maisontislit.com/` | 301 → `https://www.maisontislit.com/` | ✅ |
| `https://maisontislit.com/` | 301 → `/en/`, then 200 | ✅ |
| `https://www.maisontislit.com/` | 301 → `https://maisontislit.com/`, then 301 → `/en/`, 200 | ✅ |
| `https://www.maisontislit.com/en/` | 301 → `https://maisontislit.com/en/` | ✅ canonical host enforced |
| `https://www.maisontislit.com/en/shop/?q=test` | 301 → apex, path + query kept | ✅ |
| `/en/` on apex, `www`, pages.dev (pre-rule) | `<script src="/assets/index-C_UjGmR5.js">` on all three | ✅ new build live |
| `/assets/index-C_UjGmR5.js` | 200 on apex (`application/javascript`); 301 → apex on `www` | ✅ SPA fallback doesn't shadow assets |
| `/product/emerald-royal-djellaba` | 301 → `/en/product/emerald-royal-djellaba/` | ✅ |
| `/en/product/emerald-royal-djellaba` (no slash) | 308 → slashed form | ✅ Pages' native trailing-slash normalization (not from `_redirects`) |
| `/en/shop/takchita` | 301 → `/en/shop/caftan/` | ✅ |
| `/en/product/nour-al-qamar-takchita-2` | 301 → `/en/product/nour-al-qamar-caftan/` | ✅ |
| `/en/shop/takchita` on `www` (pre-rule) | 301 → apex path, then `_redirects` → `/en/shop/caftan/` | ✅ |
| `/en/cart/` | 200 | ✅ SPA fallback works |
| `/robots.txt` | 200; points to `https://maisontislit.com/sitemap.xml` | ✅ |
| `/sitemap.xml` | 200, `application/xml` | ✅ |
| `server:` header, all responses | `cloudflare` | ✅ |

SEO metadata spot-check (taken while `www` still served HTML): `<link rel="canonical">`,
`og:url`, and every `hreflang` alternate point at `https://maisontislit.com/…`. With the
www→apex redirect rule live, HTTP and crawler signals now agree on the apex.

## Rollback

Change nameservers back to `docks17.rzone.de` / `shades09.rzone.de` — traffic returns to
STRATO immediately. Email is unaffected either way while MX → smtp.rzone.de stays in place.
Cloudflare-only rules (like the www redirect below) go inactive with the zone — nothing has
to be undone in the repo.

## Resolved: www redirects to the apex (2026-10-03)

**Before (morning of 2026-10-03):** `https://www.maisontislit.com/en/` returned 200 and stayed
on `www.` — both hostnames are Active custom domains on the same Pages project, so Pages
served both with no host canonicalization. **Now:** fixed — details below.

`public/_redirects` cannot fix this: its source paths are site-relative only (see the
[Pages redirects docs](https://developers.cloudflare.com/pages/configuration/redirects/)).
Host-based redirects are a zone-level rule.

**Fix deployed (zone-level Redirect Rule):** Cloudflare dashboard → zone
**maisontislit.com** → Rules → Redirect Rules — wildcard pattern
`https://www.maisontislit.com/*` → dynamic target `https://maisontislit.com/${1}`, status
**301**, preserve query string. This is Cloudflare's documented
[Redirect from WWW to root](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/)
pattern, scoped to this domain.

Alternative (what the Pages docs recommend): **Bulk Redirects** — create a list with source
`www.maisontislit.com`, target `https://maisontislit.com`, status **301**, parameters
*preserve query string + subpath matching + preserve path suffix + include subdomains*, then a
bulk redirect rule using that list —
[docs](https://developers.cloudflare.com/pages/how-to/www-redirect/). No DNS change needed:
`www` already points at Cloudflare (proxied).

**Re-verified after deploy (2026-10-03):** `https://www.maisontislit.com/en/` → 301 →
`https://maisontislit.com/en/`; `https://www.maisontislit.com/` → 301 →
`https://maisontislit.com/` → 301 → `/en/` (200); the `http://www.` chain upgrades to HTTPS
and also lands on `https://maisontislit.com/en/`; query strings and deep paths preserved.
Results in the HTTP-checks table above.

Re-verify anytime:

```
curl.exe -sI https://www.maisontislit.com/                     # 301, location: https://maisontislit.com/
curl.exe -sI "https://www.maisontislit.com/en/shop/?q=test"    # 301 to apex, path + query kept
```

## Aftermath

- Keep the STRATO package while mailboxes are hosted there (cancel web hosting only if the
  plan allows it).
- Deploys are now `git push origin master` — no SFTP. `npm run deploy` (STRATO) is obsolete.
- Optional: `maison-tislit.pages.dev` still serves the same build publicly; Cloudflare's
  Pages docs cover redirecting `*.pages.dev` to the custom domain if you want to close that
  duplicate surface.
