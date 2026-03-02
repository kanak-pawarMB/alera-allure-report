// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class RiskStratificationCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Risk Stratification/i);

    // The clickable Risk Score link — uses multiple fallback strategies
    this.riskScoreLink = page
      .getByRole('button', { name: /Risk Score/i })
      .or(page.getByText(/Risk Score:\s*\d+/i))
      .or(
        page
          .locator('[class*="card"]')
          .filter({ hasText: /Risk Stratification/i })
          .locator('button, [role="button"], a, [class*="badge"]')
          .filter({ hasText: /Risk Score/i })
      )
      .or(
        // Broad fallback: any p/span/div inside the Risk Strat card with "Risk Score" text
        page
          .locator('[class*="card"]')
          .filter({ hasText: /Risk Stratification/i })
          .locator('p, span, div, a')
          .filter({ hasText: /Risk Score/i })
          .first()
      );

    // Semantic locator for the risk score element (replaces fragile hardcoded CSS class)
    this.riskScoreLinkByClass = page
      .locator('[class*="card"]')
      .filter({ hasText: /Risk Stratification/i })
      .locator('p, span, div, a')
      .filter({ hasText: /Risk Score/i })
      .first();
  }

  /**
   * Wait for skeleton loaders to clear (Risk Strat card loads async).
   */
  async waitForDataLoaded() {
    await this.page.waitForFunction(
      () => document.querySelectorAll('[class*="skeleton"],[class*="animate-pulse"]').length === 0,
      { timeout: 30000 }
    ).catch(() => {});
  }

  /**
   * Scroll to the risk score link and click it to open the modal.
   */
  async clickRiskScoreLink() {
    await this.riskScoreLink.first().scrollIntoViewIfNeeded().catch(() => {});
    await expect(this.riskScoreLink.first()).toBeVisible({ timeout: 15000 });
    await this.riskScoreLink.first().click({ timeout: 10000 });
  }

  /**
   * Assert the card is in read-only mode (no editable inputs).
   */
  async assertReadOnly() {
    const editableElements = this.card.locator('[contenteditable="true"]');
    expect(await editableElements.count()).toBe(0);

    const editableInputs = this.card.locator('input:not([readonly]), textarea:not([readonly])');
    expect(await editableInputs.count()).toBe(0);
  }

  /**
   * Assert the risk score link is present in the card header.
   */
  async assertRiskScoreLinkPresent() {
    // Use the multi-fallback riskScoreLink instead of the hardcoded CSS class selector
    const linkExists = await this.riskScoreLink.first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(linkExists).toBeTruthy();
  }
}
