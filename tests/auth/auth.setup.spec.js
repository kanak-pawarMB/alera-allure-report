import { test, expect } from '@playwright/test';

test.describe('Microsoft Login Setup — Save session', () => {

  test('login and save session', async ({ page }) => {
    test.setTimeout(180000);

    await page.goto('https://qa.oneview.alerahealth.com');

    // Click Microsoft login
    await page.getByRole('button', { name: /login with microsoft/i }).click();

    const email = process.env.MS_EMAIL;
    const password = process.env.MS_PASSWORD;

    if (!email || !password) {
      throw new Error('MS_EMAIL or MS_PASSWORD missing in .env');
    }

    // Step 1 — Email
    await page.getByRole('textbox', { name: /email/i }).fill(email);
    await page.getByRole('button', { name: /next/i }).click();

    // Step 2 — Password
    await page.getByRole('textbox', { name: /password/i }).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Step 3 — Stay Signed In screen (occurs only once)
    const staySignedIn = page.getByRole('button', { name: /yes/i });
    if (await staySignedIn.isVisible().catch(() => false)) {
      await staySignedIn.click();
    }

   // Wait for dashboard URL
await page.waitForURL('**/dashboard', { timeout: 90000 });

// A reliable single element selector
const searchInput = page.getByPlaceholder("Search by Patient's Medicaid ID").first();
await expect(searchInput).toBeVisible({ timeout: 60000 });

await page.waitForTimeout(3000);  // allow session cookies + origins to attach

await page.context().storageState({ path: 'auth.json' });
console.log(">>> Session stored in auth.json — LOGIN SUCCESS");

  });
});
