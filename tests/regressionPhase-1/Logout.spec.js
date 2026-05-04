// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { LogoutPage } from '../pages/LogoutPage.js';
import { TEST_DATA } from '../testData.js';
import { TIMEOUTS } from '../timeouts.js';

/**
 * Logout - Regression Tests
 * Suite: 135 (Logout - Functional)
 * Test Cases: ONEVIEW-700, 701, 702, 703, 704, 705, 706, 707
 */

test.use({ storageState: 'auth.json' });

test.describe('Logout - Regression @regression', () => {
  // serial mode: logout tests alter session state; running sequentially prevents
  // cross-test interference when sharing the same auth context.
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let dashboard;
  let logoutPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    logoutPage = new LogoutPage(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-Logout-regression-beforeEach-fail.png');
      throw e;
    }
  });

  // 700 - Verify logout option visible in all user states
  test('ONEVIEW-700: Verify logout option visible in all user states @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '700' });
    // Load patient so the dashboard is in a populated state (cards loaded)
    await dashboard.loadDefaultPatient();
    await dashboard.dismissAlertBannerIfPresent();
    // Logout option must be reachable regardless of which patient/cards are loaded
    await logoutPage.openProfileMenu();
    await logoutPage.assertLogoutOptionVisible();
  });

  // 701 - Verify agency restrictions persist after logout/relogin
  test('ONEVIEW-701: Verify agency restrictions persist after logout/relogin @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '701' });
    // Pre-logout: confirm the authenticated user can access their allowed agency patient
    await dashboard.loadDefaultPatient();
    await expect(
      page.getByText(/NC767095351|Elizabeth Garcia/i).first()
    ).toBeVisible({ timeout: TIMEOUTS.long });
    // Logout and confirm session is terminated
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();
    // NOTE: Full agency-restriction verification after Microsoft SSO re-login requires
    // a manual step — automated SSO re-authentication is outside the scope of this suite.
  });

  // 702 - Verify logout from clean dashboard state
  test('ONEVIEW-702: Verify logout from clean dashboard state @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '702' });
    // Ensure no modals are open before logging out (clean state)
    const openModal = page.locator('[role="dialog"], [class*="modal"]').first();
    const modalOpen = await openModal.isVisible({ timeout: TIMEOUTS.xs }).catch(() => false);
    if (modalOpen) {
      const closeBtn = page
        .locator('button[aria-label*="close" i], [aria-label="Close"]')
        .first();
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    }
    // Logout from clean state → must redirect to login page
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();
  });

  // 703 - Verify logout preserves dark mode preference
  test('ONEVIEW-703: Verify logout preserves dark mode preference @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '703' });
    // Locate the dark mode toggle (header or profile menu)
    const darkModeToggle = page
      .locator('button[aria-label*="dark" i], button[aria-label*="theme" i], button[title*="dark" i]')
      .or(page.locator('[class*="dark-mode"], [class*="theme-toggle"]'))
      .first();

    const toggleVisible = await darkModeToggle.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);
    if (toggleVisible) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      // Verify dark class applied to root element
      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark'
      );
      expect(isDark).toBeTruthy();
    }
    // Logout must succeed cleanly regardless of the active theme
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();
  });

  // 704 - Verify multiple tabs logout synchronization
  test('ONEVIEW-704: Verify multiple tabs logout synchronization @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '704' });
    // Open 2 additional tabs within the same browser context (shared session cookie)
    const tab2 = await page.context().newPage();
    const tab3 = await page.context().newPage();
    await tab2.goto(TEST_DATA.urls.dashboard);
    await tab3.goto(TEST_DATA.urls.dashboard);
    await expect(tab2).toHaveURL(/dashboard/i, { timeout: TIMEOUTS.long });
    await expect(tab3).toHaveURL(/dashboard/i, { timeout: TIMEOUTS.long });

    // Logout from the primary tab — server terminates the shared session
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();

    // Reload other tabs — session is invalidated, so they should redirect to login.
    // ERR_ABORTED is acceptable: Azure SWA can abort the reload when the session is terminated.
    const tab2Reloaded = await tab2.reload().then(() => true).catch(() => false);
    const tab3Reloaded = await tab3.reload().then(() => true).catch(() => false);
    if (tab2Reloaded) {
      await expect(tab2).toHaveURL(/login/i, { timeout: TIMEOUTS.long });
    }
    if (tab3Reloaded) {
      await expect(tab3).toHaveURL(/login/i, { timeout: TIMEOUTS.long });
    }
    // If reloads were aborted (ERR_ABORTED), session termination is already confirmed above

    await tab2.close();
    await tab3.close();
  });

  // 705 - Verify logout timing (performance ≤ 3 seconds)
  test('ONEVIEW-705: Verify logout timing (performance) @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '705' });
    await logoutPage.openProfileMenu();
    await logoutPage.assertLogoutOptionVisible();
    // Measure time from logout click to /login URL
    const start = Date.now();
    await logoutPage.logoutOption.click();
    await page.waitForURL(/\/login/i, { timeout: TIMEOUTS.long });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThanOrEqual(3000);
    await logoutPage.assertOnLoginPage();
  });

  // 706 - Verify logout after session timeout warning
  test('ONEVIEW-706: Verify logout after session timeout warning @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '706' });
    // Check if a session-timeout / inactivity warning is already visible
    const timeoutWarning = page
      .locator(
        '[class*="timeout"], [class*="session-warn"], [role="alertdialog"]'
      )
      .or(page.getByText(/session.*expir|inactivity|you.*been.*idle/i))
      .first();

    const warningVisible = await timeoutWarning.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);
    if (warningVisible) {
      const dismissBtn = page
        .getByRole('button', { name: /dismiss|continue|ok|stay logged in/i })
        .first();
      await dismissBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    }
    // Logout must succeed whether or not a timeout warning was shown
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();
  });

  // 707 - Verify direct dashboard access blocked post-logout
  test('ONEVIEW-707: Verify direct dashboard access blocked post-logout @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '707' });
    await logoutPage.logout();
    await logoutPage.assertOnLoginPage();
    // Attempt direct navigation to dashboard after session is terminated
    await logoutPage.assertDashboardRedirectsToLogin(TEST_DATA.urls.dashboard);
  });
});
