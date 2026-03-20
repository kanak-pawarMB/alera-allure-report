// @ts-check
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { TEST_DATA } from '../testData.js';

export class LogoutPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Profile / avatar button (top-right, identified by rounded-lg Tailwind class)
    // The button contains user initials + full name, e.g. "KPKanak Pawar..."
    // Unique identifier: only button in the header with class*="rounded-lg"
    this.profileButton = page.locator('button[class*="rounded-lg"]').first();

    // Logout / Sign Out option inside the profile dropdown
    this.logoutOption = page
      .getByRole('menuitem', { name: /logout|sign out/i })
      .or(page.getByRole('button', { name: /logout|sign out/i }))
      .or(page.locator('[role="menu"] button, [role="menu"] a, [role="menu"] li').filter({ hasText: /logout|sign out/i }))
      .or(page.locator('button, a, li').filter({ hasText: /^(logout|sign out)$/i }))
      .first();
  }

  /**
   * Open the profile dropdown menu.
   */
  async openProfileMenu() {
    await expect(this.profileButton).toBeVisible({ timeout: 15000 });
    await this.profileButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Assert the logout option is visible in the dropdown.
   */
  async assertLogoutOptionVisible() {
    await expect(this.logoutOption).toBeVisible({ timeout: 8000 });
  }

  /**
   * Perform full logout: open profile menu → click logout → wait for /login redirect.
   */
  async logout() {
    await this.openProfileMenu();
    await this.assertLogoutOptionVisible();
    await this.logoutOption.click();
    await this.page.waitForURL(/\/login/i, { timeout: 30000 });
  }

  /**
   * Assert the current page is the login page.
   */
  async assertOnLoginPage() {
    await expect(this.page).toHaveURL(new RegExp(TEST_DATA.urls.login.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), { timeout: 15000 });
    const loginBtn = this.page.getByRole('button', { name: /Login with Microsoft/i });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert that navigating to the dashboard after logout redirects back to login.
   * @param {string} dashboardUrl
   */
  async assertDashboardRedirectsToLogin(dashboardUrl) {
    await this.page.goto(dashboardUrl, { timeout: 30000 });
    await this.page.waitForURL(/\/login/i, { timeout: 20000 });
    await expect(this.page).toHaveURL(/\/login/i);
  }
}
