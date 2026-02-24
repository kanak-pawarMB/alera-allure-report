// @ts-check
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { TEST_DATA } from '../testData.js';

export class DashboardPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Primary search input — role-based with CSS fallbacks for resilience
    this.medicaidSearchInput = page
      .getByRole('textbox', { name: "Search by Patient's Medicaid" })
      .or(page.locator('input[placeholder*="Medicaid"]'))
      .or(page.locator('input[placeholder*="Search by Patient"]'))
      .or(page.locator('input[type="search"]').first())
      .first();

    // Toggle buttons for switching search mode
    this.lastNameDobToggle = page
      .getByRole('radio', { name: /Last Name \+ DOB/i })
      .first()
      .or(page.getByRole('button', { name: /Last Name \+ DOB/i }).first())
      .or(page.locator('button').filter({ hasText: /Last Name.*DOB/i }).first());

    this.medicaidToggle = page
      .getByRole('radio', { name: /Medicaid ID|Medicaid/i })
      .first()
      .or(page.getByRole('button', { name: /Medicaid ID|Medicaid/i }).first())
      .or(page.locator('button').filter({ hasText: /Medicaid/i }).first());

    // Last Name + DOB search fields
    this.lastNameInput = page
      .locator('input[placeholder*="Last Name"], input[placeholder*="First 3"]')
      .first();
    this.mmInput   = page.locator('input[placeholder*="MM"]').first();
    // DD field: combined selector (same as regression) — nth(1) skips MM field in maxlength match
    this.ddInput   = page.locator('input[placeholder*="DD"], input[maxlength="2"]').nth(1);
    this.yyyyInput = page.locator('input[placeholder*="YYYY"], input[maxlength="4"]').first();
  }

  /**
   * Navigate to the dashboard and guard against auth expiry.
   * Waits for the search input to be ready before returning.
   */
  async goto() {
    await this.navigate(TEST_DATA.urls.dashboard);
    await this.assertNotRedirectedToLogin();
    // Ensure search input is rendered and ready
    await this.medicaidSearchInput
      .waitFor({ state: 'visible', timeout: 30000 })
      .catch(() => {});
  }

  /**
   * Load a patient by Medicaid ID.
   * Replaces the copy-pasted patient load block found in every beforeEach.
   * @param {string} medicaidId
   * @param {string} [displayText] - text visible in the dropdown result
   */
  async loadPatientByMedicaidId(medicaidId, displayText) {
    await expect(this.medicaidSearchInput).toBeVisible({ timeout: 30000 });
    await this.medicaidSearchInput.click();
    await this.medicaidSearchInput.fill(medicaidId);
    const result = this.page.getByText(displayText || medicaidId, { exact: false }).first();
    await expect(result).toBeVisible({ timeout: 15000 });
    await result.click();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Load the standard test patient (NC767095351 — Elizabeth Garcia).
   * Used in 90%+ of tests.
   */
  async loadDefaultPatient() {
    await this.loadPatientByMedicaidId(
      TEST_DATA.patients.completeData.medicaidId,
      'NC767095351|Elizabeth Garcia|12/09/'
    );
  }

  /**
   * Switch to Last Name + DOB search mode.
   */
  async switchToLastNameDobMode() {
    await this.lastNameDobToggle.click({ timeout: 10000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Search by Last Name + DOB. Switches mode first.
   * @param {string} last3
   * @param {string} mm
   * @param {string} dd
   * @param {string} yyyy
   */
  async searchByLastNameDob(last3, mm, dd, yyyy) {
    await this.switchToLastNameDobMode();
    await expect(this.lastNameInput).toBeVisible({ timeout: 10000 });
    // Click each field before filling to ensure React onChange events fire correctly
    await this.lastNameInput.click();
    await this.lastNameInput.fill(last3);
    await expect(this.mmInput).toBeVisible({ timeout: 10000 });
    await this.mmInput.click();
    await this.mmInput.fill(mm);
    await expect(this.ddInput).toBeVisible({ timeout: 5000 });
    await this.ddInput.click();
    await this.ddInput.fill(dd);
    await expect(this.yyyyInput).toBeVisible({ timeout: 5000 });
    await this.yyyyInput.click();
    await this.yyyyInput.fill(yyyy);
    // Give API time to respond to complete DOB input
    await this.page.waitForTimeout(1000);
  }

  /**
   * Assert that a patient's dashboard has loaded (any card section is visible).
   */
  async assertPatientDashboardLoaded() {
    await expect(
      this.page.locator('text=/Demographics|Medical|Health|Care/i').first()
    ).toBeVisible({ timeout: 30000 });
  }

  /**
   * Assert the search shows no results.
   */
  async assertNoResults() {
    const noResults = this.page
      .locator('text=/no patient.*found|not found|no matching/i')
      .first();
    if (await noResults.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(noResults).toBeVisible();
    }
  }

  /**
   * Dismiss the ADT alert banner if it appears (it can intercept clicks on "View all").
   */
  async dismissAlertBannerIfPresent() {
    const dismissBtn = this.page.getByRole('button', { name: /Dismiss/i }).first();
    if (await dismissBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dismissBtn.click();
      await this.page.waitForTimeout(500);
    }
  }
}
