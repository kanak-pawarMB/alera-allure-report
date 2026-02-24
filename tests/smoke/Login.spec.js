// @ts-check
import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

/**
 * SMOKE TEST - Login Page
 * Qase Suite: 53 (Smoke - Login)
 */

test.describe('Login Page - Smoke Tests', () => {

  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // Qase ID: 488
  test('ONEVIEW-488: Verify Login Page Loads @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '488' });
    await loginPage.assertPageLoaded();
  });

  // Qase ID: 489
  test('ONEVIEW-489: Verify Microsoft Login Button @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '489' });
    await loginPage.assertPageLoaded();
    await loginPage.clickMicrosoftLogin();
    await page.waitForURL(/(login\.microsoftonline|login\.microsoft|microsoftonline)\./i, { timeout: 15000 });
  });
});
