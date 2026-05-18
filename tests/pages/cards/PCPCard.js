// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class PCPCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /PCP|Primary Care/i);

    this.card = page
      .locator(':text("PCP")')
      .or(page.locator(':text("Primary Care")'))
      .or(page.locator('[class*="pcp"]'))
      .or(page.locator('[data-testid="pcp"]'))
      .or(page.locator('[class*="card"]').filter({ hasText: /PCP|Primary Care/i }))
      .first();
  }

  /** Assert provider name field is visible. */
  async assertNameFieldVisible() {
    const nameField = this.page
      .locator('text=/name/i')
      .or(this.page.locator('[class*="name"]'))
      .or(this.page.getByText(/Dr\.|MD|DO/));
    await expect(nameField.first()).toBeVisible({ timeout: 10000 });
  }

  /** Assert phone field is visible. */
  async assertPhoneFieldVisible() {
    const phoneField = this.page
      .locator('text=/phone/i')
      .or(this.page.locator('text=/\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/'));
    await expect(phoneField.first()).toBeVisible({ timeout: 10000 });
  }

  /** Assert address field is visible. */
  async assertAddressFieldVisible() {
    const addressField = this.page
      .locator('text=/address/i')
      .or(this.page.locator('text=/street/i'));
    await expect(addressField.first()).toBeVisible({ timeout: 10000 });
  }

  /** Assert city field is visible. */
  async assertCityFieldVisible() {
    await expect(
      this.page.locator('text=/city/i').first()
    ).toBeVisible({ timeout: 10000 });
  }
}
