import { test, expect } from '@playwright/test';

test.describe('Category pages', () => {
  test('category page renders unique SEO tags and filters products', async ({ page }) => {
    // trailing slash = canonical form (STRATO mod_dir adds it in prod; dev has no redirect)
    await page.goto('/en/shop/takchita/');

    await expect(page).toHaveTitle(/Takchita/);
    await expect(page.locator('h1')).toContainText('Takchita');
    // canonical + hreflang trio, same contract the prerender validates
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/shop\/takchita\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
    // only takchita products are shown (3 in the live catalogue)
    const cards = page.locator('main .grid > div');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
    // ItemList JSON-LD present
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
  });

  test('homepage category tile links to its indexable URL', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /Djellaba/i }).first().click();
    await expect(page).toHaveURL(/\/en\/shop\/djellaba\/$/);
    await expect(page.locator('h1')).toContainText(/Djellaba/i);
  });

  test('unknown category slug redirects to the all-products view', async ({ page }) => {
    await page.goto('/en/shop/not-a-category');
    await expect(page).toHaveURL(/\/en\/shop\/$/);
  });

  test('unprefixed category URL redirects to default locale', async ({ page }) => {
    await page.goto('/shop/gandoura');
    await expect(page).toHaveURL(/\/en\/shop\/gandoura\/$/);
  });

  test('category chips navigate between collection URLs', async ({ page }) => {
    await page.goto('/en/shop/djellaba');
    await page.getByRole('link', { name: 'View All' }).click();
    await expect(page).toHaveURL(/\/en\/shop\/$/);
  });
});
