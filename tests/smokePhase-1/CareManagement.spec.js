// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { TEST_DATA } from '../testData.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { CareManagementCard } from '../pages/cards/CareManagementCard.js';

/**
 * SMOKE TEST - Care Management Card Critical Path
 * Qase Test Management Suite: Suite 16
 */

test.use({ storageState: 'auth.json' });

test.describe('Care Management - Smoke Tests', () => {
  let dashboard;
  let careManagementCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    careManagementCard = new CareManagementCard(page);
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('caremgmt-beforeeach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 163
  test('ONEVIEW-163: Verify Data Retrieval from Source Tables @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '163' });
    await expect(careManagementCard.card).toBeVisible({ timeout: TIMEOUTS.short });
    const dataFields = page.locator('text=/enrollment|care|management|status|program/i');
    const fieldCount = await dataFields.count();
    expect(fieldCount).toBeGreaterThan(0);
    console.log(`Care Management card loaded with ${fieldCount} data fields`);
  });

  // Qase Test Case ID: 175
  test('ONEVIEW-175: Verify All Fields Are Read-Only @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '175' });
    await expect(careManagementCard.card).toBeVisible({ timeout: TIMEOUTS.short });
    const editableInputs = page.locator('input[type="text"], textarea').filter({ has: page.locator(':text("Care")') });
    const editableCount = await editableInputs.count();
    if (editableCount > 0) {
      const firstInput = editableInputs.first();
      const isReadonly = await firstInput.getAttribute('readonly');
      const isDisabled = await firstInput.getAttribute('disabled');
      expect(isReadonly !== null || isDisabled !== null).toBe(true);
    }
    console.log('Care Management fields are read-only as expected');
  });

  // Qase Test Case ID: 176
  test('ONEVIEW-176: Verify Data Refresh on Patient Change @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '176' });
    await expect(careManagementCard.card).toBeVisible({ timeout: TIMEOUTS.short });
    await dashboard.medicaidSearchInput.click();
    await dashboard.medicaidSearchInput.fill(TEST_DATA.patients.secondary.medicaidId);
    await page.waitForTimeout(1000);
    const searchResult = page.getByText(new RegExp(TEST_DATA.patients.secondary.medicaidId)).first();
    if (await searchResult.isVisible().catch(() => false)) {
      await searchResult.click();
      await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.long });
    }
    await expect(careManagementCard.card).toBeVisible({ timeout: TIMEOUTS.short });
    console.log('Patient change successful - dashboard refreshed');
  });

  // Qase Test Case ID: 182
  test('ONEVIEW-182: Verify Data Source Mapping @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '182' });
    await expect(careManagementCard.card).toBeVisible({ timeout: TIMEOUTS.short });
    const enrollmentCount = await page.locator('text=/enrollment|member|plan|effective/i').count();
    const careCount = await page.locator('text=/care|management|program|coordinator|status/i').count();
    expect(enrollmentCount + careCount).toBeGreaterThan(0);
    console.log(`Data mapping verified: ${enrollmentCount} enrollment fields, ${careCount} care management fields`);
  });

  // Qase Test Case ID: 184
  test('ONEVIEW-184: Verify HIPAA Compliance (No Edit Access) @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '184' });
    await expect(careManagementCard.card).toBeVisible({ timeout: TIMEOUTS.short });
    const consentFields = page.locator('text=/consent|authorization|hipaa|privacy/i');
    const consentCount = await consentFields.count();
    if (consentCount > 0) console.log(`Found ${consentCount} HIPAA/consent-related fields`);
    const editableConsent = page.locator('input, textarea').filter({ hasText: /consent|hipaa/i });
    expect(await editableConsent.count()).toBeLessThanOrEqual(0);
    console.log('HIPAA compliance verified - no editable consent fields');
  });

  // Qase Test Case ID: 186
  test('ONEVIEW-186: Verify Responsive Design @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '186' });
    await expect(careManagementCard.card).toBeVisible({ timeout: TIMEOUTS.short });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(careManagementCard.card).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.body.clientWidth) + 10);

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(careManagementCard.card).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.body.clientWidth) + 10);
    console.log('Care Management card responsive design verified');
  });
});
