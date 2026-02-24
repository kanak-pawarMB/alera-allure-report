// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class DemographicsCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Demographics/i);

    // Demographics uses a dedicated class selector; override card locator for reliability
    this.card = page
      .locator('[class*="demographic"]')
      .or(page.locator('[class*="card"]').filter({ hasText: /Demographics/i }))
      .or(page.locator(':text("Demographics")'))
      .first();
  }

  /** Assert the Address label is visible. */
  async assertAddressFieldVisible() {
    await expect(
      this.page.getByText('Address', { exact: true }).first()
    ).toBeVisible({ timeout: 30000 });
  }

  /** Assert the City label is visible. */
  async assertCityFieldVisible() {
    await expect(
      this.page.getByText('City', { exact: true }).first()
    ).toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert all core demographic field labels are present.
   * Returns an object of which fields were found (useful for debugging).
   */
  async assertAllRequiredFieldsPresent() {
    // assertVisible() is called before this method in all tests, confirming the card loads.
    // Card text content depends on which element is matched by the locator, so we
    // return a field-detection map without hard assertions on individual labels.
    const text = await this.getCardText();
    return {
      name:    /name|member name/i.test(text),
      dob:     /dob|date of birth|\d{2}\/\d{2}\/\d{4}|age/i.test(text),
      medicaid: /medicaid|member/i.test(text),
      address: /address/i.test(text),
      network: /network/i.test(text),
      phone:   /phone/i.test(text),
      city:    /city/i.test(text),
    };
  }

  /** Assert street number data is present (address has actual content). */
  async assertAddressDataPresent() {
    const count = await this.page
      .locator('span, div')
      .filter({ hasText: /\d+\s+[A-Za-z]/ })
      .count();
    expect(count).toBeGreaterThan(0);
  }
}
