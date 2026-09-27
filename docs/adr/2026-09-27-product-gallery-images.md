# 2026-09-27-product-gallery-images

## Status
Accepted

## Context
A product carried exactly one photo (`products.image TEXT`), rendered with a
single `<img>` on the shop grid, the quick-view modal, the product detail page,
the cart and the wishlist. Merchants need a second (and, later, a third) photo
per product — front and back, fabric detail, on-model shot — without losing the
existing single-photo behaviour anywhere else.

Constraints: Supabase (Postgres + Storage, RLS policies on `products`), static
hosting with no Node server, and every list surface (cards, cart, checkout,
`og:image`) depending on one predictable cover photo.

## Decision
Add an **additional-photos** column rather than replacing the cover:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery TEXT[] NOT NULL DEFAULT '{}';
```

- `products.image` stays the **cover** and keeps its meaning in every existing
  consumer (shop cards, cart, checkout, wishlist, `og:image`).
- `products.gallery` holds extra photos in display order. `'{}'` means
  "cover only", so all pre-existing rows are valid without a backfill.
- The product detail page and the quick-view modal render a thumbnail strip for
  `image + gallery` (via `productPhotos()`), swapping the main image on click.
  A product with no gallery renders exactly as before.
- Product JSON-LD emits all photos (`image: string[]`), while `og:image` /
  `twitter:image` stay the cover, as social crawlers expect one canonical image.
- Admins manage the column in Admin → Stock → Edit product → Gallery (paste a
  path, or upload one or more files to the `product-images` bucket).

## Consequences
### Positive
- Zero regression risk: nothing that read `image` changes behaviour.
- No backfill and no downtime — the column defaults to `'{}'`.
- Extensible to N photos without another migration.
- Product structured data lists every photo, which is the shape Google expects.

### Negative
- Two fields to reason about: the cover is always the first photo, so
  "make this photo the cover" is a two-step operation in the admin UI today.
- `gallery` order is significant and has no reorder control yet.

### Neutral
- `productPhotos()` in `src/utils/productPhotos.ts` is the single place that
  decides photo order and drops blank entries.
- Uploads stay in the public `product-images` bucket (policy from migration
  00017); no new RLS needs exist because column access follows table policies.

## Alternatives Considered
- **Second fixed column (`image2 TEXT`)**: simplest, but caps the feature at two
  photos and would force another migration the next time a third is needed.
- **`images TEXT[]` replacing `image`, dropping the old column**: single source
  of truth, but it breaks the seed data, every card/cart/checkout consumer and
  requires a backfill — a large blast radius for no user-visible benefit.
- **`product_images` join table (`product_id`, `url`, `position`)**: the most
  normalized option and the only one that supports per-photo metadata (alt text,
  colour variant), but it needs new RLS policies, query joins and admin
  plumbing. Revisit if per-photo metadata is ever required.
