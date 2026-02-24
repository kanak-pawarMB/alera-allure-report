// @ts-check
import { expect } from '@playwright/test';

export class BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {RegExp} cardTitlePattern - regex matching the card title (e.g. /ADT Alerts/i)
   */
  constructor(page, cardTitlePattern) {
    this.page = page;
    this.card = page
      .locator('[class*="card"]')
      .filter({ hasText: cardTitlePattern })
      .first();
    this.viewAllButton = this.card
      .locator('button:has-text("View all"), button:has-text("View All"), a:has-text("View All")')
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
   */
  async clickViewAll() {
    await expect(this.viewAllButton).toBeVisible({ timeout: 5000 });
    await this.viewAllButton.click();
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
