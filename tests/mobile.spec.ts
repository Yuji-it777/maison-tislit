import { test, expect } from '@playwright/test';

test.describe('Mobile responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('homepage is usable at 375px viewport', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Maison Tislit/);

    await expect(page.getByText('Maison Tislit').first()).toBeVisible();
    await expect(page.getByText('Collection 2025').first()).toBeVisible();
  });

  test('shop page renders correctly on mobile', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Our Boutique/i })).toBeVisible();
  });

  test('cart page renders correctly on mobile', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByText('My Cart').or(page.getByText('Mijn Winkelwagen')).or(page.getByText('Your cart is empty')).or(page.getByText('Uw winkelwagen is leeg'))
    ).toBeVisible();
  });
});
