// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { MedicationFillHistoryCard } from '../pages/cards/MedicationFillHistoryCard.js';
import { MedicationFillHistoryModal } from '../pages/modals/MedicationFillHistoryModal.js';

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Medication Fill History - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let medFillCard;
  let medFillModal;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    medFillCard = new MedicationFillHistoryCard(page);
    medFillModal = new MedicationFillHistoryModal(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
      await page.waitForTimeout(2000);
      await dashboard.assertNotRedirectedToLogin();
      await dashboard.loadDefaultPatient();
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await page.waitForTimeout(3000);
      await dashboard.dismissAlertBannerIfPresent();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-ModalMedFillHistory-beforeEach-fail.png');
      throw e;
    }
  });

  test('ONEVIEW-101: View All opens modal @smoke', async ({ page }) => {
    await page.waitForTimeout(500);
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();
    await medFillModal.assertContent();
  });

  test('ONEVIEW-102: Modal contains search bar @smoke', async () => {
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();
    await expect(medFillModal.modal.getByRole('textbox').first()).toBeVisible();
  });

  test('ONEVIEW-399: Modal opens consistently @smoke', async () => {
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();
  });

  test('ONEVIEW-410: Modal close via Close icon @smoke', async ({ page }) => {
    await page.waitForTimeout(500);
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();
    const closeIcon = page.locator("(//div[@aria-label='Close'])[1]");
    await expect(closeIcon).toBeVisible({ timeout: 5000 });
    await closeIcon.click();
    await expect(medFillModal.modal).toHaveCount(0);
  });
});
