// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { RecentVisitsCard } from '../pages/cards/RecentVisitsCard.js';
import { RecentVisitsModal } from '../pages/modals/RecentVisitsModal.js';

/**
 * SMOKE TEST - Recent Visits Modal Drill Down
 * XPath for View All button: (//button[contains(text(),'View all')])[2]
 * XPath for Close icon: (//div[@aria-label='Close'])[1]
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Recent Visits - Smoke Tests', () => {

  let dashboard;
  let recentVisitsCard;
  let recentVisitsModal;

  test.beforeEach(async ({ page }, testInfo) => {
    dashboard = new DashboardPage(page);
    recentVisitsCard = new RecentVisitsCard(page);
    recentVisitsModal = new RecentVisitsModal(page);
    await dashboard.goto();
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
      await page.waitForTimeout(2000);
      await dashboard.assertNotRedirectedToLogin();
      await dashboard.loadDefaultPatient();
      await expect(page.locator('div').filter({ hasText: /Recent Visits|Encounters/i }).first()).toBeVisible({ timeout: 30000 });
      await dashboard.dismissAlertBannerIfPresent();
    } catch (e) {
      await dashboard.screenshotOnFailure(`debug-beforeEach-${testInfo.title.replace(/\s+/g, '_')}.png`);
      throw e;
    }
  });

  // Qase Test Case ID: 331
  test('ONEVIEW-331: Smoke_Verify "View All" link click opens modal @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '331' });
    await recentVisitsCard.clickViewAll();
    await recentVisitsModal.assertVisible();
    await recentVisitsModal.assertContent();
  });

  // Qase Test Case ID: 333
  test('ONEVIEW-333: Smoke_Verify timeline selector presence @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '333' });
    await recentVisitsCard.clickViewAll();
    await recentVisitsModal.assertVisible(15000);
    await recentVisitsModal.assertTimelineSelectorVisible();
  });

  // Qase Test Case ID: 334
  test('ONEVIEW-334: Smoke_Verify search functionality by Facility Name @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '334' });
    await recentVisitsCard.clickViewAll();
    await recentVisitsModal.assertVisible();
    await recentVisitsModal.assertSearchBoxPresent();
  });

  // Qase Test Case ID: 337
  test('ONEVIEW-337: Smoke_Verify filtering by timeline @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '337' });
    await recentVisitsCard.clickViewAll();
    await recentVisitsModal.assertVisible();
    await recentVisitsModal.selectFirstTimelineOption();
    await recentVisitsModal.assertVisible();
  });

  // Qase Test Case ID: 340
  test('ONEVIEW-340: Smoke_Verify modal dismiss via close icon @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '340' });
    await recentVisitsCard.clickViewAll();
    await recentVisitsModal.assertVisible();
    await recentVisitsModal.closeViaIcon();
  });

  // Qase Test Case ID: 448
  test('ONEVIEW-448: Smoke_Validate responsiveness @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '448' });
    await recentVisitsCard.clickViewAll();
    await recentVisitsModal.assertVisible();
    await page.setViewportSize({ width: 375, height: 667 });
    await recentVisitsModal.assertVisible();
    await page.setViewportSize({ width: 768, height: 1024 });
    await recentVisitsModal.assertVisible();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await recentVisitsModal.assertVisible();
    await recentVisitsModal.closeViaIcon();
  });
});
