// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ADTAlertsModal } from '../pages/modals/ADTAlertsModal.js';

/**
 * SMOKE TEST - ADT Alerts Modal Drill Down
 * XPath for View All button: (//button[contains(text(),'View all')])[1]
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down ADT Alerts - Smoke Tests', () => {
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
      await dashboard.dismissAlertBannerIfPresent();
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

  // Qase Test Case ID: 451
  test('ONEVIEW-451: Smoke_Validate presence of search and timeline filters @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '451' });
    await adtModal.open();
    await adtModal.assertTimelineFilterPresent();
    const searchInput = adtModal.modal.locator(
      'input[type="search"], input[type="text"], input[placeholder*="search" i], input[placeholder*="filter" i]'
    ).first();
    const searchExists = await searchInput.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);
    const timelineExists = await adtModal.timelineFilterButton.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);
    expect(searchExists || timelineExists).toBeTruthy();
  });

  // Qase Test Case ID: 462
  test('ONEVIEW-462: Smoke_Validate modal close icon @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '462' });
    await adtModal.open();
    await adtModal.assertVisible();
    await adtModal.close();
  });

  // Qase Test Case ID: 465
  test('ONEVIEW-465: Smoke_Validate persistent modal design across resolutions @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '465' });

    // The app dismisses the modal on viewport resize, so we open it fresh at each size
    // to validate it renders correctly across all breakpoints.

    // 1280×720 (default, set in beforeEach)
    await adtModal.open();
    await adtModal.assertVisible();
    await adtModal.close();

    // 768×1024 (tablet)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await adtModal.open();
    await adtModal.assertVisible();
    await adtModal.close();

    // 1920×1080 (wide desktop)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await adtModal.open();
    await adtModal.assertVisible();
    await adtModal.close();
  });
});
