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
    // Step 1 — Email (using Microsoft's specific selectors for cross-browser compatibility)
    const emailInput = page.locator('input[type="email"], input[name="loginfmt"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await emailInput.fill(email);
    const nextButton = page.locator('input[type="submit"]#idSIButton9, button[type="submit"]').first();
    await nextButton.click();
    // Step 2 — Password (wait for password page to load)
    const passwordInput = page.locator('input[type="password"], input[name="passwd"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 30000 });
    await passwordInput.fill(password);
    const signInButton = page.locator('input[type="submit"]#idSIButton9, button[type="submit"]').first();
    await signInButton.click();
    // Step 3 — Stay Signed In screen (handle "Yes" button if it appears)
    await page.waitForTimeout(2000); // Wait for page transition
    const staySignedInYes = page.locator('#idSIButton9, input[value="Yes"], button:has-text("Yes")').first();
    try {
      // Wait for either Yes button or dashboard redirect
      await Promise.race([
        staySignedInYes.waitFor({ state: 'visible', timeout: 15000 }),
        page.waitForURL('**/dashboard', { timeout: 15000 })
      ]);
      // If Yes button is visible, click it
      if (await staySignedInYes.isVisible().catch(() => false)) {
        await staySignedInYes.click();
      }
    } catch (e) {
      // Already redirected to dashboard or no "Stay signed in" prompt
    }
    // Wait for dashboard URL
    await page.waitForURL('**/dashboard', { timeout: 90000 });
    // Verify dashboard loaded with a reliable element
    const searchInput = page.getByPlaceholder("Search by Patient's Medicaid ID").first();
    await expect(searchInput).toBeVisible({ timeout: 60000 });
    // Allow session cookies to attach
    await page.waitForTimeout(3000);
    // Save session state
    await page.context().storageState({ path: 'auth.json' });
    console.log(">>> Session stored in auth.json — LOGIN SUCCESS");
  });
});