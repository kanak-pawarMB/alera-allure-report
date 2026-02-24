// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';

/**
 * SMOKE TEST - Dynamic Dashboard Critical Path
 * Qase Test Management Suite: Suite 8
 */

test.use({ storageState: 'auth.json' });

test.describe('Dynamic Dashboard - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-DynamicDashboard-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 35
  test('ONEVIEW-35: Verify dashboard loads personalized layout for logged-in user @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '35' });
    const demographicsCard   = page.locator(':text("Demographics")');
    const pcpCard            = page.locator(':text("PCP")');
    const careManagementCard = page.locator(':text("Care Management")');
    await expect(demographicsCard.or(pcpCard).or(careManagementCard).first()).toBeVisible({ timeout: 5000 });
    const allCards = page.locator('[class*="card"]');
    const cardCount = await allCards.count();
    expect(cardCount).toBeGreaterThan(0);
    console.log(`Dashboard loaded with ${cardCount} cards`);
  });

  // Qase Test Case ID: 42
  test('ONEVIEW-42: Verify dashboard responsiveness @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '42' });
    const cards = page.locator('[class*="card"]').first();
    await expect(cards).toBeVisible({ timeout: 5000 });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(cards).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.body.clientWidth) + 10);

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(cards).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.body.clientWidth) + 10);
    console.log('Dashboard responsive layout verified for tablet and desktop');
  });
});
