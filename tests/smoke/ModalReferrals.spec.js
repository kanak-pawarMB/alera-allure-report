// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Referrals Modal Drill Down
 * XPath for View All button: (//button[contains(text(),'View all')])[4]
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Referrals - Smoke Tests', () => {
  // Configure timeout at describe level - applies to ALL hooks and tests
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    try {
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
      await page.waitForTimeout(2000);

      // Guard: ensure we're not redirected to login
      if (page.url().includes('login')) {
        throw new Error('Redirected to login page - auth session may have expired. Re-run auth.setup.spec.js');
      }

      // Search and select patient
      const searchBox = page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first();
      await expect(searchBox).toBeVisible({ timeout: 30000 });
      await searchBox.click();
      await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
      await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await page.waitForTimeout(3000);

      // Dismiss ADT alert banner if present (it can intercept clicks on "View all" button)
      const dismissBtn = page.getByRole('button', { name: /Dismiss/i }).first();
      if (await dismissBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dismissBtn.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      await page.screenshot({ path: 'screenshots/debug-ModalReferrals-beforeEach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
  });

  // ===================== ONEVIEW-142 =====================
  test('ONEVIEW-142: Smoke_Verify Scroll Functionality @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '142' });

    // Wait for Referrals card to be visible and data to load
    const referralsCard = page.locator('[class*="card"]').filter({ hasText: /Referral/i }).first();
    await expect(referralsCard).toBeVisible({ timeout: 15000 });

    // Wait for card data to fully render
    await page.waitForTimeout(2000);

    // Find and click View All button within the Referrals card
    const viewAllButton = referralsCard.locator('button:has-text("View all")').first();
    await expect(viewAllButton).toBeVisible({ timeout: 10000 });
    await viewAllButton.click();

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 15000 });

    // Wait for modal content/data to load before scrolling
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Scroll inside modal
    await modal.first().evaluate(node => { node.scrollTop = node.scrollHeight; });
    await expect(modal.first()).toBeVisible();

    // Close modal
    const closeButton = page.getByRole('button', { name: 'Close' })
      .or(page.locator('[aria-label="Close"]'));
    await expect(closeButton.first()).toBeVisible({ timeout: 5000 });
    await closeButton.first().click();
    await expect(modal.first()).not.toBeVisible({ timeout: 5000 });
  });

});
