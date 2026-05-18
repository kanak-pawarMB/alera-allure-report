// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class HealthPlanCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Health Plan|Healthplan/i);
    // BaseCard already sets this.card = page.locator('[class*="card"]').filter({ hasText: /Health Plan|Healthplan/i }).first()
    // Do not override — previous override included [class*="health"] which matched <img> elements (empty textContent)
  }

  /**
   * Assert health plan data fields (plan name, enrollment info) are present.
   */
  async assertPlanDataPresent() {
    const planData = this.page.locator('text=/plan|enrollment|effective|member/i');
    const count = await planData.count();
    expect(count).toBeGreaterThan(0);
  }
}
