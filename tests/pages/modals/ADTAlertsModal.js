// @ts-check
import { expect } from '@playwright/test';
import { BaseModal } from './BaseModal.js';

export class ADTAlertsModal extends BaseModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ADT Alerts modal is opened via the first "View all" button on the page (XPath)
    this.viewAllXPath = page.locator("(//button[contains(text(),'View all')])[1]");

    // Timeline filter button inside the modal
    this.timelineFilterButton = this.modal.getByRole('button', {
      name: /All Time|All|Months|Month|Days|Week|Year|Time/i,
    });
  }

  /**
   * Open the ADT Alerts modal by clicking the View all button scoped to the ADT card.
   * Uses card-scoped selector (matches regression test approach) rather than positional XPath
   * which may click an unrelated button at position [1].
   */
  async open() {
    const adtCard = this.page.locator('[class*="card"]').filter({ hasText: /ADT Alerts/i }).first();
    const viewAllBtn = adtCard
      .locator('button:has-text("View all"), button:has-text("View All"), a:has-text("View All")')
      .first();
    await expect(viewAllBtn).toBeVisible({ timeout: 10000 });
    await viewAllBtn.click();
    await this.page.waitForTimeout(800);
    await this.assertVisible(15000);
  }

  /**
   * Assert modal contains ADT-related content.
   */
  async assertContent() {
    await expect(this.modal).toContainText(/ADT|Alert|Facility|Admission|Discharge|Transfer/i);
  }

  /**
   * Assert the timeline filter button is visible (if it exists in the current environment).
   */
  async assertTimelineFilterPresent() {
    if (await this.timelineFilterButton.count() > 0) {
      await expect(this.timelineFilterButton.first()).toBeVisible();
    }
  }
}
