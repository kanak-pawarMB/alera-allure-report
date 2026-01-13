// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Referrals Card Critical Path
 * These tests verify ONLY the critical happy path for Referrals card
 * Qase Test Management Suite: Suite 14
 */

test.use({ storageState: 'auth.json' });

test.describe('Referrals - Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select patient (primary complete data)
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
  });

  // Qase Test Case ID: 123
  test('ONEVIEW-123: Verify Referrals Card Data Retrieval @smoke', async ({ page }) => {

    // Verify Referrals card is displayed
    const referralsCard = page.locator('text=/Referrals/i').first();
    await expect(referralsCard).toBeVisible({ timeout: 10000 });

    // Verify card container is visible with data
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /Referrals/i }).first();
    await expect(cardContainer).toBeVisible();
  });

  // Qase Test Case ID: 124
  test('ONEVIEW-124: Verify Referrals Data Display @smoke', async ({ page }) => {

    // Verify Referrals card loads with data
    const referralsCard = page.locator('text=/Referrals/i').first();
    await expect(referralsCard).toBeVisible({ timeout: 10000 });

    // Verify card has table/data content
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /Referrals/i }).first();
    await expect(cardContainer).toBeVisible();

    // Verify at least one data row/entry is visible
    const dataRows = page.locator('tr, [role="row"]').filter({ has: page.locator('text=/Referral|Facility|Status/i') });
    const rowCount = await dataRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 130
  test('ONEVIEW-130: Verify "View All" Link Visibility @smoke', async ({ page }) => {

    // Wait for card to load
    const referralsCard = page.locator('text=/Referrals/i').first();
    await expect(referralsCard).toBeVisible({ timeout: 10000 });

    // Verify "View All" link is visible and clickable (4th View All button for Referrals)
    const viewAllButton = page.locator('(//button[contains(text(),\'View all\')])[4]');
    await expect(viewAllButton).toBeVisible({ timeout: 5000 });
    await expect(viewAllButton).toBeEnabled();
  });
  
  // Qase Test Case ID: 144
  test('ONEVIEW-144: Verify Responsive Design @smoke', async ({ page }) => {

    // Verify card loads at default size
    const referralsCard = page.locator('text=/Referrals/i').first();
    await expect(referralsCard).toBeVisible({ timeout: 10000 });

    // Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Verify card still visible
    await expect(referralsCard).toBeVisible();

    // Test desktop viewport (1920px)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Verify layout adapts correctly
    await expect(referralsCard).toBeVisible();

    // Verify no horizontal scrolling
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10);
  });
});
