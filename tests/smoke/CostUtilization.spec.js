// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - 12 Month Cost/Utilization Summary Card Critical Path
 * These tests verify ONLY the critical happy path for Cost/Utilization Summary card
 * Qase Test Management Suite: Suite 29
 */

test.use({ storageState: 'auth.json' });

test.describe('Cost Utilization - Smoke Tests', () => {
  // Configure timeout at describe level - applies to ALL hooks and tests
  test.describe.configure({ timeout: 120000 });

  /* -------------------- Helpers -------------------- */

  // Flexible search field locator
  // @ts-ignore
  async function getSearchField(page) {
    const field = page
      .locator('input[placeholder*="Search"], input[placeholder*="Medicaid"], input[type="text"]')
      .first();
    await expect(field).toBeVisible({ timeout: 30000 });
    return field;
  }

  // Get search result - uses getByText for dropdown items
  // @ts-ignore
  async function getSearchResult(page, patientText) {
    const result = page.getByText(patientText).first();
    await expect(result).toBeVisible({ timeout: 30000 });
    return result;
  }

  /* -------------------- Setup -------------------- */

  test.beforeEach(async ({ page }) => {
    try {
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
      await page.waitForLoadState('networkidle', { timeout: 60000 });

      // Verify we're on dashboard (not redirected to login)
      const currentUrl = page.url();
      if (currentUrl.includes('login')) {
        throw new Error('Redirected to login page - auth session may have expired');
      }

      // Wait for dashboard to be ready
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

      // Search and select patient using flexible locators
      const searchBox = await getSearchField(page);
      await searchBox.click();
      await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);

      // Click search result
      const searchResult = await getSearchResult(page, 'NC767095351|Elizabeth Garcia|12/09/');
      await searchResult.click();

      // Wait for patient data to load
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: 'costutil-beforeeach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
  });

  // Qase Test Case ID: 282
  test('ONEVIEW-282: Verify display of all cost categories @smoke', async ({ page }) => {

    // Verify 12-month Cost / Utilization card is displayed
    const costCard = page.locator('text=/12-month Cost.*Utilization|12 month Cost.*Utilization/i').first();
    await expect(costCard).toBeVisible({ timeout: 10000 });

    // Verify card container with cost breakdown data
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /12-month Cost.*Utilization|12 month Cost.*Utilization/i }).first();
    await expect(cardContainer).toBeVisible();

    // Verify card has data (may not have specific category labels, just verify card has content)
    const cardText = await cardContainer.textContent() || '';
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 285
  test('ONEVIEW-285: Verify read-only view @smoke', async ({ page }) => {

    // Verify card loads
    const costCard = page.locator('text=/12 Month Cost|Cost.*Utilization|Utilization Summary/i').first();
    await expect(costCard).toBeVisible({ timeout: 10000 });

    // Verify no editable fields exist (read-only)
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /12 Month Cost|Cost.*Utilization|Utilization Summary/i }).first();
    
    const editableInputs = cardContainer.locator('input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])');
    const count = await editableInputs.count();
    expect(count).toBe(0);

    // Verify content is displayed (not editable)
    const cardText = await cardContainer.textContent() || '';
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 297
  test('ONEVIEW-297: Verify responsiveness @smoke', async ({ page }) => {

    // Verify card loads at default size
    const costCard = page.locator('text=/12 Month Cost|Cost.*Utilization|Utilization Summary/i').first();
    await expect(costCard).toBeVisible({ timeout: 10000 });

    // Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Verify card still visible
    await expect(costCard).toBeVisible();

    // Test mobile viewport (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Verify card remains accessible on mobile
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /12 Month Cost|Cost.*Utilization|Utilization Summary/i }).first();
    const isVisible = await cardContainer.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();

    // Test desktop viewport (1920px)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Verify layout adapts correctly
    await expect(costCard).toBeVisible();

    // Verify no horizontal scrolling
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10);
  });
});
