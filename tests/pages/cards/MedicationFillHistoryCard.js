// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class MedicationFillHistoryCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Medication Fill History|Medications/i);
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
