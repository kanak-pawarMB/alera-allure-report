// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Behavioral Health Diagnoses - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Reset viewport to prevent navigation issues
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to dashboard
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search for patient with complete data
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
  });

  test('ONEVIEW-323: Verify read-only data behavior @smoke', async ({ page }) => {
    // Locate Behavioral Health Diagnoses card
    const card = page.locator('text=/Behavioral Health Diagnoses|Mental Health|Behavioral/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Verify card has content
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);

    // Verify data is read-only (cannot be edited)
    // Check no contenteditable elements exist in the card
    const editableElements = card.locator('[contenteditable="true"]');
    const editableCount = await editableElements.count();
    expect(editableCount).toBe(0);

    // Verify the card displays data in a read-only format
    // Card should be visible and interactive (clickable) but not editable
    const isVisible = await card.isVisible();
    expect(isVisible).toBeTruthy();
  });
});
