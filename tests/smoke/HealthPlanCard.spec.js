// @ts-check
import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST - Health Plan Card Critical Path
 * These tests verify ONLY the critical happy path for Health Plan card
 * Qase Test Management Suite: Suite 10
 */

test.describe('Health Plan Card - Smoke Tests', () => {
  const DASHBOARD_URL = 'https://demooneview.z20.web.core.windows.net/dashboard';

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Search for a valid patient and open their record
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const validMedicaidId = 'NC160943625';
    await searchField.fill(validMedicaidId);
    await page.waitForTimeout(1500);

    // Click on search result to load patient dashboard
    const searchResult = page.locator('p').filter({ hasText: validMedicaidId }).first();
    await searchResult.click();
    await page.waitForTimeout(2000);
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
      .or(page.locator(':text("Health")')
      .or(page.locator('[class*="health"]'))
      .or(page.locator('[data-testid="health-plan"]')));

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
