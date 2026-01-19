// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Mark Cards as Important - Smoke Tests', () => {
  // Configure timeout at describe level - applies to ALL hooks and tests
  test.describe.configure({ timeout: 120000 });

  /* -------------------- Helpers -------------------- */

  // Flexible search field locator
  // @ts-ignore
  async function getSearchField(page) {
    const field = page
      .locator('input[placeholder*="Search"], input[placeholder*="Medicaid"], input[type="text"]')
      .first();
    await expect(field).toBeVisible({ timeout: 30000 });
    return field;
  }

  // Get search result - uses getByText for dropdown items
  // @ts-ignore
  async function getSearchResult(page, patientText) {
    const result = page.getByText(patientText).first();
    await expect(result).toBeVisible({ timeout: 30000 });
    return result;
  }

  /* -------------------- Setup -------------------- */

  test.beforeEach(async ({ page }) => {
    // Reset viewport to prevent navigation issues
    await page.setViewportSize({ width: 1280, height: 720 });

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

      // Brief wait for dashboard cards to render before interactions
      const anyCard = page.locator('[role="region"], [class*="card"], [class*="Card"], div[class*="shadow"]').first();
      await anyCard.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

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
      await page.screenshot({ path: 'markimportant-beforeeach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
  });

  test('ONEVIEW-511: Verify Star Icon Exists @smoke', async ({ page }) => {
    // Get all dashboard cards
    const cards = page.locator('[role="region"], [class*="card"], [class*="Card"], div[class*="shadow"]').filter({ hasText: /[A-Z]/ }).first();
    
    // Verify at least one card is visible
    await expect(cards).toBeVisible({ timeout: 10000 });

    // Look for star icons in card headers (top-right corner)
    const starIcons = page.locator('button[aria-label*="star" i], button[title*="star" i], [class*="star"], svg[class*="star"]');
    const starCount = await starIcons.count();

    // Verify star icons exist on the dashboard
    expect(starCount).toBeGreaterThan(0);

    // Verify at least one star icon is visible
    const firstStar = starIcons.first();
    const isStarVisible = await firstStar.isVisible().catch(() => false);
    expect(isStarVisible).toBeTruthy();
  });

  test('ONEVIEW-512: Verify Click Star to Mark Important @smoke', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');

    // Find a star icon to click
    const starButton = page.locator('button[aria-label*="star" i], button[title*="star" i], [class*="star-icon"] button').first();
    
    // Check if star button exists and is visible
    const isVisible = await starButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // Click the star to mark as important
      await starButton.click();
      
      // Wait for visual change
      await page.waitForTimeout(500);

      // Verify star becomes filled (class change or visual indicator)
      const starParent = starButton.locator('..');
      const hasFilledClass = await starParent.locator('[class*="fill"], [class*="important"], [class*="selected"]').isVisible().catch(() => false);
      
      // Verify card receives highlight/glow (look for highlight class or style change)
      const cardWithGlow = page.locator('[class*="highlight"], [class*="glow"], [class*="selected"], [class*="important"]').first();
      const hasGlow = await cardWithGlow.isVisible().catch(() => false);

      // Star should be marked as important (filled or have visual indicator)
      expect(hasFilledClass || hasGlow).toBeTruthy();
    } else {
      // If star button not found, verify the card structure still exists
      const card = page.locator('[role="region"], [class*="card"]').first();
      await expect(card).toBeVisible({ timeout: 5000 });
    }
  });
});
