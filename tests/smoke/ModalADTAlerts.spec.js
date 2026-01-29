// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - ADT Alerts Modal Drill Down
 * XPath for View All button: (//button[contains(text(),'View all')])[1]
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down ADT Alerts - Smoke Tests', () => {
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
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    const searchBox = page.getByRole('textbox', { name: "Search by Patient's Medicaid" }).first();
    await searchBox.click();
    await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
    
    const patientResult = page.getByText(TEST_DATA.patients.completeData.medicaidId, { exact: false }).first();
    await expect(patientResult).toBeVisible({ timeout: 15000 });
    await patientResult.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  // ===================== ONEVIEW-450 =====================
  test('ONEVIEW-450: Smoke_Validate modal opens on clicking View All @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '450' });

    // Click View All button for ADT Alerts using XPath (1st View all button)
    await page.locator("(//button[contains(text(),'View all')])[1]").click();
    
    // Wait for timeline selector to appear (indicates modal is open)
    const timelineSelector = page.getByRole('button', { name: /All Time|7 Months|6 Months|3 Months/i });
    await expect(timelineSelector.first()).toBeVisible({ timeout: 10000 });
    
    // Verify modal is visible
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    
    // Verify modal contains ADT Alerts content
    await expect(modal.first()).toContainText(/ADT|Alert|Facility|Admission|Discharge|Transfer/i);

  });
});
