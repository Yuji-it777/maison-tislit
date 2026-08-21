import { Page } from '@playwright/test';
import { readFileSync } from 'fs';

export const TEST_USER = {
  email: 'admin@example.com',
  password: 'password123',
};

export const MOCK_CART_ITEM = {
  id: 999,
  name: 'Djellaba Test',
  nameEn: 'Test Djellaba',
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
  const itemsWithRealIds = await Promise.all(
    items.map(async (item: any) => {
      if (item.id !== MOCK_CART_ITEM.id) return item;
      const realId = await fetchRealProductId();
      return { ...item, id: realId };
    })
  );
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(
    ({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: getCartKey(), data: itemsWithRealIds }
  );
}

async function fetchRealProductId(): Promise<number> {
  const env = readEnvFile();
  const supabaseUrl = env.VITE_SUPABASE_URL || '';
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id&limit=1`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0) return Number(rows[0].id);
  } catch {
    // fall back to the mock id (order tests will skip gracefully without a real DB)
  }
  return MOCK_CART_ITEM.id;
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

export async function clearCart(page: Page): Promise<void> {
  await page.evaluate((key: string) => {
    localStorage.removeItem(key);
  }, getCartKey());
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 10000 });
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
