// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { RecentVisitsCard } from '../pages/cards/RecentVisitsCard.js';

test.use({ storageState: 'auth.json' });

test.describe('Recent Visits - Smoke Tests', () => {
  let dashboard;
  let recentVisitsCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    recentVisitsCard = new RecentVisitsCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-RecentVisits-beforeEach-fail.png');
      throw e;
    }
  });

  test('ONEVIEW-326: Verify displayed columns @smoke', async ({ page }) => {
    const card = page.locator('text=/Recent Visits|Recent.*Encounters|Encounters/i').first();
    await expect(card).toBeVisible({ timeout: TIMEOUTS.medium });
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);

    const hasDateColumn    = await page.locator('text=/Date/i').first().isVisible().catch(() => false);
    const hasTypeColumn    = await page.locator('text=/Type/i').first().isVisible().catch(() => false);
    const hasFacility      = await page.locator('text=/Facility/i').first().isVisible().catch(() => false);
    const hasDiagnosis     = await page.locator('text=/Diagnosis/i').first().isVisible().catch(() => false);
    expect(hasDateColumn || hasTypeColumn || hasFacility || hasDiagnosis).toBeTruthy();
  });

  test('ONEVIEW-330: Verify "View All" link visibility @smoke', async ({ page }) => {
    await recentVisitsCard.assertVisible();
    // Recent Visits is the 2nd "View all" button on the page
    const viewAllButton = page.locator("(//button[contains(text(),'View all')])[2]");
    await expect(viewAllButton).toBeVisible({ timeout: TIMEOUTS.short });
    expect(await viewAllButton.isVisible()).toBeTruthy();
  });

  test('ONEVIEW-343: Verify responsiveness @smoke', async ({ page }) => {
    const card = page.locator('text=/Recent Visits|Recent.*Encounters|Encounters/i').first();
    await expect(card).toBeVisible({ timeout: TIMEOUTS.medium });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await expect(card).toBeVisible({ timeout: TIMEOUTS.short });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBeFalsy();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await expect(card).toBeVisible({ timeout: TIMEOUTS.short });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBeFalsy();

    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
