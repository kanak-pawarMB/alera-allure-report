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
      await page.screenshot({ path: 'adtalerts-beforeeach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
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

  // ===================== ONEVIEW-451 =====================
  test('ONEVIEW-451: Smoke_Validate presence of search and timeline filters @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '451' });

    // Click View All button for ADT Alerts
    await page.locator("(//button[contains(text(),'View all')])[1]").click();
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);
    
    // Verify modal is visible (increased timeout)
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 15000 });

    // Verify search box is present
    const searchBox = page.getByRole('textbox', { name: /search|filter/i });
    await expect(searchBox.first()).toBeVisible({ timeout: 10000 });

    // Verify timeline selector is present
    const timelineSelector = page.getByRole('button', { name: /All Time|7 Months|6 Months|3 Months/i });
    await expect(timelineSelector.first()).toBeVisible({ timeout: 10000 });

  });

  // ===================== ONEVIEW-462 =====================
  test('ONEVIEW-462: Smoke_Validate modal close icon @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '462' });

    // Click View All button for ADT Alerts
    await page.locator("(//button[contains(text(),'View all')])[1]").click();

    // Wait for modal to appear
    await page.waitForTimeout(1000);

    // Verify modal is visible (increased timeout)
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 15000 });

    // Click Close button
    await page.getByRole('button', { name: 'Close' }).click();

    // Verify modal is closed
    await expect(modal.first()).not.toBeVisible({ timeout: 10000 });

  });

  // ===================== ONEVIEW-465 =====================
  test('ONEVIEW-465: Smoke_Validate persistent modal design across resolutions @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '465' });

    // Click View All button for ADT Alerts
    await page.locator("(//button[contains(text(),'View all')])[1]").click();
    
    // Wait for timeline selector to appear (indicates modal is open)
    const timelineSelector = page.getByRole('button', { name: /All Time|7 Months|6 Months|3 Months/i });
    try {
      await expect(timelineSelector.first()).toBeVisible({ timeout: 20000 });
    } catch (e) {
      await page.screenshot({ path: 'adtalerts-timeline-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
    
    // Verify modal is visible
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });

    // Test responsive breakpoints
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(modal.first()).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(modal.first()).toBeVisible();

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    // Add wait after viewport change
    await page.waitForTimeout(1000);
    await expect(modal.first()).toBeVisible({ timeout: 10000 });
    
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(modal.first()).not.toBeVisible();

  });

});
