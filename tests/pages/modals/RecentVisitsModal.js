// @ts-check
import { expect } from '@playwright/test';
import { BaseModal } from './BaseModal.js';

export class RecentVisitsModal extends BaseModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Timeline selector specific to Recent Visits modal
    this.timelineSelector = page.getByRole('button', {
      name: /All Time|7 Months|6 Months|3 Months|Date Range/i,
    });

    // Facility search box inside the modal
    this.searchBox = this.modal
      .getByRole('textbox')
      .or(page.getByRole('textbox', { name: /search|filter/i }));

    // Close icon — XPath variant used in smoke tests for this modal
    this.closeIcon = page
      .locator("(//img[@class=' block dark:hidden'])[1]")
      .or(page.locator("(//div[@aria-label='Close'])[1]"));
  }

  /**
   * Assert modal contains Recent Visits content.
   */
  async assertContent() {
    await expect(this.modal).toContainText(/Recent Visits|Encounters|Facility/i);
  }

  /**
   * Assert the timeline selector is visible.
   */
  async assertTimelineSelectorVisible() {
    await expect(this.timelineSelector.first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Click the timeline selector and select the first option (if dropdown appears).
   * Skips option click gracefully if the dropdown uses a different structure.
   */
  async selectFirstTimelineOption() {
    // Check selector is visible before clicking (it may not exist in all environments)
    const selectorVisible = await this.timelineSelector.first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!selectorVisible) return;

    await this.timelineSelector.first().click();
    // Wait briefly for dropdown options to appear
    await this.page.waitForTimeout(800);

    const option = this.page.locator('[role="option"], [role="listbox"] li, [class*="dropdown-item"]');
    const count = await option.count();
    if (count > 0) {
      await option.first().click().catch(() => {});
    }
  }

  /**
   * Assert the facility search box is present.
   */
  async assertSearchBoxPresent() {
    await expect(this.searchBox.first()).toBeVisible();
  }

  /**
   * Close the modal via the close icon, with multiple selector fallbacks and
   * an Escape key fallback in case no close button is interactable.
   */
  async closeViaIcon() {
    const closeBtn = this.page
      .locator("(//img[@class=' block dark:hidden'])[1]")
      .or(this.page.locator("(//div[@aria-label='Close'])[1]"))
      .or(this.page.getByRole('button', { name: /close/i }))
      .or(this.page.locator('[aria-label="Close"]'))
      .first();

    const isVisible = await closeBtn.isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisible) {
      await closeBtn.click({ force: true });
    } else {
      await this.page.keyboard.press('Escape');
    }
    await this.assertNotVisible();
  }
}
