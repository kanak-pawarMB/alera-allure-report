// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ADTAlertsCard } from '../pages/cards/ADTAlertsCard.js';

/**
 * SMOKE TEST - ADT Alerts Card Critical Path
 * Qase Test Management Suite: Suite 27
 */

test.use({ storageState: 'auth.json' });

test.describe('ADT Alerts - Smoke Tests', () => {
  let dashboard;
  let adtCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    adtCard = new ADTAlertsCard(page);
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-ADTAlerts-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 263
  test('ONEVIEW-263: Verify ADT Alerts Card Display @smoke', async ({ page }) => {
    await expect(page.locator('text=/ADT Alerts/i').first()).toBeVisible({ timeout: TIMEOUTS.alerts });
    await adtCard.assertVisible(TIMEOUTS.alerts);
  });

  // Qase Test Case ID: 264
  test('ONEVIEW-264: Verify ADT Alerts Card Labels @smoke', async () => {
    await adtCard.assertVisible();
    await adtCard.assertLabelsPresent();
  });

  // Qase Test Case ID: 265
  test('ONEVIEW-265: Verify View All Link Visibility @smoke', async () => {
    await adtCard.assertVisible();
    await adtCard.assertViewAllVisible();
  });
});
