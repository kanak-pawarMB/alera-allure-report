// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ADTAlertsModal } from '../pages/modals/ADTAlertsModal.js';

/**
 * SMOKE TEST - ADT Alerts Modal Drill Down
 * XPath for View All button: (//button[contains(text(),'View all')])[1]
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down ADT Alerts - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let adtModal;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    adtModal = new ADTAlertsModal(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
      await page.waitForTimeout(2000);
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-ModalADTAlerts-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 450
  test('ONEVIEW-450: Smoke_Validate modal opens on clicking View All @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '450' });
    await adtModal.open();
    await adtModal.assertContent();
    await adtModal.assertTimelineFilterPresent();
  });
});
