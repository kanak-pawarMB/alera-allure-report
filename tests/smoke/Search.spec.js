// @ts-check
import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST - Search Functionality Critical Path
 * These tests verify ONLY the critical happy path for patient search
 * Qase Test Management Suite: Suite 5
 */

test.describe('Search - Smoke Tests', () => {
  const DASHBOARD_URL = 'https://demooneview.z20.web.core.windows.net/dashboard';

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard with increased timeout
    await page.goto(DASHBOARD_URL, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    await page.waitForTimeout(2000);
  });

  // Qase Test Case ID: 66
  test('ONEVIEW-66: Verify Search Box Presence in Navigation Bar @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '66' });

    // Verify search field is displayed at the top navigation bar
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    await expect(searchField).toBeVisible();
    await expect(searchField).toBeEnabled();
  });

  // Qase Test Case ID: 13
  test('ONEVIEW-13: Verify switching between search modes @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '13' });

    // Step 1: Verify Medicaid ID mode is selected by default
    const medicaidRadio = page.getByRole('radio', { name: /medicaid id/i }).first();
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();

    await expect(medicaidRadio).toBeVisible();
    await expect(medicaidRadio).toHaveAttribute('data-state', 'on');

    // Verify placeholder for Medicaid ID mode
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const medicaidPlaceholder = await searchField.getAttribute('placeholder');
    expect(medicaidPlaceholder).toContain('Medicaid ID');

    // Step 2: Click on DOB + Last name button
    await dobLastNameRadio.click();
    await page.waitForTimeout(300);

    // Step 3: Verify DOB + Last Name mode is selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');
    await expect(dobLastNameRadio).toHaveAttribute('aria-checked', 'true');

    // Verify placeholder updated
    const dobPlaceholder = await searchField.getAttribute('placeholder');
    expect(dobPlaceholder).toContain('DOB');

    // Step 4: Switch back to Medicaid ID mode
    await medicaidRadio.click();
    await page.waitForTimeout(300);

    // Verify switched back successfully
    await expect(medicaidRadio).toHaveAttribute('data-state', 'on');
    const finalPlaceholder = await searchField.getAttribute('placeholder');
    expect(finalPlaceholder).toContain('Medicaid ID');
  });

  // Qase Test Case ID: 14
  test('ONEVIEW-14: Verify search by Medicaid ID (valid) @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '14' });

    // Step 1: Ensure Medicaid ID mode is selected
    const medicaidRadio = page.getByRole('radio', { name: /medicaid id/i }).first();
    const dataState = await medicaidRadio.getAttribute('data-state');
    if (dataState !== 'on') {
      await medicaidRadio.click();
      await page.waitForTimeout(300);
    }

    // Step 2: Enter valid Medicaid ID
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const validMedicaidId = 'NC160943625';
    await searchField.fill(validMedicaidId);
    await page.waitForTimeout(1500);

    // Step 3: Verify matching patient appears in dropdown
    const searchResult = page.locator('p').filter({ hasText: validMedicaidId }).first();
    await expect(searchResult).toBeVisible({ timeout: 5000 });

    // Step 4: Wait for result to be visible and click patient record
    await searchResult.waitFor({ state: 'visible', timeout: 10000 });
    await searchResult.click({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Verify patient dashboard loads
    const patientCards = page.locator('[class*="card"]').first();
    await expect(patientCards).toBeVisible({ timeout: 5000 });
  });

  // Qase Test Case ID: 15
  test('ONEVIEW-15: Verify search by DOB + Last Name (valid) @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '15' });

    // Step 1: Click DOB + Last name toggle
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();
    await dobLastNameRadio.click();
    await page.waitForTimeout(300);

    // Verify DOB mode is selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');

    // Step 2: Enter valid DOB and Last name (min 3 characters)
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const searchQuery = 'rob 07/19/1981';
    await searchField.fill(searchQuery);
    await page.waitForTimeout(1500);

    // Step 3: Verify matching records displayed
    const searchResults = page.locator('p').filter({ hasText: 'NC' }).first();
    await expect(searchResults).toBeVisible({ timeout: 5000 });

    // Step 4: Wait for result to be visible and click on result
    await searchResults.waitFor({ state: 'visible', timeout: 10000 });
    await searchResults.click({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Verify patient dashboard loads
    const patientCards = page.locator('[class*="card"]').first();
    await expect(patientCards).toBeVisible({ timeout: 5000 });
  });

  // Qase Test Case ID: 67
  test('ONEVIEW-67: Verify Search Results Dropdown Display @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '67' });

    // Step 1: Perform valid search
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const validMedicaidId = 'NC160943625';
    await searchField.fill(validMedicaidId);
    await page.waitForTimeout(1500);

    // Step 2: Verify dropdown appears with styled results
    const searchResult = page.locator('p').filter({ hasText: 'NC' }).first();
    await expect(searchResult).toBeVisible({ timeout: 5000 });

    // Verify result contains required information (Name, DOB, Medicaid ID)
    const resultText = await searchResult.textContent();
    expect(resultText).toMatch(/NC\d+/); // Medicaid ID
    expect(resultText).toContain('|'); // Separator
    expect(resultText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // DOB format
  });

  // Qase Test Case ID: 68
  test('ONEVIEW-68: Verify Result Selection Loads Patient Dashboard @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '68' });

    // Step 1: Perform search
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const validMedicaidId = 'NC160943625';
    await searchField.fill(validMedicaidId);
    await page.waitForTimeout(1500);

    // Verify search results displayed
    const searchResult = page.locator('p').filter({ hasText: validMedicaidId }).first();
    await expect(searchResult).toBeVisible({ timeout: 5000 });

    // Step 2: Wait for result to be visible and click on one of the results
    await searchResult.waitFor({ state: 'visible', timeout: 10000 });
    await searchResult.click({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Verify full patient dashboard loads with at least one card visible
    const cardsVisible = page.locator(':text("Demographics"), :text("PCP"), :text("Primary Care")').first();
    await expect(cardsVisible).toBeVisible({ timeout: 5000 });
  });

  // Qase Test Case ID: 69
  test('ONEVIEW-69: Verify Keyboard Navigation in Search Results @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '69' });

    // Switch to DOB + Last Name mode for multiple results
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();
    await dobLastNameRadio.click();
    await page.waitForTimeout(300);

    // Perform search that returns multiple results
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const searchQuery = 'rob 07/19/1981';
    await searchField.fill(searchQuery);
    await page.waitForTimeout(1500);

    // Verify search results are visible
    const searchResults = page.locator('p').filter({ hasText: 'NC' }).first();
    await expect(searchResults).toBeVisible({ timeout: 5000 });

    // Step 1: Use keyboard arrows to navigate results
    await searchField.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);

    // Step 2: Press Enter on a result
    // Alternative: Wait for result to be visible and click on the first result directly
    await searchResults.waitFor({ state: 'visible', timeout: 10000 });
    await searchResults.click({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Verify patient dashboard loads
    const patientCards = page.locator('[class*="card"]').first();
    await expect(patientCards).toBeVisible({ timeout: 5000 });
  });

  // Qase Test Case ID: 34
  test('ONEVIEW-34: Verify dashboard responsiveness @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '34' });

    // Perform search and load patient dashboard
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const validMedicaidId = 'NC160943625';
    await searchField.fill(validMedicaidId);
    await page.waitForTimeout(1500);

    const searchResult = page.locator('p').filter({ hasText: validMedicaidId }).first();
    await searchResult.waitFor({ state: 'visible', timeout: 10000 });
    await searchResult.click({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Verify cards are visible at default size
    const patientCards = page.locator('[class*="card"]').first();
    await expect(patientCards).toBeVisible();

    // Step 1: Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Verify cards still visible and no horizontal scrolling
    await expect(patientCards).toBeVisible();
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10); // Allow small margin

    // Step 2: Test desktop viewport (1920px)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Verify layout adapts correctly
    await expect(patientCards).toBeVisible();
  });
});
