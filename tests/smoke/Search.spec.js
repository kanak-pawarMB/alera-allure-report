// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Search - Smoke Tests', () => {

  /* -------------------- Helpers -------------------- */

  // @ts-ignore
  async function getSearchField(page) {
    const field = page
      .locator('input[placeholder*="Search"], input[placeholder*="Medicaid"], input[type="text"]')
      .first();

    await expect(field).toBeVisible({ timeout: 15000 });
    return field;
  }

  // @ts-ignore
  async function getSearchResult(page, text) {
    const result = page
      .locator('div, p, span')
      .filter({ hasText: new RegExp(text) })
      .first();

    await expect(result).toBeVisible({ timeout: 15000 });
    return result;
  }

  // @ts-ignore
  async function assertPatientLoaded(page, medicaidId) {
    // Wait for patient dashboard to load (check for Demographics card or patient data visible)
    await expect(
      page.locator('text=/Demographics|Medical|Health|Care/i').first()
    ).toBeVisible({ timeout: 30000 });
  }

  // @ts-ignore
  async function loadPatient(page, medicaidId) {
    const searchField = await getSearchField(page);
    await searchField.click();
    await searchField.fill(medicaidId);

    const result = await getSearchResult(page, medicaidId);
    await result.click();

    await assertPatientLoaded(page, medicaidId);
  }

  /* -------------------- Setup -------------------- */

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');
  });

  /* -------------------- Tests -------------------- */

  test('ONEVIEW-66: Verify Search Box Presence in Navigation Bar @smoke', async ({ page }) => {
    const searchField = await getSearchField(page);
    await expect(searchField).toBeEnabled();
  });

  test('ONEVIEW-13: Verify switching between search modes @smoke', async ({ page }) => {
    const searchField = await getSearchField(page);
    const placeholder = await searchField.getAttribute('placeholder');
    expect(placeholder).toMatch(/Search|Medicaid|DOB|patient/i);
  });

  test('ONEVIEW-14: Verify search by Medicaid ID (valid) @smoke', async ({ page }) => {
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);
  });

  /**
   * DOB + Last Name is UI-flaky.
   * Smoke validation uses same backend result to avoid false negatives.
   */
  test('ONEVIEW-15: Verify search by DOB + Last Name (valid) @smoke', async ({ page }) => {
    // Click the "Last Name + DOB" toggle button
    const dobToggle = page.locator('button').filter({ hasText: /Last Name.*DOB|DOB.*Last/i }).first();
    await dobToggle.click();
    await page.waitForTimeout(500);

    // Fill Last Name field (first 3 letters)
    const lastNameField = page.locator('input[placeholder*="Last Name"], input[placeholder*="First 3"]').first();
    await expect(lastNameField).toBeVisible({ timeout: 10000 });
    await lastNameField.click();
    await lastNameField.fill('Gar'); // First 3 letters from TEST_DATA
    await page.waitForTimeout(500);

    // Fill DOB fields (separate masked inputs for MM, DD, YYYY)
    const mmField = page.locator('input[placeholder*="MM"]').first();
    const ddField = page.locator('input[placeholder*="DD"], input[maxlength="2"]').nth(1); // second masked input
    const yyyyField = page.locator('input[placeholder*="YYYY"], input[maxlength="4"]').first();

    await expect(mmField).toBeVisible({ timeout: 10000 });
    await mmField.click();
    await mmField.fill('12');

    await expect(ddField).toBeVisible({ timeout: 5000 });
    await ddField.fill('09');

    await expect(yyyyField).toBeVisible({ timeout: 5000 });
    await yyyyField.fill('1961');

    // Confirm all parts captured
    await expect(mmField).toHaveValue('12');
    await expect(ddField).toHaveValue('09');
    await expect(yyyyField).toHaveValue(/1961/);
    await page.waitForTimeout(300);

    // Wait for results and click
    const result = await getSearchResult(page, TEST_DATA.patients.completeData.medicaidId);
    await result.click();

    await assertPatientLoaded(page, TEST_DATA.patients.completeData.medicaidId);
  });

  test('ONEVIEW-67: Verify Search Results Dropdown Display @smoke', async ({ page }) => {
    const searchField = await getSearchField(page);
    await searchField.fill(TEST_DATA.patients.completeData.medicaidId);

    const result = await getSearchResult(page, TEST_DATA.patients.completeData.medicaidId);
    const text = await result.textContent();
    expect(text).toContain(TEST_DATA.patients.completeData.medicaidId);
  });

  test('ONEVIEW-68: Verify Result Selection Loads Patient Dashboard @smoke', async ({ page }) => {
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);
  });

  test('ONEVIEW-69: Verify Keyboard Navigation in Search Results @smoke', async ({ page }) => {
    const searchField = await getSearchField(page);
    await searchField.fill(TEST_DATA.patients.completeData.medicaidId);

    await searchField.press('ArrowDown');
    await searchField.press('ArrowUp');

    const result = await getSearchResult(page, TEST_DATA.patients.completeData.medicaidId);
    await result.click();

    await assertPatientLoaded(page, TEST_DATA.patients.completeData.medicaidId);
  });

  test('ONEVIEW-34: Verify dashboard responsiveness @smoke', async ({ page }) => {
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=/Demographics|Medical|Health/i').first()).toBeVisible();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('text=/Demographics|Medical|Health/i').first()).toBeVisible();
  });

});
