// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class RiskStratificationCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Risk Stratification/i);

    // The clickable Risk Score badge in the card header (e.g. "Risk Score: 22")
    // Target by exact text pattern — avoids matching outer wrapper elements
    this.riskScoreLink = page.getByText(/Risk Score:\s*\d+/).first();
  }

  /**
   * Wait for skeleton loaders to clear (Risk Strat card loads async).
   * Delegates to BasePage.waitForSkeletons() inherited via BaseCard.
   */
  async waitForDataLoaded() {
    await this.waitForSkeletons();
  }

  /**
   * Scroll to the risk score link and click it to open the modal.
   */
  async clickRiskScoreLink() {
    await this.card.scrollIntoViewIfNeeded().catch(() => {});
    await expect(this.riskScoreLink).toBeVisible({ timeout: 15000 });
    await this.riskScoreLink.click();
    await this.page.waitForTimeout(500); // allow modal to begin rendering
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
    // Scroll the card into view first — it is below the fold on 1280x720 viewport
    await this.card.scrollIntoViewIfNeeded().catch(() => {});
    const linkExists = await this.riskScoreLink.first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(linkExists).toBeTruthy();
  }
}
