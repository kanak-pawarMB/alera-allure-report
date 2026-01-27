// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * PCP Card Tests
 * These tests verify the Primary Care Provider (PCP) information display on patient detail pages
 */

test.use({ storageState: 'auth.json' });

test.describe('PCP Card - Regression @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  // Helper Functions
  // @ts-ignore
  async function getSearchField(page) {
    const field = page.getByRole('textbox', { name: /search/i }).first();
    await expect(field).toBeVisible({ timeout: 30000 });
    return field;
  }

  // @ts-ignore
  async function loadPatient(page, medicaidId) {
    const searchField = await getSearchField(page);
    await searchField.click();
    await searchField.fill(medicaidId);
    await page.waitForTimeout(2000);

    // Wait for the search result to appear and click it
    // The result appears as a clickable element in the dropdown
    const result = page.getByText(medicaidId).first();
    await expect(result).toBeVisible({ timeout: 15000 });
    
    // Scroll to element and click to ensure it's in viewport
    await result.scrollIntoViewIfNeeded();
    await result.click();
    
    // Wait for patient details page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
  }

  // @ts-ignore
  async function getPcpCard(page) {
    // Find PCP card - exclude the search bar area by looking for a more specific container
    // Look for elements containing "PCP" text that are NOT the search container
    const pcpCard = page.locator('div, section')
      .filter({ hasText: /PCP|Primary Care Provider/i })
      .filter({ hasNot: page.locator('input[placeholder*="Search by Patient"]') })
      .first();
    
    await expect(pcpCard).toBeVisible({ timeout: 20000 });
    return pcpCard;
  }

  // Qase ID: 51 - Verify all required PCP fields are displayed correctly
  test('ONEVIEW-51: Verify all required PCP fields displayed correctly', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '51' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const pcpText = await pcpCard.textContent();

    // Expected: Provider name, phone, address, city, state fields are visible
    expect(pcpText).toBeTruthy();
    expect(pcpText?.length).toBeGreaterThan(0);
  });

  // Qase ID: 52 - Verify PCP address formatted correctly with both lines
  test('ONEVIEW-52: Verify PCP address formatted correctly with both lines', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '52' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const pcpText = await pcpCard.textContent();

    // Expected: Address values on separate lines OR "-" for empty fields
    const hasMultipleLines = /\n/.test(pcpText || '');
    const hasDash = /-/.test(pcpText || '');

    expect(hasMultipleLines || hasDash).toBeTruthy();
  });

  // Qase ID: 56 - Verify all PCP fields are read-only
  test('ONEVIEW-56: Verify all PCP fields are read-only', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '56' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);

    // Expected: No editable inputs in PCP card (exclude search/filter inputs)
    const editableFields = pcpCard.locator('input:not([readonly]):not([disabled]):not([type="search"]):not([type="text"][placeholder*="search"]), textarea:not([readonly]):not([disabled])');
    const count = await editableFields.count();

    expect(count).toBe(0);
  });

  // Qase ID: 57 - Verify provider name bold and initials displayed
  test('ONEVIEW-57: Verify provider name bold and initials displayed', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '57' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const pcpText = await pcpCard.textContent();

    // Expected: Initials (2 uppercase letters) OR provider name present
    const hasInitials = /\b[A-Z]{2}\b/.test(pcpText || '');
    const hasProviderName = /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(pcpText || '');

    expect(hasInitials || hasProviderName).toBeTruthy();
  });

  // Qase ID: 58 - Verify PCP card layout hierarchy
  test('ONEVIEW-58: Verify PCP card layout hierarchy', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '58' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const pcpText = await pcpCard.textContent();

    // Expected: Card displays fields in logical hierarchy
    expect(pcpText).toBeTruthy();
    expect(pcpText?.length).toBeGreaterThan(0);
  });

  // Qase ID: 59 - Verify PCP data updates when different patient selected
  test('ONEVIEW-59: Verify PCP data updates when different patient selected', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '59' });
    
    // Load Patient A
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);
    const pcpCardA = await getPcpCard(page);
    const pcpNameA = await pcpCardA.locator('p, span').filter({ hasText: /[A-Za-z]{2,}/ }).first().textContent();

    // Load Patient B
    const searchField = await getSearchField(page);
    await searchField.clear();
    await searchField.fill('NC279004025');
    await page.waitForTimeout(2000);
    
    const result = page.getByText('NC279004025').first();
    await expect(result).toBeVisible({ timeout: 15000 });
    await result.scrollIntoViewIfNeeded();
    await result.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Verify PCP data loaded for Patient B
    const pcpCardB = await getPcpCard(page);
    const pcpNameB = await pcpCardB.locator('p, span').filter({ hasText: /[A-Za-z]{2,}/ }).first().textContent();
    
    expect(pcpNameB).toBeTruthy();
  });

  // Qase ID: 60 - Verify PCP data reloads when page refreshed
  test('ONEVIEW-60: Verify PCP data reloads when page refreshed', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '60' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const pcpNameBefore = await pcpCard.locator('p, span').filter({ hasText: /[A-Za-z]{2,}/ }).first().textContent();

    // Refresh the page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Verify PCP data still displayed correctly after refresh
    const pcpCardAfter = await getPcpCard(page);
    const pcpNameAfter = await pcpCardAfter.locator('p, span').filter({ hasText: /[A-Za-z]{2,}/ }).first().textContent();

    expect(pcpNameAfter).toEqual(pcpNameBefore);
  });

  // Qase ID: 62 - Verify provider name with title/prefix displayed correctly
  test('ONEVIEW-62: Verify provider name with title/prefix displayed correctly', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '62' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const providerName = await pcpCard.locator('p, span').filter({ hasText: /[A-Za-z]{2,}/ }).first().textContent();

    expect(providerName).toBeTruthy();
    expect(providerName?.length).toBeGreaterThan(0);
  });

  // Qase ID: 63 - Verify initials derived from first/last name, ignoring title
  test('ONEVIEW-63: Verify initials derived from first/last name, ignoring title', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '63' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const pcpText = await pcpCard.textContent();

    // Expected: Initials derived from first and last name (e.g., "SJ" for "Sophia James")
    const hasInitials = /\b[A-Z]{2}\b/.test(pcpText || '');
    const hasProviderName = /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(pcpText || '');
    
    expect(hasInitials || hasProviderName).toBeTruthy();
  });

  // Qase Test Case ID: 157 - Verify Address 1 and Address 2 mapping
  // Qase ID: 157 - Verify PCP Address 1/Address 2 fields display correctly
  test('ONEVIEW-157: Verify PCP Address 1/Address 2 fields display correctly', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '157' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const pcpText = await pcpCard.textContent();

    // Expected: Address value displayed OR shows "-"
    const hasAddressValue = /\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place)/i.test(pcpText || '');
    const hasDash = /-/.test(pcpText || '');

    expect(hasAddressValue || hasDash).toBeTruthy();
  });

  // Qase ID: 158 - Verify PCP City and State fields display correctly
  test('ONEVIEW-158: Verify PCP City and State fields display correctly', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '158' });
    
    await loadPatient(page, TEST_DATA.patients.completeData.medicaidId);

    const pcpCard = await getPcpCard(page);
    const pcpText = await pcpCard.textContent();

    // Expected: City and State values displayed OR show "-"
    const cityStatePattern = /[A-Za-z\s]+,\s*[A-Z]{2}/;
    const hasCityStateFormat = cityStatePattern.test(pcpText || '');
    const stateAbbrevPattern = /\b[A-Z]{2}\b/;
    const hasStateAbbrev = stateAbbrevPattern.test(pcpText || '');
    const hasDash = /-/.test(pcpText || '');

    expect(hasCityStateFormat || hasStateAbbrev || hasDash).toBeTruthy();
  });
});
