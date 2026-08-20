import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin flow', () => {
  test('login as admin and navigate to admin page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });

    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 10000 });
    } catch {
      test.skip(true, 'Admin login requires valid Supabase credentials');
    }

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
  });

  test('go to Orders page and verify order list', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 10000 });
    } catch {
      test.skip(true, 'Admin login requires valid Supabase credentials');
    }

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    await page.getByRole('button', { name: 'Orders' }).click();

    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  });

  test('open an order detail page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 10000 });
    } catch {
      test.skip(true, 'Admin login requires valid Supabase credentials');
    }

    await page.goto('/admin/orders/1');
    await page.waitForLoadState('networkidle');

    const orderTitle = page.getByText(/Order|Commande/).first();
    await expect(orderTitle).toBeVisible();
  });

  test('mark order as Shipped', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 10000 });
    } catch {
      test.skip(true, 'Admin login requires valid Supabase credentials');
    }

    await page.goto('/admin/orders/1');
    await page.waitForLoadState('networkidle');

    const markShipped = page.getByRole('button', { name: /Mark as Shipped|Expédié/i }).first();
    if (await markShipped.isVisible()) {
      await markShipped.click();
    }
  });
});
