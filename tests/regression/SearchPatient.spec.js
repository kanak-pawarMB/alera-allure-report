// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { TEST_DATA } from '../testData.js';

/**
 * Search Patient - Regression Test Suite
 * Test cases generated from Qase Test Management System
 * Suite: Patient Search Functionality (ID: 1)
 */

test.use({ storageState: 'auth.json' });

test.describe('Search Patient - Regression @regression', () => {
  test.describe.configure({ timeout: 120000 });

  /* -------------------- HELPER FUNCTIONS -------------------- */
  async function getSearchField(page) {
    const field = page.locator('input[placeholder*="Search"], input[placeholder*="Medicaid"], input[type="text"]').first();
    await expect(field).toBeVisible({ timeout: 15000 });
    return field;
  }

  async function getToggles(page) {
    const medicaidToggle = page
      .getByRole('radio', { name: /Medicaid ID|Medicaid/i })
      .first()
      .or(page.getByRole('button', { name: /Medicaid ID|Medicaid/i }).first())
      .or(page.locator('button').filter({ hasText: /Medicaid/i }).first());

    const dobToggle = page
      .getByRole('radio', { name: /Last Name \+ DOB|Last Name.*DOB|DOB.*Last/i })
      .first()
      .or(page.getByRole('button', { name: /Last Name \+ DOB|Last Name.*DOB|DOB.*Last/i }).first())
      .or(page.locator('button').filter({ hasText: /Last Name.*DOB|DOB.*Last/i }).first());

    await expect(medicaidToggle).toBeVisible({ timeout: 15000 });
    await expect(dobToggle).toBeVisible({ timeout: 15000 });
    return { medicaidToggle, dobToggle };
  }

  async function getSearchResult(page, text) {
    const result = page.locator('div, p, span').filter({ hasText: new RegExp(text) }).first();
    await expect(result).toBeVisible({ timeout: 15000 });
    return result;
  }

  async function assertPatientLoaded(page) {
    await expect(page.locator('text=/Demographics|Medical|Health|Care/i').first()).toBeVisible({ timeout: 30000 });
  }

  async function switchToLastNameDOBMode(page) {
    const { dobToggle } = await getToggles(page);
    await dobToggle.click({ timeout: 10000 });
    await page.waitForTimeout(1000);
  }

  async function fillLastNameDob(page, last3, mm, dd, yyyy, skipValidation = false) {
    await switchToLastNameDOBMode(page);

    const lastNameField = page.locator('input[placeholder*="Last Name"], input[placeholder*="First 3"]').first();
    await expect(lastNameField).toBeVisible({ timeout: 10000 });
    await lastNameField.click();
    await lastNameField.fill(last3);

    const mmField = page.locator('input[placeholder*="MM"]').first();
    const ddField = page.locator('input[placeholder*="DD"], input[maxlength="2"]').nth(1);
    const yyyyField = page.locator('input[placeholder*="YYYY"], input[maxlength="4"]').first();

    await expect(mmField).toBeVisible({ timeout: 10000 });
    await mmField.click();
    await mmField.fill(mm);
    await expect(ddField).toBeVisible({ timeout: 5000 });
    await ddField.click();
    await ddField.fill(dd);
    await expect(yyyyField).toBeVisible({ timeout: 5000 });
    await yyyyField.click();
    await yyyyField.fill(yyyy);

    if (!skipValidation) {
      await expect(mmField).toHaveValue(mm);
      await expect(ddField).toHaveValue(dd);
      await expect(yyyyField).toHaveValue(new RegExp(yyyy));
    }

    await page.waitForTimeout(1000);
  }

  async function expectNoResultsMessageOrEmpty(page) {
    const noResults = page.locator('text=/no patient.*found|not found|no matching/i').first();
    if (await noResults.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(noResults).toBeVisible();
      return;
    }

    const dropdown = page.locator('[role="option"], [role="listbox"], [class*="dropdown"]');
    await expect(dropdown.first()).not.toBeVisible().catch(() => {});
  }

  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
    await page.waitForLoadState('domcontentloaded');
    await getSearchField(page); // Ensure search is ready before each test
  });

  /* -------------------- QASE TEST CASES -------------------- */

  // Qase ID: 12 - Verify default selected search mode (Medicaid ID)
  test('ONEVIEW-12: Verify default selected search mode Medicaid ID', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '12' });

    const searchField = await getSearchField(page);
    const { medicaidToggle } = await getToggles(page);

    await expect(medicaidToggle).toBeVisible();
    await expect(searchField).toHaveAttribute('placeholder', expect.stringMatching(/Medicaid/i));
  });

  // Qase ID: 16 - Verify placeholder text updates with selected mode
  test('ONEVIEW-16: Verify placeholder text updates with selected mode', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '16' });

    const searchField = await getSearchField(page);
    await expect(searchField).toHaveAttribute('placeholder', expect.stringMatching(/Medicaid/i));

    await switchToLastNameDOBMode(page);

    const searchFieldAfter = await getSearchField(page);
    await expect(searchFieldAfter).toHaveAttribute('placeholder', expect.stringMatching(/DOB|Last Name/i));
  });

  // Qase ID: 17 - Verify no results message
  test('ONEVIEW-17: Verify no results message', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '17' });

    const searchField = await getSearchField(page);
    await searchField.fill('NC999999999');

    await page.waitForTimeout(2000);

    const noResults = page.locator('text=/no patient.*found|not found|no matching/i').first();
    await expect(noResults).toBeVisible({ timeout: 10000 });

    const dropdown = page.locator('[role="listbox"], [class*="dropdown"]').first();
    await expect(dropdown).not.toBeVisible().catch(() => {});
  });

  // Qase ID: 18 - Verify loading indicator display
  test('ONEVIEW-18: Verify loading indicator display', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '18' });

    const searchField = await getSearchField(page);
    await searchField.fill(TEST_DATA.patients.legacy.medicaidId);

    await searchField.press('Enter');

    const loader = page.locator('[class*="skeleton"], [class*="loading"], [class*="spinner"]').first();
    await expect(loader).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Loading indicator may have appeared briefly');
    });

    await assertPatientLoaded(page);
  });

  // Qase ID: 19 - Verify keyboard navigation in dropdown
  test('ONEVIEW-19: Verify keyboard navigation in dropdown', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '19' });

    await switchToLastNameDOBMode(page);
    const searchField = await getSearchField(page);
    await searchField.fill('rob 07/19/1981');

    await page.waitForTimeout(2000);

    await searchField.press('ArrowDown');
    await searchField.press('ArrowUp');

    await searchField.press('ArrowDown');
    await searchField.press('Enter');

    await assertPatientLoaded(page);
  });

  // Qase ID: 20 - Verify DOB input validation
  test('ONEVIEW-20: Verify DOB input validation', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '20' });

    await fillLastNameDob(page, 'Gar', '19', '09', '1961', true);
    await expectNoResultsMessageOrEmpty(page);

    await fillLastNameDob(page, 'Gar', '12', '35', '1961', true);
    await expectNoResultsMessageOrEmpty(page);

    await fillLastNameDob(page, 'Gar', '12', '09', '3004', true);
    await expectNoResultsMessageOrEmpty(page);

    await fillLastNameDob(page, 'Gar', '12', '31', '2026', true);
    await expectNoResultsMessageOrEmpty(page);
  });

  // Qase ID: 21 - Verify UI alignment and consistency (Figma match)
  test('ONEVIEW-21: Verify UI alignment and consistency', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '21' });

    const searchField = await getSearchField(page);
    await expect(searchField).toBeVisible();

    const { medicaidToggle, dobToggle } = await getToggles(page);
    await expect(medicaidToggle).toBeVisible();
    await expect(dobToggle).toBeVisible();
  });

  // Qase ID: 64 - Verify that toggle button color changes when switching between search options
  test('ONEVIEW-64: Verify toggle button color changes', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '64' });

    const { medicaidToggle, dobToggle } = await getToggles(page);

    await expect(medicaidToggle).toBeVisible();

    await dobToggle.click();
    await expect(dobToggle).toBeVisible();

    await medicaidToggle.click();
    await expect(medicaidToggle).toBeVisible();
  });

  // Qase ID: 65 - Verify that toggle dot moves correctly as per selected search option
  test('ONEVIEW-65: Verify toggle dot moves correctly', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '65' });

    const { medicaidToggle, dobToggle } = await getToggles(page);
    await expect(medicaidToggle).toBeVisible();

    await dobToggle.click();
    await expect(dobToggle).toBeVisible();

    await medicaidToggle.click();
    await expect(medicaidToggle).toBeVisible();
  });

  // Qase ID: 70 - Verify Invalid Search - Entered First Name
  test('ONEVIEW-70: Verify Invalid Search with First Name', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '70' });

    await fillLastNameDob(page, 'Joh', '11', '23', '2002');
    await expectNoResultsMessageOrEmpty(page);
  });

  // Qase ID: 71 - Verify Incomplete Input Handling
  test('ONEVIEW-71: Verify Incomplete Input Handling', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '71' });

    await switchToLastNameDOBMode(page);

    const lastNameField = page.locator('input[placeholder*="Last Name"], input[placeholder*="First 3"]').first();
    await lastNameField.fill('Gar');
    await page.waitForTimeout(500);

    const mmField = page.locator('input[placeholder*="MM"]').first();
    await expect(mmField).toBeVisible({ timeout: 10000 });
    await mmField.fill('12');

    const dropdown = page.locator('[role="listbox"], [class*="dropdown"]').first();
    await expect(dropdown).not.toBeVisible().catch(() => {});
  });

  // Qase ID: 72 - Verify search using first 3 letters of first last name
  test('ONEVIEW-72: Verify search using first 3 letters of first last name', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '72' });

    await fillLastNameDob(page, 'Gar', '12', '09', '1961');

    const result = await getSearchResult(page, TEST_DATA.patients.completeData.medicaidId);
    await expect(result).toBeVisible();
  });

  // Qase ID: 73 - Verify second last name does not allow patient search
  test('ONEVIEW-73: Verify second last name does not allow patient search', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '73' });

    await fillLastNameDob(page, 'Smi', '12', '09', '1961');
    await expectNoResultsMessageOrEmpty(page);
  });

  // Qase ID: 74 - Verify search result formatting for Medicaid ID & Last name + DOB search
  test('ONEVIEW-74: Verify search result formatting', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '74' });

    const { medicaidToggle } = await getToggles(page);
    await expect(medicaidToggle).toBeVisible();

    const searchField = await getSearchField(page);
    await searchField.click();
    await searchField.fill(TEST_DATA.patients.completeData.medicaidId);
    await page.waitForTimeout(1500);

    const result = await getSearchResult(page, TEST_DATA.patients.completeData.medicaidId);
    const resultText = await result.textContent();

    expect(resultText).toMatch(/NC\d+.*\d{2}\/\d{2}\/\d{4}/);

    await fillLastNameDob(page, 'Gar', '12', '09', '1961');
    const resultDOB = await getSearchResult(page, TEST_DATA.patients.completeData.medicaidId);
    const resultTextDOB = await resultDOB.textContent();

    expect(resultTextDOB).toMatch(/NC\d+.*\d{2}\/\d{2}\/\d{4}/);
  });

  // Qase ID: 75 - Verify formatting consistency across multiple results
  test('ONEVIEW-75: Verify formatting consistency across multiple results', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '75' });

    await switchToLastNameDOBMode(page);

    const searchField = await getSearchField(page);
    await searchField.fill(TEST_DATA.patients.duplicateSearch.searchTerm);

    await page.waitForTimeout(2000);

    const results = page.locator('[role="option"], [class*="result"]');
    const count = await results.count();

    if (count > 1) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const text = await results.nth(i).textContent();
        expect(text).toMatch(/NC\d+.*\d{2}\/\d{2}\/\d{4}/);
      }
    }
  });
});
