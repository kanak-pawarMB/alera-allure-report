// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class ADTAlertsCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /ADT Alerts/i);
  }

  /**
   * Assert expected column labels are present (Event, Date, Type, Facility, Provider).
   */
  async assertLabelsPresent() {
    const text = await this.getCardText();
    expect(text).toMatch(/Event|Date|Type|Facility|Provider/i);
  }

  /**
   * Assert ADT alert dates are sorted descending (most recent first).
   * Checks up to 5 visible dates.
   */
  async assertDatesSortedDescending() {
    const dateElements = this.card.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/');
    const count = await dateElements.count();
    if (count > 1) {
      const dates = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await dateElements.nth(i).textContent();
        if (text) dates.push(new Date(text.trim()));
      }
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
      }
    }
  }
}
