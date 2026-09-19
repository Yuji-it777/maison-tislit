import { test, expect, type Page } from '@playwright/test';

test.describe('Contact form CSP / Cloudflare Turnstile', () => {
  test('CSP allows challenges.cloudflare.com for script, frame, and connect', async ({ page }) => {
    await page.goto('/contact');
    const csp = (await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content'))!;
    const lower = csp.toLowerCase();

    expect(lower).toContain('script-src');
    expect(lower).toMatch(/script-src[^;]*https:\/\/challenges\.cloudflare\.com/);
    expect(lower).toMatch(/frame-src[^;]*https:\/\/challenges\.cloudflare\.com/);
    expect(lower).toMatch(/connect-src[^;]*https:\/\/challenges\.cloudflare\.com/);
    expect(lower).toMatch(/style-src[^;]*'unsafe-inline'/);

    // Stripe must not appear anywhere in the CSP
    expect(lower).not.toContain('stripe');
  });

  test('no CSP console errors on the Contact page', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (/Content Security Policy|Refused to (load|connect|frame|execute)|violates the following/i.test(text)) {
          violations.push(text);
        }
      }
    });
    page.on('pageerror', (err) => {
      if (/Content Security Policy|Refused to/i.test(err.message)) violations.push(err.message);
    });

    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
    await page.waitForTimeout(2000);

    expect(violations).toEqual([]);
  });

  test('Contact form Send Inquiry becomes clickable after captcha token resolves', async ({
    page,
  }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);

    // In the automated (webdriver) environment Captcha mock-succeeds,
    // which calls onSuccess and un-disables the submit button.
    const sendButton = page.getByRole('button', { name: /Send Inquiry|Verzoek Verzenden/i });
    await expect(sendButton).toBeEnabled({ timeout: 10000 });
  });
});
