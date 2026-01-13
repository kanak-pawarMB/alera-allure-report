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

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select patient
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
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
    
    // Verify modal is visible
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    
    // Verify search box is present
    const searchBox = page.getByRole('textbox', { name: /search|filter/i });
    await expect(searchBox.first()).toBeVisible();
    
    // Verify timeline selector is present
    const timelineSelector = page.getByRole('button', { name: /All Time|7 Months|6 Months|3 Months/i });
    await expect(timelineSelector.first()).toBeVisible();

  });

  // ===================== ONEVIEW-462 =====================
  test('ONEVIEW-462: Smoke_Validate modal close icon @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '462' });

    // Click View All button for ADT Alerts
    await page.locator("(//button[contains(text(),'View all')])[1]").click();
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);
    
    // Verify modal is visible
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    
    // Click Close button
    await page.getByRole('button', { name: 'Close' }).click();
    
    // Verify modal is closed
    await expect(modal.first()).not.toBeVisible();

  });

  // ===================== ONEVIEW-465 =====================
  test('ONEVIEW-465: Smoke_Validate persistent modal design across resolutions @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '465' });

    // Click View All button for ADT Alerts
    await page.locator("(//button[contains(text(),'View all')])[1]").click();
    
    // Wait for timeline selector to appear (indicates modal is open)
    const timelineSelector = page.getByRole('button', { name: /All Time|7 Months|6 Months|3 Months/i });
    await expect(timelineSelector.first()).toBeVisible({ timeout: 10000 });
    
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
    await expect(modal.first()).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(modal.first()).not.toBeVisible();

  });

});
