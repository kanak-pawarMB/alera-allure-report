// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Health Plan Card Critical Path
 * These tests verify ONLY the critical happy path for Health Plan card
 * Qase Test Management Suite: Suite 10
 */

test.use({ storageState: 'auth.json' });

test.describe('Health Plan Card - Smoke Tests', () => {
  // Configure timeout at describe level - applies to ALL hooks and tests
  test.describe.configure({ timeout: 120000 });

  /* -------------------- Helpers -------------------- */

  // Flexible search field locator
  async function getSearchField(page) {
    const field = page
      .locator('input[placeholder*="Search"], input[placeholder*="Medicaid"], input[type="text"]')
      .first();
    await expect(field).toBeVisible({ timeout: 30000 });
    return field;
  }

  // Get search result - uses getByText for dropdown items
  async function getSearchResult(page, patientText) {
    const result = page.getByText(patientText).first();
    await expect(result).toBeVisible({ timeout: 30000 });
    return result;
  }

  /* -------------------- Setup -------------------- */

  test.beforeEach(async ({ page }) => {
    try {
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
      await page.waitForLoadState('networkidle', { timeout: 60000 });

      // Verify we're on dashboard (not redirected to login)
      const currentUrl = page.url();
      if (currentUrl.includes('login')) {
        throw new Error('Redirected to login page - auth session may have expired');
      }

      // Wait for dashboard to be ready
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

      // Search and select patient using flexible locators
      const searchBox = await getSearchField(page);
      await searchBox.click();
      await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);

      // Click search result
      const searchResult = await getSearchResult(page, 'NC767095351|Elizabeth Garcia|12/09/');
      await searchResult.click();

      // Wait for patient data to load
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: 'healthplan-beforeeach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
  });

  // Qase Test Case ID: 81
  test('ONEVIEW-81: Verify Health Plan Card Display @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '81' });

    // Step 1: Verify user is logged in as provider (already done in beforeEach)
    // Step 2: Navigate to patient's profile (already done in beforeEach)

    // Step 3: Observe the Health Plan card section
    // Expected: Health Plan card is visible with all relevant fields displayed

    const healthPlanCard = page.locator(':text("Health Plan")')
      .or(page.locator(':text("Healthplan")'))
      .or(page.locator(':text("Health")'))
      .or(page.locator('[class*="health"]'))
      .or(page.locator('[data-testid="health-plan"]'));

    // Verify Health Plan card is visible
    await expect(healthPlanCard.first()).toBeVisible({ timeout: 5000 });

    // Verify the card has content/data (not empty)
    const cardContent = page.locator('[class*="card"]').filter({ hasText: /health/i });
    await expect(cardContent.first()).toBeVisible({ timeout: 3000 });

    // Verify Health Plan card displays data from Enrollment table
    // Check for typical health plan fields like plan name, enrollment info
    const planData = page.locator('text=/plan|enrollment|effective|member/i');
    const planDataCount = await planData.count();

    // At least some health plan data should be visible
    expect(planDataCount).toBeGreaterThan(0);
    console.log(`Health Plan card loaded with ${planDataCount} data fields`);
  });
});
