// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Recent Visits Modal Drill Down
 * XPath for View All button: (//button[contains(text(),'View all')])[2]
 * XPath for Close icon: (//div[@aria-label='Close'])[1]
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Recent Visits - Smoke Tests', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
      await page.waitForTimeout(2000);

      // Guard: ensure we're not redirected to login
      if (page.url().includes('login')) {
        throw new Error('Redirected to login page - auth session may have expired. Re-run auth.setup.spec.js');
      }

      const searchBox = page.getByRole('textbox', { name: /search/i }).first();
      await expect(searchBox).toBeVisible({ timeout: 20000 });
      await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
      await page.waitForTimeout(500);
      await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
      await page.waitForTimeout(2000);
      await expect(page.locator('div').filter({ hasText: /Recent Visits|Encounters/i }).first()).toBeVisible({ timeout: 30000 });

      // Dismiss ADT alert banner if present (it can intercept clicks on "View all" button)
      const dismissBtn = page.getByRole('button', { name: /Dismiss/i }).first();
      if (await dismissBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dismissBtn.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      await page.screenshot({ path: `debug-beforeEach-${testInfo.title.replace(/\s+/g,'_')}.png`, fullPage: true });
      throw e;
    }
  });

  // ===================== ONEVIEW-331 =====================
  test('ONEVIEW-331: Smoke_Verify “View All” link click opens modal @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '331' });
    const recentVisitsCard = page.locator('[class*="card"]').filter({ hasText: /Recent Visits/i }).first();
    await recentVisitsCard.locator('button:has-text("View all")').first().click();
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    await expect(modal.first()).toContainText(/Recent Visits|Encounters|Facility/i);
  });

  // ===================== ONEVIEW-333 =====================
  test('ONEVIEW-333: Smoke_Verify timeline selector presence @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '333' });
    const recentVisitsCard = page.locator('[class*="card"]').filter({ hasText: /Recent Visits/i }).first();
    await recentVisitsCard.locator('button:has-text("View all")').first().click();
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    const timelineSelector = page.getByRole('button', { name: /All Time|7 Months|6 Months|3 Months|Date Range/i });
    await expect(timelineSelector.first()).toBeVisible({ timeout: 10000 });
  });

  // ===================== ONEVIEW-334 =====================
  test('ONEVIEW-334: Smoke_Verify search functionality by Facility Name @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '334' });
    const recentVisitsCard = page.locator('[class*="card"]').filter({ hasText: /Recent Visits/i }).first();
    await recentVisitsCard.locator('button:has-text("View all")').first().click();
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    const searchBox = modal.getByRole('textbox').or(page.getByRole('textbox', { name: /search|filter/i }));
    await expect(searchBox.first()).toBeVisible();
  });

  // ===================== ONEVIEW-337 =====================
  test('ONEVIEW-337: Smoke_Verify filtering by timeline @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '337' });
    const recentVisitsCard = page.locator('[class*="card"]').filter({ hasText: /Recent Visits/i }).first();
    await recentVisitsCard.locator('button:has-text("View all")').first().click();
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    const timelineSelector = page.getByRole('button', { name: /All Time|7 Months|6 Months|3 Months|Date Range/i });
    await timelineSelector.first().click();
    const option = page.locator('[role="option"]').or(page.getByRole('option'));
    if (await option.count()) {
      await option.first().click();
    }
    await expect(modal.first()).toBeVisible();
  });


  // ===================== ONEVIEW-340 =====================
  test('ONEVIEW-340: Smoke_Verify modal dismiss via close icon @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '340' });
    const recentVisitsCard = page.locator('[class*="card"]').filter({ hasText: /Recent Visits/i }).first();
    await recentVisitsCard.locator('button:has-text("View all")').first().click();
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    const closeIcon = page.locator("(//img[@class=' block dark:hidden'])[1]");
    await expect(closeIcon).toBeVisible({ timeout: 5000 });
    await closeIcon.click();
    await expect(modal.first()).not.toBeVisible();
  });

  // ===================== ONEVIEW-448 =====================
  test('ONEVIEW-448: Smoke_Validate responsiveness @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '448' });
    const recentVisitsCard = page.locator('[class*="card"]').filter({ hasText: /Recent Visits/i }).first();
    await recentVisitsCard.locator('button:has-text("View all")').first().click();
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    // Test responsive breakpoints
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(modal.first()).toBeVisible();
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(modal.first()).toBeVisible();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(modal.first()).toBeVisible();
    const closeIcon = page.locator("(//div[@aria-label='Close'])[1]");
    await expect(closeIcon).toBeVisible({ timeout: 5000 });
    await closeIcon.click();
    await expect(modal.first()).not.toBeVisible();
  });

});
