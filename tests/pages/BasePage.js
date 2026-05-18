// @ts-check

export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a URL and wait for network idle.
   * @param {string} url
   * @param {{ timeout?: number }} [opts]
   */
  async navigate(url, opts = { timeout: 90000 }) {
    await this.page.goto(url, opts);
    await this.page.waitForLoadState('networkidle', { timeout: 60000 });
  }

  /**
   * Throws if the current URL contains 'login' (session expired guard).
   */
  async assertNotRedirectedToLogin() {
    if (this.page.url().includes('login')) {
      throw new Error('Auth session expired — re-run auth.setup.spec.js');
    }
  }

  /**
   * Takes a full-page screenshot. Silently swallows errors.
   * @param {string} path
   */
  async screenshotOnFailure(path) {
    await this.page.screenshot({ path, fullPage: true }).catch(() => {});
  }

  /**
   * Wait for the auth-verification dialog (and its Radix UI backdrop overlay) to
   * fully clear. The app renders a full-screen backdrop while re-validating the
   * auth token; this overlay intercepts pointer events and causes failures.
   */
  async _waitForAuthOverlay() {
    if (this.page.isClosed()) return;
    try {
      const backdrop = this.page
        .locator('[data-state="open"][aria-hidden="true"]')
        .first();
      if (await backdrop.isVisible({ timeout: 3000 }).catch(() => false)) {
        await backdrop.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
        if (!this.page.isClosed()) {
          await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        }
      }

      if (this.page.isClosed()) return;
      const verifyingText = this.page.getByText('Verifying account status', { exact: false });
      if (await verifyingText.isVisible({ timeout: 2000 }).catch(() => false)) {
        await verifyingText.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
        if (!this.page.isClosed()) {
          await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        }
      }
    } catch {
      // Page closed or context destroyed mid-wait — safe to ignore
    }
  }

  /**
   * Waits for skeleton/pulse loaders to disappear before interacting with content.
   * @param {number} [timeout]
   */
  async waitForSkeletons(timeout = 30000) {
    await this.page.waitForFunction(
      () => document.querySelectorAll('[class*="skeleton"],[class*="animate-pulse"]').length === 0,
      { timeout }
    ).catch(() => {});
  }
}
