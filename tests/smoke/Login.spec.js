// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Login Page
 * Qase Suite: 53 (Smoke - Login)
 */

test.describe('Login Page - Smoke Tests', () => {
  const LOGIN_URL = TEST_DATA.urls.login;

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL, { timeout: 90000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
  });

  // Qase ID: 488
  test('ONEVIEW-488: Verify Login Page Loads @smoke', async ({ page }) => {
    // Expected: Login page shows ONEview branding and MS login button
    await expect(page).toHaveURL(/qa\.oneview\.alerahealth\.com\/login/i);

    const microsoftButton = page.getByRole('button', { name: /Login with Microsoft/i });
    await expect(microsoftButton).toBeVisible({ timeout: 10000 });
  });

  // Qase ID: 489
  test('ONEVIEW-489: Verify Microsoft Login Button @smoke', async ({ page }) => {
    const microsoftButton = page.getByRole('button', { name: /Login with Microsoft/i });
    await expect(microsoftButton).toBeVisible({ timeout: 10000 });

    await microsoftButton.click();

    // Verify redirect intent to Microsoft login
    await expect(page).toHaveURL(/(login\.microsoftonline|login\.microsoft|microsoftonline)\./i, { timeout: 15000 });
  });
});
