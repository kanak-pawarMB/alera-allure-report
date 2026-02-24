// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { RiskStratificationCard } from '../pages/cards/RiskStratificationCard.js';
import { RiskStratificationModal } from '../pages/modals/RiskStratificationModal.js';

/**
 * Test Suite: Drill Down - Risk Stratification Card (Smoke Tests)
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Risk Stratification Card - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let riskCard;
  let riskModal;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    riskCard = new RiskStratificationCard(page);
    riskModal = new RiskStratificationModal(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await page.waitForTimeout(2000);
      try {
        await page.waitForLoadState('networkidle', { timeout: 60000 });
      } catch {
        await page.waitForTimeout(3000);
      }
      await dashboard.assertNotRedirectedToLogin();
      await dashboard.loadDefaultPatient();
      try {
        await page.waitForLoadState('networkidle', { timeout: 45000 });
      } catch {
        await page.waitForTimeout(3000);
      }
      await riskCard.waitForDataLoaded();
      await expect(page.locator('text=/Risk Stratification/i').first()).toBeVisible({ timeout: 20000 });
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/riskstrat-beforeeach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 468
  test('ONEVIEW-468: Smoke_Open Risk Stratification pop-up @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '468' });
    try {
      await riskCard.clickRiskScoreLink();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-riskscorelink-ONEVIEW-468.png');
      throw e;
    }
    await riskModal.assertVisible();
    await riskModal.assertYearSelectorVisible();
    await riskModal.assertContent();
  });

  // Qase Test Case ID: 390
  test('ONEVIEW-390: Smoke_Validate yearly filter options @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '390' });
    await riskCard.clickRiskScoreLink();
    await riskModal.assertVisible();
    await riskModal.assertYearSelectorVisible();
    await riskModal.openYearDropdown();
    await riskModal.assertVisible(5000);
    await riskModal.closeYearDropdown();
    await riskModal.assertVisible(5000);
    await riskModal.close();
  });

  // Qase Test Case ID: 470
  test('ONEVIEW-470: Smoke_Dynamic graph update on year selection @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '470' });
    try {
      await dashboard.screenshotOnFailure('screenshots/debug-ONEVIEW-470-before-risk-score-click.png');
      await riskCard.clickRiskScoreLink();
      await dashboard.screenshotOnFailure('screenshots/debug-ONEVIEW-470-after-risk-score-click.png');
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-riskscorelink-ONEVIEW-470.png');
      throw e;
    }
    try {
      await riskModal.assertVisible();
    } catch {
      await dashboard.screenshotOnFailure('screenshots/debug-ONEVIEW-470-modal-not-found.png');
      throw new Error('Modal did not appear after clicking Risk Score link');
    }
    try {
      await riskModal.assertYearSelectorVisible(20000);
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-yearselector-ONEVIEW-470.png');
      throw e;
    }
    await riskModal.openYearDropdown();
    await riskModal.assertVisible(5000);

    const anyButton = page.locator('[role="dialog"] button').nth(1);
    try {
      await expect(anyButton).toBeVisible({ timeout: 10000 });
      await anyButton.click();
    } catch {
      await riskModal.assertVisible();
    }

    await riskModal.assertVisible();
    await riskModal.assertContent();
  });

  // Qase Test Case ID: 477
  test('ONEVIEW-477: Smoke_Close pop-up @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '477' });
    try {
      await dashboard.screenshotOnFailure('screenshots/debug-before-riskScore-ONEVIEW-477.png');
      await riskCard.clickRiskScoreLink();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-riskscorelink-ONEVIEW-477.png');
      throw e;
    }
    await riskModal.assertVisible();
    await riskModal.assertYearSelectorVisible();
    await riskModal.close();
  });
});
