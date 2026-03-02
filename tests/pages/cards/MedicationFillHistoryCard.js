// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class MedicationFillHistoryCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Medication Fill History|Medications/i);
    // Positional XPath — Medication Fill History is the 3rd "View all" button on the page.
    // Used as the primary click target because the generic card-scoped locator can
    // resolve to the wrong element when outer wrapper divs also carry [class*="card"].
    this.viewAllXPath = page.locator("(//button[contains(text(),'View all')])[3]");
  }

  /**
   * Click "View all" using the known positional XPath for this card.
   * Includes a brief pre-click settle wait (page animations/data loads) and a
   * post-click wait for the modal to start rendering.
   */
  async clickViewAll() {
    await this.page.waitForTimeout(500); // let page settle after beforeEach
    // 30s timeout ensures all 3+ "View all" buttons are rendered before using positional XPath [3]
    await expect(this.viewAllXPath).toBeVisible({ timeout: 30000 });
    await this.viewAllXPath.click(); // click() auto-scrolls; avoids "element detached" race condition
    // Retry once if modal doesn't open (warm-session timing guard)
    const modal = this.page.locator('[role="dialog"], [class*="modal"]').first();
    const opened = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    if (!opened) {
      await this.page.waitForTimeout(1000);
      await this.viewAllXPath.click();
    }
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Assert medication rows are present in the card.
   */
  async assertRowsPresent() {
    const rows = this.card.locator('tbody tr, [role="row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  }
}
