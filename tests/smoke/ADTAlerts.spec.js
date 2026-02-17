// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - ADT Alerts Card Critical Path
 * These tests verify ONLY the critical happy path for ADT Alerts card
 * Qase Test Management Suite: Suite 27
 */

test.use({ storageState: 'auth.json' });

test.describe('ADT Alerts - Smoke Tests', () => {
  // Configure timeout at describe level - applies to ALL hooks and tests
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    try {
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
      await page.waitForLoadState('networkidle', { timeout: 60000 });

      // Search and select patient (primary complete data)
      const searchBox = page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first();
      await expect(searchBox).toBeVisible({ timeout: 30000 });
      await searchBox.click();
      await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
      await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: 'screenshots/debug-ADTAlerts-beforeEach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
  });

  // Qase Test Case ID: 263
  test('ONEVIEW-263: Verify ADT Alerts Card Display @smoke', async ({ page }) => {

    // Verify ADT Alerts card is visible with proper title
    const adtAlertsCard = page.locator('text=/ADT Alerts/i').first();
    await expect(adtAlertsCard).toBeVisible({ timeout: 20000 });

    // Verify card container is displayed
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /ADT Alerts/i }).first();
    await expect(cardContainer).toBeVisible({ timeout: 20000 });
  });

  // Qase Test Case ID: 264
  test('ONEVIEW-264: Verify ADT Alerts Card Labels @smoke', async ({ page }) => {

    // Verify ADT Alerts card loads
    const adtAlertsCard = page.locator('text=/ADT Alerts/i').first();
    await expect(adtAlertsCard).toBeVisible({ timeout: 10000 });

    // Verify card has data content (table or rows)
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /ADT Alerts/i }).first();
    await expect(cardContainer).toBeVisible();

    // Verify expected columns/labels are present (Event Date, Event Type, Facility, Provider Name)
    const cardText = await cardContainer.textContent() || '';
    
    // Check for at least some of the expected labels
    const hasEventRelatedContent = cardText.match(/Event|Date|Type|Facility|Provider/i);
    expect(hasEventRelatedContent).toBeTruthy();
  });

  // Qase Test Case ID: 265
  test('ONEVIEW-265: Verify View All Link Visibility @smoke', async ({ page }) => {

    // Wait for card to load
    const adtAlertsCard = page.locator('text=/ADT Alerts/i').first();
    await expect(adtAlertsCard).toBeVisible({ timeout: 10000 });

    // Verify "View All" link is visible within ADT Alerts card
    // Note: Button may be disabled when there's no data, so we only check visibility
    const adtAlertsSection = page.locator('[class*="card"]').filter({ hasText: /ADT Alerts/i }).first();
    const viewAllButton = adtAlertsSection.locator('button:has-text("View all")');
    await expect(viewAllButton).toBeVisible({ timeout: 5000 });
  });
});
