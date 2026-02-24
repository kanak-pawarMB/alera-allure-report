// @ts-check
import { BaseCard } from './BaseCard.js';

export class RecentVisitsCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Recent Visits|Encounters/i);

    this.viewAllButton = this.card
      .locator('button:has-text("View all")')
      .first();
  }
}
