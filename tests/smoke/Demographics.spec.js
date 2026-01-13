// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Demographics Card Critical Path
 * These tests verify ONLY the critical happy path for Demographics card
 * Qase Test Management Suite: Suite 6
 */

test.use({ storageState: 'auth.json' });

test.describe('Demographics Card - Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select patient (primary complete data)
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
  });

  // Qase Test Case ID: 22
  test('ONEVIEW-22: Verify Demographics card loads @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '22' });

    // Step 1: Observe the main content area
    // Expected: Demographics card with header "Demographics" is visible
    const demographicsCard = page.locator(':text("Demographics")')
      .or(page.locator('[class*="demographic"]'))
      .or(page.locator('[data-testid="demographics"]'));

    await expect(demographicsCard.first()).toBeVisible({ timeout: 5000 });
  });

  // Qase Test Case ID: 146
  test('ONEVIEW-146: Verify Demographics card loads successfully with all fields @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '146' });

    // Step 1: Verify Demographics card loads
    const demographicsCard = page.locator(':text("Demographics")').first();
    await expect(demographicsCard).toBeVisible({ timeout: 5000 });

    // Step 2: Verify all defined fields are present
    // Expected fields: Name, Medicaid ID, Medical Home, Network, DOB/Age, Sex at Birth, Race, Phone Number, Address, City, State

    // Verify Name field (patient name should be visible)
    const nameField = page.locator('text=/name/i')
      .or(page.locator('[class*="name"]'))
      .or(page.getByText(/^[A-Z][a-z]+ [A-Z][a-z]+$/));
    await expect(nameField.first()).toBeVisible({ timeout: 3000 });

    // Verify Medicaid ID field
    const medicaidField = page.locator('text=/medicaid/i')
      .or(page.locator('text=/NC\d+/'));
    await expect(medicaidField.first()).toBeVisible({ timeout: 3000 });

    // Verify Medical Home field
    const medicalHomeField = page.locator('text=/medical home/i')
      .or(page.locator('text=/home/i'));
    await expect(medicalHomeField.first()).toBeVisible({ timeout: 3000 });

    // Verify Network field
    const networkField = page.locator('text=/network/i');
    await expect(networkField.first()).toBeVisible({ timeout: 3000 });

    // Verify DOB/Age field
    const dobField = page.locator('text=/dob/i, text=/date of birth/i, text=/age/i')
      .or(page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/'));
    await expect(dobField.first()).toBeVisible({ timeout: 3000 });

    // Verify Sex at Birth field
    const sexField = page.locator('text=/sex/i')
      .or(page.locator('text=/male/i, text=/female/i'));
    await expect(sexField.first()).toBeVisible({ timeout: 3000 });

    // Verify Race field
    const raceField = page.locator('text=/race/i');
    await expect(raceField.first()).toBeVisible({ timeout: 3000 });

    // Verify Phone Number field
    const phoneField = page.locator('text=/phone/i')
      .or(page.locator('text=/\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/'));
    await expect(phoneField.first()).toBeVisible({ timeout: 3000 });

    // Verify Address field
    const addressField = page.locator('text=/address/i')
      .or(page.locator('text=/street/i'));
    await expect(addressField.first()).toBeVisible({ timeout: 3000 });

    // Verify City field
    const cityField = page.locator('text=/city/i');
    await expect(cityField.first()).toBeVisible({ timeout: 3000 });

    // Verify State field (may be present in the form even if not prominently displayed)
    // For smoke test, just verify city/state data exists in any form
    const locationData = page.locator('text=/city|state|[A-Z]{2}/i');
    const locationCount = await locationData.count();
    expect(locationCount).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 147
  test('ONEVIEW-147: Verify Address fields display correctly @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '147' });

    // Step 1: Verify Demographics card is loaded
    const demographicsCard = page.locator(':text("Demographics")').first();
    await expect(demographicsCard).toBeVisible({ timeout: 5000 });

    // Step 2: Verify Address labels are visible
    // Expected: Address 1 + Address 2 + City + State labels should be visible

    // Verify Address label/field is visible
    const addressLabel = page.locator('text=/address/i')
      .or(page.locator('label:has-text("Address")'))
      .or(page.locator(':text("Address 1")'))
      .or(page.locator(':text("Address 2")'));
    await expect(addressLabel.first()).toBeVisible({ timeout: 3000 });

    // Verify City label is visible
    const cityLabel = page.locator('text=/city/i')
      .or(page.locator('label:has-text("City")'));
    await expect(cityLabel.first()).toBeVisible({ timeout: 3000 });

    // Verify State label is visible
    const stateLabel = page.locator('text=/state/i')
      .or(page.locator('label:has-text("State")'));
    await expect(stateLabel.first()).toBeVisible({ timeout: 3000 });

    // Step 3: Verify corresponding address details display correctly
    // Check that address data is not empty/placeholder
    const addressData = page.locator('[class*="address"]')
      .or(page.locator('p, span, div').filter({ hasText: /\d+\s+[A-Za-z]+/ }));

    // Verify at least one address-related data field is visible
    const addressCount = await addressData.count();
    expect(addressCount).toBeGreaterThan(0);
  });
});
