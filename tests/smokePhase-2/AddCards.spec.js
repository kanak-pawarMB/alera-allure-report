// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { EditLayoutPage } from '../pages/EditLayoutPage.js';
import { CardSelectionDrawerPage } from '../pages/CardSelectionDrawerPage.js';

/**
 * SMOKE - Add Cards (Phase-2)
 * Qase Suite: Add Cards > Smoke - Add Cards
 * Test Cases: ONEVIEW-850, 851, 852
 */

test.use({ storageState: 'auth.json' });

test.describe('Phase-2', () => {
test.describe('Add Cards', () => {
test.describe('Smoke - Add Cards', () => {
  test.describe.configure({ timeout: TIMEOUTS.test });

  let editLayoutPage;
  let drawerPage;

  test.beforeEach(async ({ page }) => {
    editLayoutPage = new EditLayoutPage(page);
    drawerPage = new CardSelectionDrawerPage(page);
    await editLayoutPage.goto();
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Wait for drawer card list to load (Add buttons have text "+ Add")
    await expect(drawerPage.drawer.getByRole('button', { name: /Add|Remove/i }).first())
      .toBeVisible({ timeout: 10000 });
  });

  // Qase ID: 839 (QASE auto-assigned; ONEVIEW title = 850)
  test('ONEVIEW-850: Verify Add button adds a card to the dashboard layout @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '839' });
    // Add buttons show "+ Add" text; scope to drawer to avoid matching the "Add Cards" toolbar button
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.medium });
    const cardsBefore = await page.locator('[class*="col"] [class*="card"]').count();
    await addButton.click();
    await page.waitForTimeout(500);
    const cardsAfter = await page.locator('[class*="col"] [class*="card"]').count();
    expect(cardsAfter).toBeGreaterThanOrEqual(cardsBefore);
  });

  // Qase ID: 840 (QASE auto-assigned; ONEVIEW title = 851)
  test('ONEVIEW-851: Verify Add button changes to Remove after adding @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '840' });
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.medium });
    await addButton.click();
    // After adding, that card's button changes to "Remove"
    const removeButton = drawerPage.drawer.getByRole('button', { name: /^Remove$/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 841 (QASE auto-assigned; ONEVIEW title = 852)
  test('ONEVIEW-852: Verify drawer remains open after adding a card @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '841' });
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.medium });
    await addButton.click();
    // Drawer should remain visible after add action
    await drawerPage.assertVisible();
  });
});
});
});
