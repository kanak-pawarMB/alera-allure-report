// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class ReferralsCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Referrals/i);

    // Positional XPath — Referrals is the 4th "View all" button on the page
    this.viewAllXPath = page.locator("(//button[contains(text(),'View all')])[4]");
  }

  /**
   * Click the "View All" button scoped to the Referrals card.
   * Uses card-scoped selector (matches regression test approach) and waits
   * briefly after click for the modal to appear.
   */
  async clickViewAll() {
    await expect(this.viewAllButton).toBeVisible({ timeout: 10000 });
    await this.viewAllButton.click();
    await this.page.waitForTimeout(1000);
  }
}
