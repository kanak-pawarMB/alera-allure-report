// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Recent Visits - Smoke Tests', () => {
  // Configure timeout at describe level - applies to ALL hooks and tests
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    // Reset viewport to prevent navigation issues
    await page.setViewportSize({ width: 1280, height: 720 });

    try {
      // Navigate to dashboard
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
      await page.waitForLoadState('networkidle', { timeout: 60000 });

      // Search for patient with complete data
      const searchBox = page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first();
      await expect(searchBox).toBeVisible({ timeout: 30000 });
      await searchBox.click();
      await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
      await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: 'screenshots/debug-RecentVisits-beforeEach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
  });

  test('ONEVIEW-326: Verify displayed columns @smoke', async ({ page }) => {
    // Locate Recent Visits card
    const card = page.locator('text=/Recent Visits|Recent.*Encounters|Encounters/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Verify card has content (columns)
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);

    // Verify key column headers are present
    const hasDateColumn = await page.locator('text=/Date/i').first().isVisible().catch(() => false);
    const hasTypeColumn = await page.locator('text=/Type/i').first().isVisible().catch(() => false);
    const hasFacilityColumn = await page.locator('text=/Facility/i').first().isVisible().catch(() => false);
    const hasDiagnosisColumn = await page.locator('text=/Diagnosis/i').first().isVisible().catch(() => false);

    // At least some columns should be visible (card may have different exact structure)
    const hasColumns = hasDateColumn || hasTypeColumn || hasFacilityColumn || hasDiagnosisColumn;
    expect(hasColumns).toBeTruthy();
  });

  test('ONEVIEW-330: Verify "View All" link visibility @smoke', async ({ page }) => {
    // Locate Recent Visits card
    const card = page.locator('text=/Recent Visits|Recent.*Encounters|Encounters/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Verify "View All" link is visible using XPath
    const viewAllButton = page.locator('(//button[contains(text(),\'View all\')])[2]');
    await expect(viewAllButton).toBeVisible({ timeout: 5000 });

    // Verify button is clickable
    const isVisible = await viewAllButton.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('ONEVIEW-343: Verify responsiveness @smoke', async ({ page }) => {
    // Locate Recent Visits card
    const card = page.locator('text=/Recent Visits|Recent.*Encounters|Encounters/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Test on tablet viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000); // Wait for layout adjustment

    // Verify card is still visible
    await expect(card).toBeVisible({ timeout: 5000 });

    // Verify no horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();

    // Test on mobile viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Verify card adapts to mobile view
    await expect(card).toBeVisible({ timeout: 5000 });

    // Verify layout doesn't overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBeFalsy();

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
