// @ts-check
import { expect } from '@playwright/test';
import { BaseModal } from './BaseModal.js';

export class RiskStratificationModal extends BaseModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Year selector — specific to Risk Stratification modal
    this.yearSelector = this.page.getByRole('button', { name: 'Select Years' });

    // Override close button with the variants confirmed in risk strat smoke tests
    this.closeButton = this.page
      .getByRole('button', { name: /close/i })
      .or(this.page.locator('[aria-label="Close"]'))
      .or(this.page.locator("(//img[@class=' block dark:hidden'])[1]"));
  }

  /**
   * Assert the modal contains Risk Stratification content.
   */
  async assertContent() {
    await expect(this.modal).toContainText(/Risk Score|Risk Stratification|Quarter|Year/i);
  }

  /**
   * Assert the year selector button is visible (confirms modal content is loaded).
   * @param {number} [timeout]
   */
  async assertYearSelectorVisible(timeout = 10000) {
    await expect(this.yearSelector).toBeVisible({ timeout });
  }

  /**
   * Open the year dropdown.
   */
  async openYearDropdown() {
    await this.yearSelector.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Close the year dropdown by clicking outside it.
   */
  async closeYearDropdown() {
    await this.page.click('body', { position: { x: 500, y: 300 } });
    await this.page.waitForTimeout(500);
  }

  /**
   * Close the modal and verify it disappears.
   */
  async close() {
    await expect(this.closeButton.first()).toBeVisible({ timeout: 5000 });
    await this.closeButton.first().click();
    await this.assertNotVisible(5000);
  }
}
