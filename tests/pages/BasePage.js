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
