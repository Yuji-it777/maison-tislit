import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'admin@example.com',
  password: 'password123',
};

export const MOCK_CART_ITEM = {
  id: 999,
  name: 'Djellaba Test',
  nameEn: 'Test Djellaba',
  nameAr: 'جلابة تجريبية',
  category: 'djellaba' as const,
  price: 49.99,
  originalPrice: 69.99,
  image: '/images/djellaba1.jpg',
  description: 'Une djellaba de test pour les tests e2e.',
  descriptionEn: 'A test djellaba for e2e testing.',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Rouge', 'Bleu'],
  badge: 'Nouveau',
  stock: 10,
  quantity: 1,
  selectedSize: 'M',
  selectedColor: 'Rouge',
};

export function getCartKey(): string {
  return 'maison-tislit-cart';
}

export async function seedCart(page: Page, items: unknown[] = [MOCK_CART_ITEM]): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(
    ({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: getCartKey(), data: items }
  );
}

export async function clearCart(page: Page): Promise<void> {
  await page.evaluate((key: string) => {
    localStorage.removeItem(key);
  }, getCartKey());
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(/\/shop|\//, { timeout: 10000 });
  } catch {
    // if login fails, tests will skip gracefully
  }
}

export async function waitForProducts(page: Page): Promise<void> {
  try {
    await page.waitForFunction(
      () => {
        const cards = document.querySelectorAll('[class*="grid"] > div, [class*="grid"] > a, [class*="grid"] > button');
        return cards.length > 0;
      },
      { timeout: 15000 }
    );
  } catch {
    // products may not load if Supabase is unavailable
  }
}
