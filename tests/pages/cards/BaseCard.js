// @ts-check
import { expect } from '@playwright/test';
import { BasePage } from '../BasePage.js';

export class BaseCard extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {RegExp} cardTitlePattern - regex matching the card title (e.g. /ADT Alerts/i)
   */
  constructor(page, cardTitlePattern) {
    super(page);
    this.card = page
      .locator('[class*="card"]')
      .filter({ hasText: cardTitlePattern })
      .first();
    this.viewAllButton = this.card
      .locator('button:has-text("View all"), button:has-text("View All"), button:has-text("See All"), a:has-text("View All")')
      .first();
  }

  /**
   * Assert the card is visible.
   * @param {number} [timeout]
   */
  async assertVisible(timeout = 10000) {
    await expect(this.card).toBeVisible({ timeout });
  }

  /**
   * Assert the "View all" button is visible within the card.
   */
  async assertViewAllVisible() {
    await expect(this.viewAllButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click the "View all" button to open the drill-down modal.
   * Uses force:true to bypass any overlay (e.g. ADT alert banner) and retries once
   * if the modal does not appear within 3s.
   */
  async clickViewAll() {
    await expect(this.viewAllButton).toBeVisible({ timeout: 10000 });
    // Dismiss alert banner right before clicking to prevent click interception
    const dismissBtn = this.page.getByRole('button', { name: /Dismiss/i }).first();
    if (await dismissBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dismissBtn.click();
      await this.page.waitForTimeout(500);
    }
    await this.viewAllButton.click({ force: true });
    // Wait up to 6s for modal to actually appear before deciding to retry.
    // Use the same broad locator as BaseModal to avoid false "not opened" detection
    // which would cause a retry-click that toggles (closes) the modal.
    const modal = this.page.locator('[role="dialog"], [class*="modal"], [class*="Modal"], [aria-modal="true"], [class*="DrillDown"], [class*="drilldown"]').first();
    const opened = await modal.waitFor({ state: 'visible', timeout: 6000 }).then(() => true).catch(() => false);
    if (!opened) {
      // Only re-click if modal genuinely didn't open
      if (await dismissBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await dismissBtn.click();
        await this.page.waitForTimeout(500);
      }
      await this.page.waitForTimeout(1000);
      await this.viewAllButton.click({ force: true });
    }
  }

  /**
   * Returns the full text content of the card.
   * @returns {Promise<string>}
   */
  async getCardText() {
    return (await this.card.textContent()) || '';
  }

  /**
   * Assert the card text matches a given pattern.
   * @param {RegExp} pattern
   */
  async assertHasContent(pattern) {
    const text = await this.getCardText();
    expect(text).toMatch(pattern);
  }
}
