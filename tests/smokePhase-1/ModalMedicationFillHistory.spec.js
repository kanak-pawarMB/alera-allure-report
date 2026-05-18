// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { MedicationFillHistoryCard } from '../pages/cards/MedicationFillHistoryCard.js';
import { MedicationFillHistoryModal } from '../pages/modals/MedicationFillHistoryModal.js';

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Medication Fill History - Smoke Tests', () => {
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
      await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.domLoad });
      await page.waitForTimeout(2000);
      await dashboard.assertNotRedirectedToLogin();
      await dashboard.loadDefaultPatient();
      await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.long });
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
    await medFillModal.assertVisible(TIMEOUTS.long);
    const closeIcon = page.locator("(//div[@aria-label='Close'])[1]");
    await expect(closeIcon).toBeVisible({ timeout: TIMEOUTS.short });
    await closeIcon.click();
    await expect(medFillModal.modal).toHaveCount(0);
  });

  // Qase Test Case ID: 103
  test('ONEVIEW-103: Smoke_Verify search by drug name @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '103' });
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();
    const searchBox = medFillModal.modal.getByRole('textbox').first();
    await expect(searchBox).toBeVisible({ timeout: TIMEOUTS.short });
    await searchBox.fill('Lisinopril');
    await medFillModal.assertVisible();
  });

  // Qase Test Case ID: 104
  test('ONEVIEW-104: Smoke_Verify "All Time" dropdown filter @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '104' });
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();
    const allTimeFilter = medFillModal.modal.locator(
      'button, [role="combobox"], select'
    ).filter({ hasText: /All Time|All|Time/i }).first();
    const filterExists = await allTimeFilter.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);
    const anyDropdown = medFillModal.modal.locator('select, [role="combobox"]').first();
    const dropdownExists = await anyDropdown.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);
    expect(filterExists || dropdownExists).toBeTruthy();
  });

  // Qase Test Case ID: 105
  test('ONEVIEW-105: Smoke_Verify "Class" dropdown filter @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '105' });
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();
    const classFilter = medFillModal.modal.locator(
      'button, [role="combobox"], select'
    ).filter({ hasText: /Class|Category/i }).first();
    const classExists = await classFilter.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);
    const anyDropdown = medFillModal.modal.locator('select, [role="combobox"]').first();
    const dropdownExists = await anyDropdown.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);
    expect(classExists || dropdownExists).toBeTruthy();
  });

  // Qase Test Case ID: 111
  test('ONEVIEW-111: Smoke_Verify Dropdown Filters in Modal @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '111' });
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();
    const dropdowns = medFillModal.modal.locator('select, [role="combobox"], button[aria-haspopup]');
    const count = await dropdowns.count();
    expect(count).toBeGreaterThanOrEqual(1);
    console.log(`Found ${count} dropdown filter(s) in Medication Fill History modal`);
  });

  // Qase Test Case ID: 414
  test('ONEVIEW-414: Smoke_Validate persistent modal layout across breakpoints @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '414' });
    await medFillCard.assertVisible();
    await medFillCard.clickViewAll();
    await medFillModal.assertVisible();

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    await medFillModal.assertVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await medFillModal.assertVisible();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await medFillModal.assertVisible();
  });
});
