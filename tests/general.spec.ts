import { test, expect } from '@playwright/test';

test.describe('General', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Maison Tislit/);

    await expect(page.getByText('Maison Tislit').first()).toBeVisible();
    await expect(page.getByText('Collection 2025').first()).toBeVisible();
  });

  test('navigation works — Home and Shop links', async ({ page }) => {
    await page.goto('/');

    if ((page.viewportSize()?.width ?? 1280) < 768) {
      await page.locator('nav button').filter({ has: page.locator('svg path[d*="M4 6h16"]') }).click();
      await page.waitForTimeout(300);
    }

    await page.locator('nav').getByRole('button', { name: 'Shop', exact: true }).first().click();
    await expect(page).toHaveURL(/\/shop/);

    await page.getByText('Maison Tislit').first().click();
    await expect(page).toHaveURL(/\/(en|nl)\/?$/);
  });

  test('language toggle switches between /en and /nl URLs', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\//);

    await page.getByRole('button', { name: 'Toggle language' }).click();
    await expect(page).toHaveURL(/\/nl\/?/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');

    await page.getByRole('button', { name: 'Toggle language' }).click();
    await expect(page).toHaveURL(/\/en\/?/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('navigation works — cart icon navigates to /cart', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(/Cart|Winkelwagen/).first().click();
    await expect(page).toHaveURL(/\/cart/);
  });
});
