import { test, expect } from '@playwright/test';

// Waits for the client-side render to emit the Product JSON-LD block
// (in dev the product arrives via a Supabase fetch after hydration).
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

test.describe('Product JSON-LD', () => {
  test('emits color, material and countryOfOrigin when fabric is stated', async ({ page }) => {
    await page.goto('/en/product/blue-safira-djellaba/');
    const ld = await getProductLd(page);
    expect(ld).not.toBeNull();
    expect(ld.countryOfOrigin).toBe('MA');
    expect(ld.color).toEqual(expect.arrayContaining(['Bleu Royal']));
    expect(ld.material).toBe('Silk');
  });

  test('omits material when copy names no fabric, keeps color + origin', async ({ page }) => {
    await page.goto('/en/product/emerald-royal-djellaba/');
    const ld = await getProductLd(page);
    expect(ld).not.toBeNull();
    expect(ld.material).toBeUndefined();
    expect(ld.countryOfOrigin).toBe('MA');
    expect(ld.color).toContain('Émeraude');
  });
});
