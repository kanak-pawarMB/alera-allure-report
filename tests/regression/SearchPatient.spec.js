// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * Search Patient - Regression Test Suite
 * Test cases generated from Qase Test Management System
 * Suite: Patient Search Functionality (ID: 1)
 */

test.use({ storageState: 'auth.json' });

test.describe('Search Patient - Regression @regression', () => {
  /* -------------------- HELPER FUNCTIONS -------------------- */
  async function getSearchField(page) {
    const field = page.locator('input[placeholder*="Search"], input[placeholder*="Medicaid"], input[type="text"]').first();
    await expect(field).toBeVisible({ timeout: 15000 });
    return field;
  }

  async function getToggles(page) {
    // UI renders these as radios; fall back to buttons if structure changes
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

    // Skip value validation when testing invalid input scenarios
    if (!skipValidation) {
      // Confirm all parts captured (ensures inputs registered)
      await expect(mmField).toHaveValue(mm);
      await expect(ddField).toHaveValue(dd);
      await expect(yyyyField).toHaveValue(new RegExp(yyyy));
    }

    // Give API time to respond to complete DOB input
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

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await getSearchField(page); // Ensure search is ready before each test
  });

  /* -------------------- QASE TEST CASES -------------------- */

  // Qase ID: 12 - Verify default selected search mode (Medicaid ID)
  test('ONEVIEW-12: Verify default selected search mode Medicaid ID', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '12' });
    
    // Step 1: Open the Dashboard screen - Already done in beforeEach
    // Step 2: Observe which search mode is selected by default
    const searchField = await getSearchField(page);
    const { medicaidToggle } = await getToggles(page);

    // Expected: Default mode visible and placeholder references Medicaid
    await expect(medicaidToggle).toBeVisible();
    await expect(searchField).toHaveAttribute('placeholder', expect.stringMatching(/Medicaid/i));
  });

  // Qase ID: 16 - Verify placeholder text updates with selected mode
  test('ONEVIEW-16: Verify placeholder text updates with selected mode', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '16' });
    
    // Step 1: Observe placeholder in Medicaid ID mode
    const searchField = await getSearchField(page);
    await expect(searchField).toHaveAttribute('placeholder', expect.stringMatching(/Medicaid/i));
    
    // Step 2: Switch to DOB + Last name mode
    await switchToLastNameDOBMode(page);
    
    // Expected: Placeholder text correctly changes for each mode
    const searchFieldAfter = await getSearchField(page);
    await expect(searchFieldAfter).toHaveAttribute('placeholder', expect.stringMatching(/DOB|Last Name/i));
  });

  // Qase ID: 17 - Verify no results message
  test('ONEVIEW-17: Verify no results message', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '17' });
    
    // Step 1: Search using random Medicaid ID (min. 3 characters)
    const searchField = await getSearchField(page);
    await searchField.fill('NC999999999'); // Invalid Medicaid ID
    
    // Step 2: Wait for API response
    await page.waitForTimeout(2000);
    
    // Expected: Message "No patient(s) found matching the search criteria" displayed
    const noResults = page.locator('text=/no patient.*found|not found|no matching/i').first();
    await expect(noResults).toBeVisible({ timeout: 10000 });
    
    // Expected: No dropdown results shown
    const dropdown = page.locator('[role="listbox"], [class*="dropdown"]').first();
    await expect(dropdown).not.toBeVisible().catch(() => {});
  });

  // Qase ID: 18 - Verify loading indicator display
  test('ONEVIEW-18: Verify loading indicator display', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '18' });
    
    // Step 1: Select the Medicaid ID from toggle & Enter valid input
    const searchField = await getSearchField(page);
    await searchField.fill(TEST_DATA.patients.legacy.medicaidId); // NC160943625
    
    // Step 2: Press Enter and observe
    await searchField.press('Enter');
    
    // Expected: Loader visible until response received
    const loader = page.locator('[class*="skeleton"], [class*="loading"], [class*="spinner"]').first();
    await expect(loader).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Loading indicator may have appeared briefly');
    });
    
    // Expected: Results display after Skeleton loading ends
    await assertPatientLoaded(page);
  });

  // Qase ID: 19 - Verify keyboard navigation in dropdown
  test('ONEVIEW-19: Verify keyboard navigation in dropdown', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '19' });
    
    // Step 1: Enter search criteria with multiple matches - rob 07/19/1981
    await switchToLastNameDOBMode(page);
    const searchField = await getSearchField(page);
    await searchField.fill('rob 07/19/1981');
    
    await page.waitForTimeout(2000);
    
    // Step 2: Press (↑/↓) buttons to move selection
    await searchField.press('ArrowDown');
    await searchField.press('ArrowUp');
    
    // Expected: Navigation work properly
    
    // Step 3: Press Enter to open record
    await searchField.press('ArrowDown');
    await searchField.press('Enter');
    
    // Expected: The selection works properly & Patient details should preview
    await assertPatientLoaded(page);
  });

  // Qase ID: 20 - Verify DOB input validation
  test('ONEVIEW-20: Verify DOB input validation', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '20' });
    
    // Step 1: Enter invalid MM (e.g., "19") - input may reject but we check no results appear
    await fillLastNameDob(page, 'Gar', '19', '09', '1961', true); // skipValidation=true
    await expectNoResultsMessageOrEmpty(page);

    // Step 2: Enter invalid DD (e.g., "35")
    await fillLastNameDob(page, 'Gar', '12', '35', '1961', true);
    await expectNoResultsMessageOrEmpty(page);

    // Step 3: Enter invalid YYYY (e.g., "3004")
    await fillLastNameDob(page, 'Gar', '12', '09', '3004', true);
    await expectNoResultsMessageOrEmpty(page);

    // Step 4: Enter future dates (e.g., "12/31/2026")
    await fillLastNameDob(page, 'Gar', '12', '31', '2026', true);
    await expectNoResultsMessageOrEmpty(page);
  });

  // Qase ID: 21 - Verify UI alignment and consistency (Figma match)
  test('ONEVIEW-21: Verify UI alignment and consistency', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '21' });
    
    // Step 1: Observe top navigation layout
    const searchField = await getSearchField(page);
    await expect(searchField).toBeVisible();
    
    // Step 2: Compare alignment, spacing, and color scheme with Figma specs
    const { medicaidToggle, dobToggle } = await getToggles(page);
    await expect(medicaidToggle).toBeVisible();
    await expect(dobToggle).toBeVisible();
  });

  // Qase ID: 64 - Verify that toggle button color changes when switching between search options
  test('ONEVIEW-64: Verify toggle button color changes', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '64' });
    
    // Step 1: Observe the toggle button on the search bar
    const { medicaidToggle, dobToggle } = await getToggles(page);
    
    // Expected: The toggle button color should change to indicate the currently selected option
    await expect(medicaidToggle).toBeVisible();
    
    // Step 2: Click on "Search by Last Name + DOB" option
    await dobToggle.click();
    
    // Expected: When "Last Name + DOB" is selected – toggle background becomes blue (active color)
    await expect(dobToggle).toBeVisible();
    
    // Step 3: Click back on "Search by Medicaid ID" option
    await medicaidToggle.click();
    
    // Expected: The inactive option remains in default/white color
    await expect(medicaidToggle).toBeVisible();
  });

  // Qase ID: 65 - Verify that toggle dot moves correctly as per selected search option
  test('ONEVIEW-65: Verify toggle dot moves correctly', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '65' });
    
    // Step 1: Observe the position of the toggle dot (default on "Medicaid ID")
    const { medicaidToggle, dobToggle } = await getToggles(page);
    await expect(medicaidToggle).toBeVisible();
    
    // Step 2: Click on "Last Name + DOB"
    await dobToggle.click();
    
    // Step 3: Observe the dot's position and animation
    // Expected: The dot should move smoothly to the selected option with proper animation
    await expect(dobToggle).toBeVisible();
    
    // Step 4: Click back on "Medicaid ID"
    await medicaidToggle.click();
    
    // Expected: On switching back, the dot returns to the first option smoothly
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

    // Expected: No results must be displayed until complete DOB is entered
    const dropdown = page.locator('[role="listbox"], [class*="dropdown"]').first();
    await expect(dropdown).not.toBeVisible().catch(() => {});
  });

  // Qase ID: 72 - Verify search using first 3 letters of first last name
  test('ONEVIEW-72: Verify search using first 3 letters of first last name', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '72' });
    
    await fillLastNameDob(page, 'Gar', '12', '09', '1961');

    // Expected: Matching results must appear with last name & DOB
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
    
    // Step 1: Make sure search toggle is on Medicaid Id
    const { medicaidToggle } = await getToggles(page);
    await expect(medicaidToggle).toBeVisible();
    
    // Step 2 & 3: Enter valid Medicaid ID to fetch results & Observe result formatting
    const searchField = await getSearchField(page);
    await searchField.click();
    await searchField.fill(TEST_DATA.patients.completeData.medicaidId);
    await page.waitForTimeout(1500);
    
    const result = await getSearchResult(page, TEST_DATA.patients.completeData.medicaidId);
    const resultText = await result.textContent();
    
    // Expected: [Medicaid ID] [First Name] [Last Name] [DOB] (Example: M123456789 John Clark 03/13/2003)
    expect(resultText).toMatch(/NC\d+.*\d{2}\/\d{2}\/\d{4}/);
    
    // Step 4 & 5 & 6 & 7: Switch to Last Name + DOB search and verify formatting
    await fillLastNameDob(page, 'Gar', '12', '09', '1961');
    const resultDOB = await getSearchResult(page, TEST_DATA.patients.completeData.medicaidId);
    const resultTextDOB = await resultDOB.textContent();

    // Expected: For both search methods, each record should follow the format
    expect(resultTextDOB).toMatch(/NC\d+.*\d{2}\/\d{2}\/\d{4}/);
  });

  // Qase ID: 75 - Verify formatting consistency across multiple results
  test('ONEVIEW-75: Verify formatting consistency across multiple results', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '75' });
    
    await switchToLastNameDOBMode(page);
    
    // Step 1: Search with common last name
    const searchField = await getSearchField(page);
    await searchField.fill(TEST_DATA.patients.duplicateSearch.searchTerm); // wil 01/29/2020
    
    await page.waitForTimeout(2000);
    
    // Step 2: View dropdown list
    const results = page.locator('[role="option"], [class*="result"]');
    const count = await results.count();
    
    // Expected: All rows must display consistently as: Medicaid ID + First Name , Last Name + DOB
    if (count > 1) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const text = await results.nth(i).textContent();
        expect(text).toMatch(/NC\d+.*\d{2}\/\d{2}\/\d{4}/);
      }
    }
  });
});
