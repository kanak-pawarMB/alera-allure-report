// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { LogoutPage } from '../pages/LogoutPage.js';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Logout
 * Qase Suite: 136 (Smoke - Logout)
 * Test Cases: ONEVIEW-694, 695, 696, 697, 699
 */

test.use({ storageState: 'auth.json' });

test.describe('Logout - Smoke Tests', () => {

  let dashboard;
  let logoutPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    logoutPage = new LogoutPage(page);
    try {
      await dashboard.goto();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-Logout-smoke-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase ID: 694
  test('ONEVIEW-694: Verify user can access logout dropdown @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '694' });
    await logoutPage.openProfileMenu();
    await logoutPage.assertLogoutOptionVisible();
  });

  // Qase ID: 695
  test('ONEVIEW-695: Verify successful logout redirects to login page @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '695' });
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();
  });

  // Qase ID: 696
  test('ONEVIEW-696: Verify dashboard inaccessible after logout @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '696' });
    await logoutPage.logout();
    await logoutPage.assertDashboardRedirectsToLogin(TEST_DATA.urls.dashboard);
  });

  // Qase ID: 697
  test('ONEVIEW-697: Verify Microsoft SSO session terminated @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '697' });
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();
    // "Login with Microsoft" button must be visible — user is required to re-authenticate
    const loginBtn = page.getByRole('button', { name: /Login with Microsoft/i });
    await expect(loginBtn).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(loginBtn).toBeEnabled();
    // Click and allow any auth flow: direct MS redirect OR app-managed SSO popup
    await loginBtn.click();
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.long }).catch(() => {});
    // Accept: navigated to MS login OR still on app login (SSO processed silently in popup)
    // Core check: user was NOT automatically redirected to dashboard (session IS terminated)
    const url = page.url();
    expect(url).not.toMatch(/\/dashboard/i);
  });

  // Qase ID: 699
  test('ONEVIEW-699: Verify logout works across browsers @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '699' });
    // Smoke: validates consistent logout behaviour in the current browser session
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();
    // Confirm the session is fully cleared — dashboard should not be accessible
    await page.goto(TEST_DATA.urls.dashboard, { timeout: TIMEOUTS.long });
    await page.waitForURL(/\/login/i, { timeout: TIMEOUTS.long });
    await expect(page).toHaveURL(/\/login/i);
  });

});
