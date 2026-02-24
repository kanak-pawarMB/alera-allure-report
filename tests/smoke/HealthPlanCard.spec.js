// @ts-check
import { test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { HealthPlanCard } from '../pages/cards/HealthPlanCard.js';

/**
 * SMOKE TEST - Health Plan Card Critical Path
 * Qase Test Management Suite: Suite 10
 */

test.use({ storageState: 'auth.json' });

test.describe('Health Plan Card - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let healthPlanCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    healthPlanCard = new HealthPlanCard(page);
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('healthplan-beforeeach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 81
  test('ONEVIEW-81: Verify Health Plan Card Display @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '81' });
    await healthPlanCard.assertVisible(5000);
    await healthPlanCard.assertPlanDataPresent();

    const planDataCount = await page.locator('text=/plan|enrollment|effective|member/i').count();
    console.log(`Health Plan card loaded with ${planDataCount} data fields`);
  });
});
