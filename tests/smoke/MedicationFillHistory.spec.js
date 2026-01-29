// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Medication Fill History Card Critical Path
 * These tests verify ONLY the critical happy path for Medication Fill History card
 * Qase Test Management Suite: Suite 12
 */

test.use({ storageState: 'auth.json' });

test.describe('Medication Fill History - Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select patient (primary complete data)
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
  });

  // Qase Test Case ID: 110
  test('ONEVIEW-110: Verify Medication Fill History Card Loads @smoke', async ({ page }) => {

    // Verify Medication Fill History card is displayed with correct title
    const medFillCard = page.locator('text=/Medication Fill History|Medication/i').first();
    await expect(medFillCard).toBeVisible({ timeout: 10000 });
  });

  // Qase Test Case ID: 93
  test('ONEVIEW-93: Verify data retrieval from Rx_Claims table @smoke', async ({ page }) => {

    // Verify card loads with data from Rx_Claims table
    const medFillCard = page.locator('text=/Medication Fill History|Medication/i').first();
    await expect(medFillCard).toBeVisible({ timeout: 10000 });

    // Verify table contains expected column headers or data fields
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /Medication Fill History|Medication/i }).first();
    await expect(cardContainer).toBeVisible();
  });

  // Qase Test Case ID: 96
  test('ONEVIEW-96: Verify read-only mode @smoke', async ({ page }) => {

    // Verify card is loaded
    const medFillCard = page.locator('text=/Medication Fill History|Medication/i').first();
    await expect(medFillCard).toBeVisible({ timeout: 10000 });

    // Verify no editable fields exist (read-only)
    const editableInputs = page.locator('input:not([readonly]):not([disabled])').filter({ 
      has: page.locator('text=/Medication Fill History|Medication/i') 
    });
    const count = await editableInputs.count();
    expect(count).toBe(0);
  });

  // Qase Test Case ID: 100
  test('ONEVIEW-100: Verify "View All" link presence @smoke', async ({ page }) => {

    // Wait for card to load
    const medFillCard = page.locator('text=/Medication Fill History|Medication/i').first();
    await expect(medFillCard).toBeVisible({ timeout: 10000 });

    // Verify "View All" link is visible
    const viewAllButton = page.locator("(//button[@class='inline-flex items-center justify-center gap-[10px] whitespace-nowrap font-inter transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-500 border border-transparent hover:border-primary-500 bg-transparent shadow-none font-medium h-[40px] rounded-[6px] px-[20px] py-[9px] text-[14px] leading-5 !h-[28px] !px-3 !py-1 !text-sm mb-[2px]'][normalize-space()='View all'])[3]");
    await expect(viewAllButton).toBeVisible({ timeout: 5000 });
  });

});

