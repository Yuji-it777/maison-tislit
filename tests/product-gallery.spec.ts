import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';

// The gallery only renders once a product actually has extra photos, so this
// spec discovers a seeded product at runtime and skips while none exists
// (same "skip gracefully without a reachable DB" convention as helpers.ts).
interface GalleryProduct {
  slug: string;
  name_en: string;
  image: string;
  gallery: string[];
}

function readEnvFile(): Record<string, string> {
  try {
    const content = readFileSync('.env', 'utf8');
    const result: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) result[match[1]] = match[2].trim();
    }
    return result;
  } catch {
    return {};
  }
}

async function fetchProducts(): Promise<GalleryProduct[]> {
  const env = readEnvFile();
  const supabaseUrl = env.VITE_SUPABASE_URL || '';
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) return [];
  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
  try {
    // `gallery` only exists once migration 00029 has run; fall back to the
    // single-photo shape so the regression test still runs before then.
    for (const select of ['slug,name_en,image,gallery', 'slug,name_en,image']) {
      const res = await fetch(`${supabaseUrl}/rest/v1/products?select=${select}&order=id.asc&limit=100`, { headers });
      const rows = await res.json();
      if (!Array.isArray(rows)) continue;
      return rows
        .filter((row: GalleryProduct) => row.slug && row.name_en && row.image)
        .map((row: GalleryProduct) => ({ ...row, gallery: Array.isArray(row.gallery) ? row.gallery : [] }));
    }
    return [];
  } catch {
    return [];
  }
}

async function findProductWithGallery(): Promise<GalleryProduct | null> {
  const products = await fetchProducts();
  return products.find(p => Array.isArray(p.gallery) && p.gallery.length > 0) ?? null;
}

async function findProductWithoutGallery(): Promise<GalleryProduct | null> {
  const products = await fetchProducts();
  return products.find(p => !Array.isArray(p.gallery) || p.gallery.length === 0) ?? null;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Waits for the client-side render to emit the Product JSON-LD block.
async function getProductLd(page: import('@playwright/test').Page) {
  const handle = await page.waitForFunction(
    () => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const data = JSON.parse(s.textContent || '{}');
          if (data['@type'] === 'Product') return data;
        } catch { /* ignore malformed blocks */ }
      }
      return null;
    },
    null,
    { timeout: 20000 },
  );
  return handle.jsonValue();
}

test.describe('Product gallery', () => {
  test('renders one thumbnail per photo and swaps the main image on click', async ({ page }) => {
    const product = await findProductWithGallery();
    test.skip(product === null, 'no product has gallery photos yet (apply migration 00029 and add photos in Admin)');

    const seeded = product as GalleryProduct;
    await page.goto(`/en/product/${seeded.slug}/`);

    const mainImage = page
      .getByRole('img', { name: new RegExp(`^${escapeRegExp(seeded.name_en)} `) })
      .first();
    await expect(mainImage).toBeVisible();
    await expect(mainImage).toHaveAttribute('src', seeded.image);

    const thumbs = page.getByRole('button', { name: /^Photo \d/ });
    await expect(thumbs).toHaveCount(seeded.gallery.length + 1);

    await thumbs.nth(1).click();
    await expect(mainImage).toHaveAttribute('src', seeded.gallery[0]);

    // back to the cover
    await thumbs.first().click();
    await expect(mainImage).toHaveAttribute('src', seeded.image);
  });

  test('lists every photo in the Product JSON-LD', async ({ page }) => {
    const product = await findProductWithGallery();
    test.skip(product === null, 'no product has gallery photos yet (apply migration 00029 and add photos in Admin)');

    const seeded = product as GalleryProduct;
    await page.goto(`/en/product/${seeded.slug}/`);
    const ld = await getProductLd(page);

    expect(ld).not.toBeNull();
    expect(ld.image).toHaveLength(seeded.gallery.length + 1);
    expect(ld.image[0]).toMatch(new RegExp(`${escapeRegExp(seeded.image)}$`));
    expect(ld.image[1]).toMatch(new RegExp(`${escapeRegExp(seeded.gallery[0])}$`));
  });

  test('a product with no extra photos still renders the cover and no thumbnails', async ({ page }) => {
    const product = await findProductWithoutGallery();
    test.skip(product === null, 'requires a reachable DB with at least one single-photo product');

    const seeded = product as GalleryProduct;
    await page.goto(`/en/product/${seeded.slug}/`);

    const mainImage = page
      .getByRole('img', { name: new RegExp(`^${escapeRegExp(seeded.name_en)} `) })
      .first();
    await expect(mainImage).toBeVisible();
    await expect(mainImage).toHaveAttribute('src', seeded.image);
    await expect(page.getByRole('button', { name: /^Photo \d/ })).toHaveCount(0);
  });
});
