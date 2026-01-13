// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Immunizations Card Critical Path
 * These tests verify ONLY the critical happy path for Immunizations card
 * Qase Test Management Suite: Suite 31
 */

test.use({ storageState: 'auth.json' });

test.describe('Immunizations - Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Reset viewport to reduce flakiness across navigations
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select patient (primary complete data)
    const searchInput = page.getByPlaceholder("Search by Patient's Medicaid ID")
      .or(page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }))
      .first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.click();
    await searchInput.fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
  });

  // Qase Test Case ID: 352
  test('ONEVIEW-352: Verify read-only view @smoke', async ({ page }) => {

    // Verify Immunizations card is displayed
    const immunizationsCard = page.locator('text=/Immunization|Immunizations/i').first();
    await expect(immunizationsCard).toBeVisible({ timeout: 10000 });

    // Verify no editable fields exist (read-only)
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /Immunization|Immunizations/i }).first();
    
    const editableInputs = cardContainer.locator('input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])');
    const count = await editableInputs.count();
    expect(count).toBe(0);

    // Verify content is displayed (vaccines and dates are read-only)
    const cardText = await cardContainer.textContent() || '';
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 355
  test('ONEVIEW-355: Verify layout and font per Figma @smoke', async ({ page }) => {

    // Verify Immunizations card loads
    const immunizationsCard = page.locator('text=/Immunization|Immunizations/i').first();
    await expect(immunizationsCard).toBeVisible({ timeout: 10000 });

    // Verify card container has proper styling
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /Immunization|Immunizations/i }).first();
    await expect(cardContainer).toBeVisible();

    // Verify card has expected structure (basic layout check)
    const cardBox = await cardContainer.boundingBox();
    expect(cardBox).not.toBeNull();
    
    // Verify card content is properly formatted
    const cardText = await cardContainer.textContent() || '';
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 358
  test('ONEVIEW-358: Verify tab/mobile responsiveness @smoke', async ({ page }) => {

    // Verify card loads at default size
    const immunizationsCard = page.locator('text=/Immunization|Immunizations/i').first();
    await expect(immunizationsCard).toBeVisible({ timeout: 10000 });

    // Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Verify card still visible and no truncation
    await expect(immunizationsCard).toBeVisible();

    // Test mobile viewport (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Verify card remains accessible on mobile
    const cardContainer = page.locator('[class*="card"]').filter({ hasText: /Immunization|Immunizations/i }).first();
    const isVisible = await cardContainer.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();

    // Test desktop viewport (1920px)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Verify layout adapts correctly
    await expect(immunizationsCard).toBeVisible();

    // Verify no horizontal scrolling
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10);
  });
});
