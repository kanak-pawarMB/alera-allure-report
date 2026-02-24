// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class HealthPlanCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Health Plan|Healthplan/i);

    // Health Plan card uses several possible title variants
    this.card = page
      .locator(':text("Health Plan")')
      .or(page.locator(':text("Healthplan")'))
      .or(page.locator('[class*="health"]'))
      .or(page.locator('[data-testid="health-plan"]'))
      .or(page.locator('[class*="card"]').filter({ hasText: /Health Plan|Healthplan/i }))
      .first();
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
