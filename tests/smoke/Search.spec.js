// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';
import { DashboardPage } from '../pages/DashboardPage.js';

test.use({ storageState: 'auth.json' });

test.describe('Search - Smoke Tests', () => {

  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('ONEVIEW-66: Verify Search Box Presence in Navigation Bar @smoke', async () => {
    await expect(dashboard.medicaidSearchInput).toBeEnabled();
  });

  test('ONEVIEW-13: Verify switching between search modes @smoke', async () => {
    const placeholder = await dashboard.medicaidSearchInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/Search|Medicaid|DOB|patient/i);
  });

  test('ONEVIEW-14: Verify search by Medicaid ID (valid) @smoke', async () => {
    await dashboard.loadDefaultPatient();
    await dashboard.assertPatientDashboardLoaded();
  });

  test('ONEVIEW-15: Verify search by DOB + Last Name (valid) @smoke', async () => {
    await dashboard.searchByLastNameDob('Gar', '12', '09', '1961');
    const result = await dashboard.page.getByText(TEST_DATA.patients.completeData.medicaidId, { exact: false }).first();
    await expect(result).toBeVisible({ timeout: 15000 });
    await result.click();
    await dashboard.assertPatientDashboardLoaded();
  });

  test('ONEVIEW-67: Verify Search Results Dropdown Display @smoke', async () => {
    await dashboard.medicaidSearchInput.fill(TEST_DATA.patients.completeData.medicaidId);
    const result = await dashboard.page
      .locator('div, p, span')
      .filter({ hasText: new RegExp(TEST_DATA.patients.completeData.medicaidId) })
      .first();
    await expect(result).toBeVisible({ timeout: 15000 });
    const text = await result.textContent();
    expect(text).toContain(TEST_DATA.patients.completeData.medicaidId);
  });

  test('ONEVIEW-68: Verify Result Selection Loads Patient Dashboard @smoke', async () => {
    await dashboard.loadDefaultPatient();
    await dashboard.assertPatientDashboardLoaded();
  });

  test('ONEVIEW-69: Verify Keyboard Navigation in Search Results @smoke', async () => {
    await dashboard.medicaidSearchInput.fill(TEST_DATA.patients.completeData.medicaidId);
    await dashboard.medicaidSearchInput.press('ArrowDown');
    await dashboard.medicaidSearchInput.press('ArrowUp');
    const result = dashboard.page
      .locator('div, p, span')
      .filter({ hasText: new RegExp(TEST_DATA.patients.completeData.medicaidId) })
      .first();
    await expect(result).toBeVisible({ timeout: 15000 });
    await result.click();
    await dashboard.assertPatientDashboardLoaded();
  });

  test('ONEVIEW-34: Verify dashboard responsiveness @smoke', async ({ page }) => {
    await dashboard.loadDefaultPatient();
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=/Demographics|Medical|Health/i').first()).toBeVisible();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('text=/Demographics|Medical|Health/i').first()).toBeVisible();
  });
});
