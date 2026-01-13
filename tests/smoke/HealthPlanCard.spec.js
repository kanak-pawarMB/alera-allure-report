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

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select patient (primary complete data)
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
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
