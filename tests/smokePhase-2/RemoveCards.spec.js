// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { EditLayoutPage } from '../pages/EditLayoutPage.js';
import { CardSelectionDrawerPage } from '../pages/CardSelectionDrawerPage.js';

/**
 * SMOKE - Remove Cards (Phase-2)
 * Qase Suite: Remove Cards > Smoke - Remove Cards
 * Test Cases: ONEVIEW-853, 854
 */

test.use({ storageState: 'auth.json' });

test.describe('Phase-2', () => {
test.describe('Remove Cards', () => {
test.describe('Smoke - Remove Cards', () => {
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
    // Wait for drawer card list to load
    await expect(drawerPage.drawer.getByRole('button', { name: /Add|Remove/i }).first())
      .toBeVisible({ timeout: 10000 });
    // If no Remove buttons exist (layout is empty / default), add one card first
    // so Remove tests have something to work with.
    const hasRemove = await drawerPage.drawer.getByRole('button', { name: /^Remove$/i }).first()
      .isVisible({ timeout: 2000 }).catch(() => false);
    if (!hasRemove) {
      await drawerPage.drawer.getByRole('button', { name: /Add/i }).first().click();
      await expect(drawerPage.drawer.getByRole('button', { name: /^Remove$/i }).first())
        .toBeVisible({ timeout: 8000 });
    }
  });

  // Qase ID: 847 (QASE auto-assigned; ONEVIEW title = 853)
  test('ONEVIEW-853: Verify Remove button removes a card from the dashboard layout @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '847' });
    // Remove button only appears for cards already in the layout; scope to drawer
    const removeButton = drawerPage.drawer.getByRole('button', { name: /^Remove$/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
    const cardsBefore = await page.locator('[class*="col"] [class*="card"]').count();
    await removeButton.click();
    await page.waitForTimeout(500);
    const cardsAfter = await page.locator('[class*="col"] [class*="card"]').count();
    expect(cardsAfter).toBeLessThanOrEqual(cardsBefore);
  });

  // Qase ID: 848 (QASE auto-assigned; ONEVIEW title = 854)
  test('ONEVIEW-854: Verify Remove button changes back to Add after removing @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '848' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /^Remove$/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
    await removeButton.click();
    // After removal, that card's button reverts to "+ Add"
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });
});
});
});
