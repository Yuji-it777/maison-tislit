import { test, expect } from '@playwright/test';

test.describe('Mobile responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('homepage is usable at 375px viewport', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Maison Tislit/);

    await expect(page.getByText('Maison Tislit').first()).toBeVisible();
    await expect(page.getByText('Collection 2027').first()).toBeVisible();
  });

  test('shop page renders correctly on mobile', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Our Boutique/i })).toBeVisible();
  });

  test('shop category bar does not overflow on mobile', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    // Check that the sticky category bar is not overflowing
    const categoryBar = page.locator('.sticky.top-20').first();
    await expect(categoryBar).toBeVisible();
    
    // Check that category chips are visible
    await expect(page.getByRole('link', { name: /View All/i }).first()).toBeVisible();
    
    // Verify no horizontal scrollbar on the category bar
    const barInner = page.locator('.max-w-7xl.mx-auto.px-6.py-4').first();
    const scrollWidth = await barInner.evaluate(el => el.scrollWidth);
    const clientWidth = await barInner.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px rounding
  });

  test('cart page renders correctly on mobile', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByText('My Cart').or(page.getByText('Mijn Winkelwagen')).or(page.getByText('Your cart is empty')).or(page.getByText('Uw winkelwagen is leeg'))
    ).toBeVisible();
  });
});
