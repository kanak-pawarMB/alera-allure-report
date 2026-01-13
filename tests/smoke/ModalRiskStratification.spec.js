  // ===================== ONEVIEW-390 =====================
  test('ONEVIEW-390: Smoke_Validate yearly filter options @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '390' });
    // Click Risk Score link to open modal
    const riskScoreLink = page.locator("(//p[@class='font-inter font-semibold text-[12px] leading-[21px] tracking-[0px] truncate block w-full'])[1]");
    try {
      await expect(riskScoreLink).toBeVisible({ timeout: 30000 });
      await riskScoreLink.click();
    } catch (e) {
      await page.screenshot({ path: `debug-riskscorelink-ONEVIEW-390.png`, fullPage: true });
      throw e;
    }
    // Wait for year selector to appear
    const yearSelector = page.getByRole('button', { name: 'Select Years arrow' });
    await expect(yearSelector).toBeVisible({ timeout: 10000 });
    // Open year dropdown
    await yearSelector.click();
    // Get all year options
    const yearOptions = page.locator('[role="option"]').or(page.getByRole('option'));
    const yearCount = await yearOptions.count();
    expect(yearCount).toBeGreaterThan(0);
    // Optionally: check that only valid years are present (smoke: just check visible)
    for (let i = 0; i < yearCount; i++) {
      const yearText = await yearOptions.nth(i).textContent();
      expect(yearText).toMatch(/20\d{2}/); // Year format
    }
    // Modal should still be visible
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible();
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(modal.first()).not.toBeVisible();
  });
// @ts-check

/**
 * Test Suite: Drill Down - Risk Stratification Card (Smoke Tests)
 * 
 * XPath for Risk Score link (1st element): 
 * (//p[@class='font-inter font-semibold text-[12px] leading-[21px] tracking-[0px] truncate block w-full'])[1]
 * 
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 * Dashboard: https://qa.oneview.alerahealth.com/dashboard
 */

import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Risk Stratification Card - Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select patient
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
  });

  // ===================== ONEVIEW-468 =====================
  test('ONEVIEW-468: Smoke_Open Risk Stratification pop-up @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '468' });

    // Click Risk Score link to open modal
    const riskScoreLink468 = page.locator("(//p[@class='font-inter font-semibold text-[12px] leading-[21px] tracking-[0px] truncate block w-full'])[1]");
    try {
      await expect(riskScoreLink468).toBeVisible({ timeout: 10000 });
      await riskScoreLink468.click();
    } catch (e) {
      await page.screenshot({ path: `debug-riskscorelink-ONEVIEW-468.png`, fullPage: true });
      throw e;
    }
    
    // Wait for year selector to appear (indicates modal is open)
    const yearSelector = page.getByRole('button', { name: 'Select Years arrow' });
    await expect(yearSelector).toBeVisible({ timeout: 10000 });
    
    // Verify modal is visible
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    
    // Verify modal contains Risk Stratification content
    await expect(modal.first()).toContainText(/Risk Score|Risk Stratification|Quarter|Year/i);

  });

  // ===================== ONEVIEW-470 =====================
  test('ONEVIEW-470: Smoke_Dynamic graph update on year selection @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '470' });

    // Click Risk Score link to open modal
    const riskScoreLink470 = page.locator("(//p[@class='font-inter font-semibold text-[12px] leading-[21px] tracking-[0px] truncate block w-full'])[1]");
    try {
      await expect(riskScoreLink470).toBeVisible({ timeout: 30000 });
      await riskScoreLink470.click();
    } catch (e) {
      await page.screenshot({ path: `debug-riskscorelink-ONEVIEW-470.png`, fullPage: true });
      throw e;
    }
    
    // Wait for year selector to appear
    const yearSelector = page.getByRole('button', { name: 'Select Years arrow' });
    await expect(yearSelector).toBeVisible({ timeout: 10000 });
    
    // Verify modal is visible
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    
    // Open year dropdown
    await yearSelector.click();
    
    // Select a different year (2024)
    await page.getByRole('button', { name: '2024' }).click();
    
    // Verify graph updates (check that modal still contains content - indicates no page reload)
    await expect(modal.first()).toBeVisible();
    await expect(modal.first()).toContainText(/Risk Score|Quarter/i);

  });

  // ===================== ONEVIEW-477 =====================
  test('ONEVIEW-477: Smoke_Close pop-up @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '477' });

    // Click Risk Score link to open modal
    const riskScoreLink477 = page.locator("(//p[@class='font-inter font-semibold text-[12px] leading-[21px] tracking-[0px] truncate block w-full'])[1]");
    try {
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `debug-before-riskScore-ONEVIEW-477.png`, fullPage: true });
      await expect(riskScoreLink477).toBeVisible({ timeout: 15000 });
      await riskScoreLink477.click();
    } catch (e) {
      await page.screenshot({ path: `debug-riskscorelink-ONEVIEW-477.png`, fullPage: true });
      throw e;
    }
    // Wait for year selector to appear
    const yearSelector = page.getByRole('button', { name: 'Select Years arrow' });
    await expect(yearSelector).toBeVisible({ timeout: 10000 });
    // Verify modal is visible
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    // Close modal using provided close icon XPath
    const closeIcon477 = page.locator("(//img[@class=' block dark:hidden'])[1]");
    await expect(closeIcon477).toBeVisible({ timeout: 5000 });
    await closeIcon477.click();
    await expect(modal.first()).not.toBeVisible();

  });

  // ===================== ONEVIEW-479 =====================
  test('ONEVIEW-479: Smoke_Screen resolution responsiveness @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '479' });

    // Click Risk Score link to open modal
    await page.locator("(//p[@class='font-inter font-semibold text-[12px] leading-[21px] tracking-[0px] truncate block w-full'])[1]").click();
    
    // Wait for year selector to appear
    const yearSelector = page.getByRole('button', { name: 'Select Years arrow' });
    await expect(yearSelector).toBeVisible({ timeout: 10000 });
    
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
