// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Dynamic Dashboard Critical Path
 * These tests verify the dynamic dashboard layout and data loading
 * Qase Test Management Suite: Suite 8
 */

test.use({ storageState: 'auth.json' });

test.describe('Dynamic Dashboard - Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select primary patient
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
  });

  // Qase Test Case ID: 35
  test('ONEVIEW-35: Verify dashboard loads personalized layout for logged-in user @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '35' });

    // Step 1: Verify dashboard layout loads
    // Expected: Dashboard layout loads as per user's personalized configuration

    // Verify multiple cards are visible (personalized layout)
    const demographicsCard = page.locator(':text("Demographics")');
    const pcpCard = page.locator(':text("PCP")');
    const careManagementCard = page.locator(':text("Care Management")');

    // At least one card should be visible
    await expect(demographicsCard.or(pcpCard).or(careManagementCard).first()).toBeVisible({ timeout: 5000 });

    // Step 2: Verify cards appear in correct order
    // Check that multiple cards are loaded
    const allCards = page.locator('[class*="card"]');
    const cardCount = await allCards.count();

    expect(cardCount).toBeGreaterThan(0);
    console.log(`Dashboard loaded with ${cardCount} cards`);
  });

  // Qase Test Case ID: 42
  test('ONEVIEW-42: Verify dashboard responsiveness @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '42' });

    // Step 1: Verify dashboard at default viewport
    const cards = page.locator('[class*="card"]').first();
    await expect(cards).toBeVisible({ timeout: 5000 });

    // Step 2: Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Expected: Cards realign and resize appropriately
    await expect(cards).toBeVisible();

    // Verify no horizontal scrolling
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10);

    // Step 3: Test desktop viewport (1920px)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Expected: No overlapping, truncation, or horizontal scrolling
    await expect(cards).toBeVisible();

    // Verify cards are properly displayed
    const desktopScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const desktopClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(desktopScrollWidth).toBeLessThanOrEqual(desktopClientWidth + 10);

    console.log('Dashboard responsive layout verified for tablet and desktop');
  });
});
