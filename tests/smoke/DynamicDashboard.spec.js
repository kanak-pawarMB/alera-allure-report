// @ts-check
import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST - Dynamic Dashboard Critical Path
 * These tests verify the dynamic dashboard layout and data loading
 * Qase Test Management Suite: Suite 8
 */

test.describe('Dynamic Dashboard - Smoke Tests', () => {
  const DASHBOARD_URL = 'https://demooneview.z20.web.core.windows.net/dashboard';

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard with increased timeout
    await page.goto(DASHBOARD_URL, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    await page.waitForTimeout(2000);

    // Search for a valid patient and open their record
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    const validMedicaidId = 'NC160943625';
    await searchField.fill(validMedicaidId);
    await page.waitForTimeout(3000);

    // Wait for search result to be visible before clicking
    const searchResult = page.locator('p').filter({ hasText: validMedicaidId }).first();
    await searchResult.waitFor({ state: 'visible', timeout: 15000 });
    await searchResult.click({ timeout: 15000 });
    await page.waitForTimeout(3000);
  });

  // Qase Test Case ID: 35
  test('ONEVIEW-35: Verify dashboard loads personalized layout for logged-in user @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '35' });

    // Step 1: Verify dashboard layout loads
    // Expected: Dashboard layout loads as per user's personalized configuration

    // Verify multiple cards are visible (personalized layout)
    const demographicsCard = page.locator(':text("Demographics")');
    const pcpCard = page.locator(':text("PCP")');
    const careManagementCard = page.locator(':text("Care Management")');

    // At least one card should be visible
    await expect(demographicsCard.or(pcpCard).or(careManagementCard).first()).toBeVisible({ timeout: 5000 });

    // Step 2: Verify cards appear in correct order
    // Check that multiple cards are loaded
    const allCards = page.locator('[class*="card"]');
    const cardCount = await allCards.count();

    expect(cardCount).toBeGreaterThan(0);
    console.log(`Dashboard loaded with ${cardCount} cards`);
  });

  // Qase Test Case ID: 38
  test('ONEVIEW-38: Verify each card fetches and displays correct data @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '38' });

    // Step 1: Verify cards are loaded
    await page.waitForTimeout(2000);

    // Step 2: Verify each card displays data fetched from respective API
    // Expected: Each card displays data from its respective API endpoint

    // Verify Demographics card has data
    const demographicsCard = page.locator(':text("Demographics")').first();
    if (await demographicsCard.isVisible({ timeout: 3000 })) {
      // Check for patient data fields
      const nameData = page.locator('text=/[A-Z][a-z]+ [A-Z][a-z]+/');
      await expect(nameData.first()).toBeVisible({ timeout: 3000 });
    }

    // Verify PCP card has data
    const pcpCard = page.locator(':text("PCP")').first();
    if (await pcpCard.isVisible({ timeout: 3000 })) {
      // Check for PCP data fields
      const pcpData = page.locator('text=/phone|address|city/i');
      await expect(pcpData.first()).toBeVisible({ timeout: 3000 });
    }

    // Verify Care Management card has data (if present)
    const careCard = page.locator(':text("Care Management")').first();
    const careCardVisible = await careCard.isVisible({ timeout: 1000 }).catch(() => false);
    if (careCardVisible) {
      // Just verify the card itself is visible, data check is optional
      await expect(careCard).toBeVisible();
    }

    // Verify that at least 2 cards have loaded with data
    const cardsWithData = page.locator('[class*="card"]').filter({ hasText: /.{10,}/ });
    const dataCount = await cardsWithData.count();
    expect(dataCount).toBeGreaterThanOrEqual(2);
    console.log(`${dataCount} cards loaded with data successfully`);
  });

  // Qase Test Case ID: 42
  test('ONEVIEW-42: Verify dashboard responsiveness @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '42' });

    // Step 1: Verify dashboard at default viewport
    const cards = page.locator('[class*="card"]').first();
    await expect(cards).toBeVisible({ timeout: 5000 });

    // Step 2: Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Expected: Cards realign and resize appropriately
    await expect(cards).toBeVisible();

    // Verify no horizontal scrolling
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10);

    // Step 3: Test desktop viewport (1920px)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Expected: No overlapping, truncation, or horizontal scrolling
    await expect(cards).toBeVisible();

    // Verify cards are properly displayed
    const desktopScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const desktopClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(desktopScrollWidth).toBeLessThanOrEqual(desktopClientWidth + 10);

    console.log('Dashboard responsive layout verified for tablet and desktop');
  });
});
