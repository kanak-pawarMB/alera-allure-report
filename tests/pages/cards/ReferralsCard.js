// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class ReferralsCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Referrals/i);
  }

  /**
   * Click the "View All" button scoped to the Referrals card.
   * Dismisses ADT banner, uses force click, and retries up to 3 times
   * if the modal does not appear within 6s.
   */
  async clickViewAll() {
    await expect(this.viewAllButton).toBeVisible({ timeout: 10000 });
    const dismissBtn = this.page.getByRole('button', { name: /Dismiss/i }).first();
    const modal = this.page.locator('[role="dialog"], [class*="modal"], [class*="Modal"], [aria-modal="true"], [class*="DrillDown"], [class*="drilldown"]').first();
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await dismissBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dismissBtn.click();
        await this.page.waitForTimeout(500);
      }
      await this.viewAllButton.click({ force: true });
      const opened = await modal.waitFor({ state: 'visible', timeout: 6000 }).then(() => true).catch(() => false);
      if (opened) break;
      await this.page.waitForTimeout(1000);
    }
  }
}
