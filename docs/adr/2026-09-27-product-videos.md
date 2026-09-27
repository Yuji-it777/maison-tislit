# 2026-09-27-product-videos

## Status
Accepted

## Context
Products already carry photos: `image` (cover) and `gallery` (additional photos),
rendered in a thumbnail strip on the product detail page and the quick-view
modal. Merchants now want to show the garment in motion — drape, movement,
embroidery close-up — without leaving the product page.

Constraints:
- Videos are hosted in the existing public `product-images` Supabase Storage
  bucket (same upload path and RLS as photos; no new policies needed).
- The site is statically hosted and self-hosted video is bandwidth-heavy: a
  heavy clip slows the product page for every shopper.
- `index.html` ships a strict CSP. `media-src` allowed only `'self'` and
  `res.cloudinary.com`, and `img-src` did not list Supabase at all, so any
  Storage-hosted medium was silently blocked by the browser.

## Decision
Store clips in a dedicated column and play them in the existing viewer:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos TEXT[];
```

- The column is NULLABLE and has no default, deliberately: pasted into the
  Supabase SQL Editor, `NOT NULL DEFAULT '{}'` arrived without its braces (22P02)
  and `ARRAY[]::TEXT[]` arrived without a colon (42601), so migration 00030 keeps
  only characters that survive a paste. Every read site normalizes
  (`Array.isArray(row.videos) ? row.videos : []`), so `NULL` and `'{}'` render
  identically and nothing in the code depends on the NOT NULL.

- `productMedia()` returns photos first (cover, then gallery), then videos as
  one ordered list, so the detail page and the modal stay in sync by
  construction.
- Videos render as `<video preload="metadata">` thumbnails with a play badge and
  a `#t=0.1` fragment (forces a real first frame instead of a black box).
- Selecting a video swaps the main frame to `<video controls autoPlay playsInline>`
  inside the same `object-contain` frame as photos.
- `image` stays the cover everywhere (cards, cart, checkout, `og:image`), and
  product JSON-LD keeps listing photos only (VideoObject requires fields the
  catalog does not collect, e.g. uploadDate, and invalid markup is worse than
  none).
- CSP fixed: `media-src 'self' https://*.supabase.co https://res.cloudinary.com`
  and `https://*.supabase.co` added to `img-src` — this also repairs
  Admin-uploaded photos, which were blocked before.

## Consequences
### Positive
- No new host or player dependency; the browser plays the file directly.
- Zero change for products without videos: `NULL` and `'{}'` both normalize to an
  empty list, so the strip stays photos-only.
- One extra column, no joins; `select('*')` already returns it.
- The CSP fix unblocks Storage-hosted photos too, not just videos.

### Negative
- Self-hosted video costs Storage bandwidth; large clips hurt page speed. Admin
  guidance is 10-20s and under ~20 MB, but nothing enforces it at the DB level.
- Only one clip format family is practical (mp4/webm); no adaptive streaming.
- No poster frame — the thumbnail relies on the browser rendering frame 0.1s.

### Neutral
- Clips live in the same bucket as photos, so the storage layout stays flat.
- Played with sound: `autoPlay` runs off the click gesture that selected it.
- Live `videos` rows are edited through Admin, not raw SQL. The one exception —
  correcting `bride-vedio.mp4` to `bride-video.mp4` after the repo rename — went
  in as a one-shot `array_replace` and was verified. What broke the spec next
  was the reverse race: an already-open Admin form, still holding the pre-rename
  path, re-saved it afterwards (last-write-wins), feeding the player
  HTML-where-video-should-be (`DEMUXER_ERROR_COULD_NOT_OPEN`). The lesson is
  operational: after a rename, anyone with the product modal open must reload it
  before saving, or the stale value wins. The hardened spec (`readyState ≥ 2`,
  `currentTime` advances) caught this instead of passing on a wrong URL;
  migrations still only add columns, and `check-media-columns.mjs` gates
  presence *and* the `text[]` type.

## Alternatives Considered
- **YouTube/Vimeo embed**: no bandwidth cost and adaptive quality, but needs
  `frame-src` CSP entries, adds a third-party player, and the clip must be
  published publicly. Rejected for now; the model supports it later by storing
  an embed URL and branching in the viewer.
- **Merge into one `media`/`gallery` column with type prefixes** (e.g.
  `video:https://…`): avoids a second column, but encodes type in a string,
  breaks the existing photo-only admin UI, and makes validation fragile.
- **Separate `product_videos` table**: normalized and would allow per-clip
  metadata (poster, duration, position), but needs new RLS policies, joins and
  admin plumbing for a feature that currently needs one column.
