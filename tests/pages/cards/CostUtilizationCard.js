// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class CostUtilizationCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Cost.*Utilization|12.Month Cost|Utilization/i);
  }

  /**
   * Assert the 12-month cost/utilization data is present.
   */
  async assertDataPresent() {
    const text = await this.getCardText();
    expect(text).toMatch(/cost|utilization|\$/i);
  }
}
