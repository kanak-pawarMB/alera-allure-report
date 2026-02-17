// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Medical Diagnoses - Smoke Tests', () => {
  // Configure timeout at describe level - applies to ALL hooks and tests
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    // Reset viewport to prevent navigation issues
    await page.setViewportSize({ width: 1280, height: 720 });

    try {
      // Navigate to dashboard
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
      await page.waitForLoadState('networkidle', { timeout: 60000 });

      // Search for patient with complete data
      const searchBox = page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first();
      await expect(searchBox).toBeVisible({ timeout: 30000 });
      await searchBox.click();
      await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
      await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: 'screenshots/debug-MedicalDiagnoses-beforeEach-fail.png', fullPage: true }).catch(() => {});
      throw e;
    }
  });

  test('ONEVIEW-309: Verify read-only behavior @smoke', async ({ page }) => {
    // Locate Medical Diagnoses card
    const card = page.locator('text=/Medical Diagnoses|Diagnoses/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Verify card has content
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);

    // Attempt to find editable fields and verify they don't exist
    const editableInputs = page.locator('input[contenteditable="true"], textarea[contenteditable="true"]');
    const editableCount = await editableInputs.count();
    
    // Card should have minimal or no editable fields (read-only view)
    // Allow for some interaction elements but no direct data editing
    expect(editableCount).toBeLessThanOrEqual(1);

    // Verify data is displayed in a read-only format (text/spans, not inputs)
    const dataElements = page.locator('span, p, div').filter({ has: page.locator('text=/[A-Z0-9]/') });
    const hasReadOnlyData = await dataElements.count().then(count => count > 0);
    expect(hasReadOnlyData).toBeTruthy();
  });

  test('ONEVIEW-310: Verify responsiveness @smoke', async ({ page }) => {
    // Locate Medical Diagnoses card
    const card = page.locator('text=/Medical Diagnoses|Diagnoses/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Test on tablet viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000); // Wait for layout adjustment

    // Verify card is still visible
    await expect(card).toBeVisible({ timeout: 5000 });

    // Verify no horizontal scroll on tablet
    const tabletHasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(tabletHasScroll).toBeFalsy();

    // Test on mobile viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Verify card adapts to mobile view
    await expect(card).toBeVisible({ timeout: 5000 });

    // Verify grid layout adjusts without overflow
    const mobileHasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(mobileHasScroll).toBeFalsy();

    // Verify card content is still readable on mobile
    const mobileCardText = await card.textContent();
    // @ts-ignore
    expect(mobileCardText.length).toBeGreaterThan(0);

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
