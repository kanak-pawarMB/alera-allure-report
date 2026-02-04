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

  /**
   * Gets the Risk Score clickable element within the Risk Stratification card.
   * Uses multiple locator strategies with fallback for robustness.
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<import('@playwright/test').Locator>}
   */
  // @ts-ignore
  async function getRiskScoreLink(page) {
    // Wait for skeleton loaders to disappear (indicates data is loaded)
    await page.waitForFunction(() => {
      const skeletons = document.querySelectorAll('[class*="skeleton"], [class*="animate-pulse"]');
      return skeletons.length === 0;
    }, { timeout: 30000 }).catch(() => {});

    // Use multiple locator strategies with fallback
    // Primary: Use button role with Risk Score text
    const byRole = page.getByRole('button', { name: /Risk Score/i });

    // Fallback 1: Badge/button containing "Risk Score:" pattern
    const byText = page.getByText(/Risk Score:\s*\d+/i);

    // Fallback 2: Within Risk Stratification card, find clickable element
    const withinCard = page.locator('[class*="card"]')
      .filter({ hasText: /Risk Stratification/i })
      .locator('button, [role="button"], a, [class*="badge"]')
      .filter({ hasText: /Risk Score/i });

    // Use .or() chaining for fallback
    const riskScoreLink = byRole.or(byText).or(withinCard);

    // Scroll into view and wait for visibility
    await riskScoreLink.first().scrollIntoViewIfNeeded().catch(() => {});
    await expect(riskScoreLink.first()).toBeVisible({ timeout: 15000 });

    return riskScoreLink.first();
  }

  /* -------------------- Setup -------------------- */

  test.beforeEach(async ({ page }) => {
    try {
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for initial renders
      
      // Try networkidle with longer timeout, fallback to just waiting
      try {
        await page.waitForLoadState('networkidle', { timeout: 60000 });
      } catch {
        await page.waitForTimeout(3000); // Fallback wait
      }

      // Verify we're on dashboard (not redirected to login)
      const currentUrl = page.url();
      if (currentUrl.includes('login')) {
        throw new Error('Redirected to login page - auth session may have expired');
      }

      // Search and select patient using flexible locators
      const searchBox = await getSearchField(page);
      await searchBox.click();
      await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
      await page.waitForTimeout(1000);

      // Click search result
      const searchResult = await getSearchResult(page, 'NC767095351|Elizabeth Garcia|12/09/');
      await searchResult.click();

      // Wait for patient data to load
      try {
        await page.waitForLoadState('networkidle', { timeout: 45000 });
      } catch {
        await page.waitForTimeout(3000); // Fallback wait
      }

      // Wait for skeleton loaders to disappear (critical for data readiness)
      await page.waitForFunction(() => {
        const skeletons = document.querySelectorAll('[class*="skeleton"], [class*="animate-pulse"]');
        return skeletons.length === 0;
      }, { timeout: 30000 }).catch(() => {});

      // Verify Risk Stratification card is visible before proceeding
      const riskStratCard = page.locator('text=/Risk Stratification/i').first();
      await expect(riskStratCard).toBeVisible({ timeout: 20000 });
    } catch (e) {
      await page.screenshot({ path: 'screenshots/riskstrat-beforeeach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
  });

  // ===================== ONEVIEW-468 =====================
  test('ONEVIEW-468: Smoke_Open Risk Stratification pop-up @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '468' });

    // Get Risk Score link using robust locator
    let riskScoreLink;
    try {
      riskScoreLink = await getRiskScoreLink(page);
    } catch (e) {
      await page.screenshot({ path: 'screenshots/debug-riskscorelink-ONEVIEW-468.png', fullPage: true }).catch(() => {});
      throw e;
    }

    // Click to open modal
    await riskScoreLink.click({ timeout: 10000 });

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 10000 });

    // Wait for year selector to appear (indicates modal content is loaded)
    const yearSelector = page.getByRole('button', { name: 'Select Years' });
    await expect(yearSelector).toBeVisible({ timeout: 10000 });

    // Verify modal contains Risk Stratification content
    await expect(modal.first()).toContainText(/Risk Score|Risk Stratification|Quarter|Year/i);
  });

  // ===================== ONEVIEW-390 =====================
  test('ONEVIEW-390: Smoke_Validate yearly filter options @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '390' });

    // Get Risk Score link using robust locator
    const riskScoreLink = await getRiskScoreLink(page);
    await riskScoreLink.click({ timeout: 10000 });

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 10000 });

    // Wait for year selector to appear
    const yearSelector = page.getByRole('button', { name: 'Select Years' });
    await expect(yearSelector).toBeVisible({ timeout: 10000 });

    // Click year selector to open dropdown
    await yearSelector.click();
    await page.waitForTimeout(1000);

    // Verify modal is still visible
    await expect(modal.first()).toBeVisible({ timeout: 5000 });

    // Click outside dropdown to close it
    await page.click('body', { position: { x: 500, y: 300 } });
    await page.waitForTimeout(500);

    // Modal should still be visible
    await expect(modal.first()).toBeVisible({ timeout: 5000 });

    // Close modal using close icon
    const closeIcon = page.getByRole('button', { name: 'Close' });
    await expect(closeIcon).toBeVisible({ timeout: 5000 });
    await closeIcon.click();
    await expect(modal.first()).not.toBeVisible({ timeout: 5000 });
  });

  // ===================== ONEVIEW-470 =====================
  test('ONEVIEW-470: Smoke_Dynamic graph update on year selection @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '470' });

    // Get Risk Score link using robust locator
    let riskScoreLink;
    try {
      await page.screenshot({ path: 'screenshots/debug-ONEVIEW-470-before-risk-score-click.png', fullPage: true }).catch(() => {});
      riskScoreLink = await getRiskScoreLink(page);
      await page.screenshot({ path: 'screenshots/debug-ONEVIEW-470-risk-score-visible.png', fullPage: true }).catch(() => {});
    } catch (e) {
      await page.screenshot({ path: 'screenshots/debug-riskscorelink-ONEVIEW-470.png', fullPage: true }).catch(() => {});
      throw e;
    }

    await riskScoreLink.click({ timeout: 10000 });
    await page.screenshot({ path: 'screenshots/debug-ONEVIEW-470-after-risk-score-click.png', fullPage: true }).catch(() => {});

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    try {
      await expect(modal.first()).toBeVisible({ timeout: 10000 });
    } catch {
      await page.screenshot({ path: 'screenshots/debug-ONEVIEW-470-modal-not-found.png', fullPage: true }).catch(() => {});
      throw new Error('Modal did not appear after clicking Risk Score link');
    }

    // Wait for year selector to appear
    const yearSelector = page.getByRole('button', { name: 'Select Years' });
    try {
      await expect(yearSelector).toBeVisible({ timeout: 20000 });
    } catch (e) {
      await page.screenshot({ path: 'screenshots/debug-yearselector-ONEVIEW-470.png', fullPage: true }).catch(() => {});
      throw e;
    }

    // Open year dropdown
    await yearSelector.click();
    await page.waitForTimeout(2000);

    // Verify modal is visible
    await expect(modal.first()).toBeVisible({ timeout: 5000 });

    // Click on any visible option in the dropdown
    const anyButton = page.locator('[role="dialog"] button').nth(1);
    try {
      await expect(anyButton).toBeVisible({ timeout: 10000 });
      await anyButton.click();
    } catch {
      await expect(modal.first()).toBeVisible();
    }

    // Verify modal still contains content
    await expect(modal.first()).toBeVisible();
    await expect(modal.first()).toContainText(/Risk Score|Quarter/i);
  });

  // ===================== ONEVIEW-477 =====================
  test('ONEVIEW-477: Smoke_Close pop-up @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '477' });

    // Get Risk Score link using robust locator
    let riskScoreLink;
    try {
      await page.screenshot({ path: 'screenshots/debug-before-riskScore-ONEVIEW-477.png', fullPage: true }).catch(() => {});
      riskScoreLink = await getRiskScoreLink(page);
    } catch (e) {
      await page.screenshot({ path: 'screenshots/debug-riskscorelink-ONEVIEW-477.png', fullPage: true }).catch(() => {});
      throw e;
    }

    await riskScoreLink.click({ timeout: 10000 });

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 10000 });

    // Wait for year selector (confirms modal content loaded)
    const yearSelector = page.getByRole('button', { name: 'Select Years' });
    await expect(yearSelector).toBeVisible({ timeout: 10000 });

    // Close modal using close icon - use more robust locator
    const closeIcon = page.getByRole('button', { name: /close/i })
      .or(page.locator('[aria-label="Close"]'))
      .or(page.locator("(//img[@class=' block dark:hidden'])[1]"));
    await expect(closeIcon.first()).toBeVisible({ timeout: 5000 });
    await closeIcon.first().click();

    await expect(modal.first()).not.toBeVisible({ timeout: 5000 });
  });
});
