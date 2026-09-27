import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';

// Videos only render once a product has one, so this spec discovers a seeded
// product at runtime and skips while none exists (same convention as
// tests/helpers.ts for a missing DB).
interface VideoProduct {
  slug: string;
  name_en: string;
  image: string;
  videos: string[];
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

async function findProductWithVideo(): Promise<VideoProduct | null> {
  const env = readEnvFile();
  const supabaseUrl = env.VITE_SUPABASE_URL || '';
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) return null;
  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=slug,name_en,image,videos&order=id.asc&limit=100`, { headers });
    const rows = await res.json();
    if (!Array.isArray(rows)) return null; // `videos` missing -> migration 00030 not applied
    return rows.find(
      (row: VideoProduct) => row.slug && row.videos?.length > 0,
    ) ?? null;
  } catch {
    return null;
  }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Product videos', () => {
  test('plays the clip in the main frame when its thumbnail is selected', async ({ page }) => {
    const product = await findProductWithVideo();
    test.skip(product === null, 'no product has a video yet (apply migration 00030 and add one in Admin)');

    const seeded = product as VideoProduct;
    await page.goto(`/en/product/${seeded.slug}/`);

    // the viewer opens on the cover photo, not the video
    const cover = page.getByRole('img', { name: new RegExp(`^${escapeRegExp(seeded.name_en)} `) }).first();
    await expect(cover).toBeVisible();
    await expect(cover).toHaveAttribute('src', seeded.image);

    // videos sit in the same strip as the photos, with a play badge label
    const videoThumbs = page.getByRole('button', { name: /^Video \d/ });
    await expect(videoThumbs).toHaveCount(seeded.videos.length);

    await videoThumbs.first().click();

    // only the main-frame player has controls; thumbnails below do not
    const player = page.locator('video[controls]');
    await expect(player).toBeVisible();
    await expect(player).toHaveAttribute('src', seeded.videos[0]);

    // the clip must really decode: buffered frames available, not just a tag
    await expect
      .poll(async () => player.evaluate((video: HTMLVideoElement) => video.readyState), { timeout: 20000 })
      .toBeGreaterThanOrEqual(2);

    // ... and time must advance (muted so no autoplay policy can block it)
    await player.evaluate((video: HTMLVideoElement) => {
      video.muted = true;
    });
    const started = await player.evaluate((video: HTMLVideoElement) => video.currentTime);
    await player.evaluate((video: HTMLVideoElement) => video.play().catch(() => undefined));
    await page.waitForTimeout(1500);
    const advanced = await player.evaluate((video: HTMLVideoElement) => video.currentTime);
    expect(advanced).toBeGreaterThan(started);

    // switching back to a photo hides the player again
    await page.getByRole('button', { name: /^Photo \d/ }).first().click();
    await expect(page.locator('video[controls]')).toHaveCount(0);
  });
});
