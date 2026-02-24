// @ts-check
import { expect } from '@playwright/test';

export class BaseModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.modal = page
      .locator('[role="dialog"], [class*="modal"]')
      .first();

    // Close button — covers all modal close patterns seen in tests
    this.closeButton = page
      .locator("(//img[@class=' block dark:hidden'])[1]")
      .or(page.locator("(//div[@aria-label='Close'])[1]"))
      .or(page.getByRole('button', { name: /close/i }))
      .or(page.locator('[aria-label="Close"]'))
      .first();

    this.tableBody = this.modal.locator('tbody');
    this.timelineDropdown = this.modal.locator('select, [role="combobox"]').first();
    this.facilitySearchInput = this.modal
      .locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="facility" i]')
      .first();
  }

  /**
   * Assert the modal is visible.
   * @param {number} [timeout]
   */
  async assertVisible(timeout = 15000) {
    await expect(this.modal).toBeVisible({ timeout });
  }

  /**
   * Assert the modal is not visible.
   * @param {number} [timeout]
   */
  async assertNotVisible(timeout = 5000) {
    await expect(this.modal).not.toBeVisible({ timeout });
  }

  /**
   * Close the modal by clicking the close button and verify it disappears.
   */
  async close() {
    await expect(this.closeButton).toBeVisible({ timeout: 5000 });
    await this.closeButton.click();
    await this.assertNotVisible();
  }

  /**
   * Get the count of data rows in the modal table.
   * @returns {Promise<number>}
   */
  async getRowCount() {
    return await this.modal.locator('tbody tr').count();
  }

  /**
   * Assert the modal shows a "no results" message or has zero rows.
   */
  async assertNoResultsMessage() {
    const noResults = this.modal.getByText(/No records found|No data|No results|No alerts/i);
    const rowCount = await this.getRowCount();
    const hasMessage = await noResults.isVisible().catch(() => false);
    expect(hasMessage || rowCount === 0).toBeTruthy();
  }

  /**
   * Assert the modal content matches a text pattern.
   * @param {RegExp|string} pattern
   */
  async assertContainsText(pattern) {
    await expect(this.modal).toContainText(pattern);
  }

  /**
   * Assert the page URL did not change when the modal opened.
   * @param {string} urlBefore
   */
  async assertUrlUnchanged(urlBefore) {
    expect(this.page.url()).toBe(urlBefore);
  }
}
