// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { CostUtilizationCard } from '../pages/cards/CostUtilizationCard.js';

/**
 * SMOKE TEST - 12 Month Cost/Utilization Summary Card Critical Path
 * Qase Test Management Suite: Suite 29
 */

test.use({ storageState: 'auth.json' });

test.describe('Cost Utilization - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let costCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    costCard = new CostUtilizationCard(page);
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('costutil-beforeeach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 282
  test('ONEVIEW-282: Verify display of all cost categories @smoke', async ({ page }) => {
    const costTitle = page.locator('text=/12-month Cost.*Utilization|12 month Cost.*Utilization/i').first();
    await expect(costTitle).toBeVisible({ timeout: 10000 });
    await costCard.assertVisible();
    const cardText = await costCard.getCardText();
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 285
  test('ONEVIEW-285: Verify read-only view @smoke', async ({ page }) => {
    const costTitle = page.locator('text=/12 Month Cost|Cost.*Utilization|Utilization Summary/i').first();
    await expect(costTitle).toBeVisible({ timeout: 10000 });
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /12 Month Cost|Cost.*Utilization|Utilization Summary/i }).first();
    const editableInputs = cardContainer.locator('input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])');
    expect(await editableInputs.count()).toBe(0);
    const cardText = await cardContainer.textContent() || '';
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 297
  test('ONEVIEW-297: Verify responsiveness @smoke', async ({ page }) => {
    const costTitle = page.locator('text=/12 Month Cost|Cost.*Utilization|Utilization Summary/i').first();
    await expect(costTitle).toBeVisible({ timeout: 10000 });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(costTitle).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /12 Month Cost|Cost.*Utilization|Utilization Summary/i }).first();
    expect(await cardContainer.isVisible().catch(() => false)).toBeTruthy();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(costTitle).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.body.clientWidth) + 10);
  });
});
