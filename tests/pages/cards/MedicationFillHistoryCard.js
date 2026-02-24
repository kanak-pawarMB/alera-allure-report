// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class MedicationFillHistoryCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Medication Fill History|Medications/i);

    // Positional XPath — Medication Fill History is the 3rd "View all" button on the page
    this.viewAllXPath = page.locator("(//button[contains(text(),'View all')])[3]");
  }

  /**
   * Click the "View all" button using the positional XPath selector.
   * Overrides BaseCard.clickViewAll for reliable positional targeting.
   */
  async clickViewAll() {
    await expect(this.viewAllXPath).toBeVisible({ timeout: 10000 });
    await this.viewAllXPath.click();
  }

  /**
   * Assert medication rows are present in the card.
   */
  async assertRowsPresent() {
    const rows = this.card.locator('tbody tr, [role="row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  }
}
