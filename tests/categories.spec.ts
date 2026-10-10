import { test, expect } from '@playwright/test';

test.describe('Category pages', () => {
  test('category page renders unique SEO tags and filters products', async ({ page }) => {
    // trailing slash = canonical form (STRATO mod_dir adds it in prod; dev has no redirect)
    await page.goto('/en/shop/gandoura/');

    await expect(page).toHaveTitle(/Gandoura/);
    await expect(page.locator('h1')).toContainText('Gandoura');
    // canonical + hreflang trio, same contract the prerender validates
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/shop\/gandoura\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
    // only gandoura products are shown
    const cards = page.locator('main .grid > div');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
    // ItemList JSON-LD present
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
  });

  test('removed category slugs redirect to the shop view', async ({ page }) => {
    // takchita/jabador pages were removed; the SPA guard falls back to /shop
    await page.goto('/en/shop/takchita');
    await expect(page).toHaveURL(/\/en\/shop\/$/);
    await page.goto('/en/shop/jabador');
    await expect(page).toHaveURL(/\/en\/shop\/$/);
  });

  test('homepage category tile links to its indexable URL', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /Gandoura/i }).first().click();
    await expect(page).toHaveURL(/\/en\/shop\/gandoura\/$/);
    await expect(page.locator('h1')).toContainText(/Gandoura/i);
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
    await page.goto('/en/shop/gandoura');
    await page.getByRole('link', { name: 'View All' }).click();
    await expect(page).toHaveURL(/\/en\/shop\/$/);
  });

  test('empty collection stays routable but unlinked and noindexed', async ({ page }) => {
    // djellaba has no products: no chip on /shop, no tile on home,
    // and the direct URL renders a noindexed empty state.
    await page.goto('/en/shop/');
    await expect(page.locator('main .grid > div').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Djellaba', exact: true })).toHaveCount(0);

    await page.goto('/en/');
    await expect(page.getByRole('link', { name: /Gandoura/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Djellaba/i })).toHaveCount(0);

    await page.goto('/en/shop/djellaba/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});
