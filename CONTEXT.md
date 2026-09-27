# Domain Context: Maison Tislit E-Commerce

This document defines the core domain vocabulary, concepts, and rules for the Maison Tislit e-commerce website.

## Core Entities

- **Product**: A garment for sale (djellaba, gandoura, caftan). Has `id`, `slug`, `name`, `description`, `price_eur`, `image` (cover), `gallery[]` (extra photos), `videos[]` (short clips), `category`, `color`, `material`, `countryOfOrigin`. Takchita and jabador were removed as categories; legacy DB rows may still carry those values and are excluded from category pages.
- **Category**: A garment type (one of the five above). Used for SEO category pages.
- **Order**: A customer purchase. Has `id`, `items[]`, `total_eur`, `status`, `customer_email`, `shipping_address`.
- **Customer**: A site visitor who may place orders. Identified by email; no account system (guest checkout only).
- **Favorite**: A product a visitor has saved. Stored in `localStorage` (no server persistence).

## Key Concepts

- **Locale**: Language + region (e.g., `en`, `fr`, `ar`). URLs are locale-prefixed (`/en/shop`, `/fr/shop`).
- **Canonical URL**: Slash-less, locale-prefixed, lowercase. Trailing slashes redirect 301 to canonical.
- **SEO**: All pages prerendered with JSON-LD structured data, hreflang sitemap, absolute og:image URLs.
- **Currency**: EUR only. Prices stored as integer cents (`price_eur` = 29900 = €299.00).
- **Images**: WebP format. Alt text localized per locale. `products.image` is the cover (shop cards, cart, checkout, wishlist, `og:image`); `products.gallery text[]` holds additional photos, shown as a thumbnail strip on the product detail page and the quick-view modal. Product photos use `object-contain` (whole garment visible, never cropped).
- **Videos**: `products.videos text[]` holds short mp4/webm clips (nullable: NULL and an empty array both mean "no clips"), shown after the photos in the same thumbnail strip with a play badge; selecting one plays it in the main frame. Keep clips small (10-20s, under ~20 MB). Hosted in the `product-images` Supabase Storage bucket, so the CSP `media-src` must allow `https://*.supabase.co`.

## Business Rules

- No discounts, coupons, or demo pricing (removed).
- No order tracking feature (removed).
- No Arabic product name field (`name_ar` removed).
- Favorites are client-side only (localStorage).
- Contact form submits to Supabase; no backend email service.

## Technical Constraints

- Vite + React + TypeScript.
- Prerendering via `vite-plugin-prerender` + custom script.
- Deploy to STRATO Apache via SFTP + `.htaccess` 301s.
- Netlify redirects for prerendered pages.
- No Node.js server; static hosting only.