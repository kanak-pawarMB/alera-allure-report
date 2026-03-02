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
    // Dismiss ADT alert banner first (before networkidle to avoid interference)
    const dismissBtn = this.page.getByRole('button', { name: /Dismiss/i }).first();
    if (await dismissBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dismissBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Wait for page to fully settle
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    // Extra settling time for cold-start (first modal open in a test run)
    await this.page.waitForTimeout(2000);

    const adtCard = this.page.locator('[class*="card"]').filter({ hasText: /ADT Alerts/i }).first();
    await expect(adtCard).toBeVisible({ timeout: 15000 });
    // Wait for card data to finish loading (not just the skeleton/title)
    // This handles parallel-run slowdowns where the backend takes longer to respond
    await adtCard.locator('td, [role="cell"], text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}|Event|Facility|Admission|No ADT/i')
      .first()
      .waitFor({ state: 'visible', timeout: 30000 })
      .catch(() => {}); // proceed even if no data rows (empty state)
    const viewAllBtn = adtCard
      .locator('button:has-text("View all"), button:has-text("View All"), a:has-text("View All")')
      .first();
    await expect(viewAllBtn).toBeVisible({ timeout: 10000 });
    await viewAllBtn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);

    // Dismiss banner AGAIN right before clicking — it can appear during the networkidle/card-data wait above
    const dismissBtnPre = this.page.getByRole('button', { name: /Dismiss/i }).first();
    if (await dismissBtnPre.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dismissBtnPre.click();
      await this.page.waitForTimeout(500);
    }

    await viewAllBtn.click({ force: true });

    // Retry up to 2 more times if modal doesn't open (cold-start guard)
    for (let attempt = 0; attempt < 2; attempt++) {
      const opened = await this.modal.isVisible({ timeout: 3000 }).catch(() => false);
      if (opened) break;
      // Dismiss banner before retry
      if (await dismissBtnPre.isVisible({ timeout: 1000 }).catch(() => false)) {
        await dismissBtnPre.click();
        await this.page.waitForTimeout(500);
      }
      await this.page.waitForTimeout(3000);
      await viewAllBtn.click({ force: true });
    }

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
