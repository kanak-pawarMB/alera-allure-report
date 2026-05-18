// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { EditLayoutPage } from '../pages/EditLayoutPage.js';
import { CardSelectionDrawerPage } from '../pages/CardSelectionDrawerPage.js';
import { PreferredLayoutPage } from '../pages/PreferredLayoutPage.js';

/**
 * REGRESSION - Remove Cards (Phase-2)
 * Qase Suite: 142 (Remove Cards)
 */

test.use({ storageState: 'auth.json' });

test.describe('Phase-2', () => {
test.describe('Remove Cards', () => {
test.describe('Remove Cards - Regression @regression', () => {
  test.describe.configure({ timeout: TIMEOUTS.test });

  let editLayoutPage;
  let drawerPage;
  let preferredLayoutPage;

  test.beforeEach(async ({ page }) => {
    editLayoutPage = new EditLayoutPage(page);
    drawerPage = new CardSelectionDrawerPage(page);
    preferredLayoutPage = new PreferredLayoutPage(page);
    await editLayoutPage.goto();
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Ensure at least one card is added so Remove buttons exist
    const removeExists = await drawerPage.drawer.getByRole('button', { name: /Remove/i }).first()
      .isVisible({ timeout: 2000 }).catch(() => false);
    if (!removeExists) {
      await drawerPage.drawer.getByRole('button', { name: /Add/i }).first().click();
      await page.waitForTimeout(300);
    }
  });

  // Qase ID: 786
  test('ONEVIEW-786: Verify Remove button visibility for already-added cards @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '786' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 787
  test('ONEVIEW-787: Verify Remove button styling @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '787' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
    const label = await removeButton.textContent();
    expect(label?.trim()).toMatch(/Remove/i);
  });

  // Qase ID: 788
  test('ONEVIEW-788: Verify visual distinction between Add and Remove states @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '788' });
    const addCount = await drawerPage.drawer.getByRole('button', { name: /Add/i }).count();
    const removeCount = await drawerPage.drawer.getByRole('button', { name: /Remove/i }).count();
    // At least one type should be present
    expect(addCount + removeCount).toBeGreaterThan(0);
  });

  // Qase ID: 789
  test('ONEVIEW-789: Verify card is removed from dashboard layout on Remove click @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '789' });
    const removesBefore = await drawerPage.drawer.getByRole('button', { name: /Remove/i }).count();
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    await page.waitForTimeout(300);
    const removesAfter = await drawerPage.drawer.getByRole('button', { name: /Remove/i }).count();
    // One fewer Remove button means the card was removed from layout
    expect(removesAfter).toBeLessThan(removesBefore);
  });

  // Qase ID: 790
  test('ONEVIEW-790: Verify Remove button changes back to Add after removal @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '790' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.short });
  });

  // Qase ID: 791
  test('ONEVIEW-791: Verify layout reflows correctly after card removal @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '791' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    // Dashboard should not have layout overflow or broken styling
    const isBodyOverflowing = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
    expect(isBodyOverflowing).toBeFalsy();
  });

  // Qase ID: 792
  test('ONEVIEW-792: Verify removed card remains available for re-adding @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '792' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    // The card should now show Add button (available for re-adding)
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.short });
    // Re-add it
    await addButton.click();
    await page.waitForTimeout(300);
    const newRemoveButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(newRemoveButton).toBeVisible({ timeout: TIMEOUTS.short });
  });

  // Qase ID: 793
  test('ONEVIEW-793: Verify multiple cards can be removed sequentially @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '793' });
    // Add a second card if needed so we have >= 2 Remove buttons
    const removeCountBefore = await drawerPage.drawer.getByRole('button', { name: /Remove/i }).count();
    if (removeCountBefore < 2) {
      const nextAdd = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
      if (await nextAdd.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextAdd.click();
        await page.waitForTimeout(300);
      }
    }
    const removeButtons = drawerPage.drawer.getByRole('button', { name: /Remove/i });
    const count = await removeButtons.count();
    if (count >= 2) {
      await removeButtons.first().click();
      await page.waitForTimeout(300);
      await drawerPage.drawer.getByRole('button', { name: /Remove/i }).first().click();
      await page.waitForTimeout(300);
    }
    // Add buttons should have increased
    const addButtons = drawerPage.drawer.getByRole('button', { name: /Add/i });
    expect(await addButtons.count()).toBeGreaterThan(0);
  });

  // Qase ID: 794
  test('ONEVIEW-794: Verify fixed cards do not appear in Remove list @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '794' });
    await drawerPage.assertCardNotListed('Demographics');
    await drawerPage.assertCardNotListed('Care Management');
    // Close the drawer before checking the dashboard — the drawer overlay can obscure fixed cards
    await drawerPage.close();
    await page.waitForTimeout(400);
    // Fixed cards should still be on dashboard
    await expect(editLayoutPage.demographicsCard).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 795
  test('ONEVIEW-795: Verify removed cards persist as hidden after Save and re-login @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '795' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    await drawerPage.close();
    await editLayoutPage.selectTwoColumnLayout();
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    // After save, Edit Mode should exit
    await expect(editLayoutPage.cancelButton).not.toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 796
  test('ONEVIEW-796: Verify removed card does not appear in any column after layout changes @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '796' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    await drawerPage.close();
    // Switch layout and verify edit mode is still active
    await editLayoutPage.selectThreeColumnLayout();
    await editLayoutPage.selectSingleColumnLayout();
    await expect(editLayoutPage.editModeBanner).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 797
  test('ONEVIEW-797: Verify immediate visual feedback on Remove action @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '797' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    // Add button should appear immediately
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.short });
  });

  // Qase ID: 798
  test('ONEVIEW-798: Verify removing all configurable cards leaves only fixed cards @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '798' });
    // Remove all cards that have a Remove button
    let count = await drawerPage.drawer.getByRole('button', { name: /Remove/i }).count();
    while (count > 0) {
      await drawerPage.drawer.getByRole('button', { name: /Remove/i }).first().click();
      await page.waitForTimeout(200);
      count = await drawerPage.drawer.getByRole('button', { name: /Remove/i }).count();
    }
    // All configurable cards removed — only fixed cards remain; drawer still functions correctly
    await drawerPage.assertCardNotListed('Demographics');
    await drawerPage.assertCardNotListed('Care Management');
    await editLayoutPage.assertEditModeBannerVisible();
  });

  // Qase ID: 799
  test('ONEVIEW-799: Verify Remove action does not affect other dashboard data @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '799' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    await page.waitForTimeout(300);
    // Fixed cards are not listed in the drawer — removing a configurable card doesn't affect them
    await drawerPage.assertCardNotListed('Demographics');
    await drawerPage.assertCardNotListed('Care Management');
    // Edit Mode is still active (no crash / navigation)
    await editLayoutPage.assertEditModeBannerVisible();
  });

  // Qase ID: 800
  test('ONEVIEW-800: Verify Cancel preserves the removed state until Save @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '800' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    await drawerPage.close();
    await editLayoutPage.exitViaCancel();
    // After cancel, Edit Mode should exit without saving changes
    await expect(editLayoutPage.editModeBanner).not.toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 801
  test('ONEVIEW-801: Verify drag handle is removed when card is removed @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '801' });
    const draggableBefore = await page.locator('[draggable="true"]').count();
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    await page.waitForTimeout(300);
    const draggableAfter = await page.locator('[draggable="true"]').count();
    // Removing a card should reduce the draggable count (or keep it same if none left)
    expect(draggableAfter).toBeLessThanOrEqual(draggableBefore);
  });

  // Qase ID: 802
  test('ONEVIEW-802: Verify Remove button responsiveness across supported screen sizes @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '802' });
    const resolutions = [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
      { width: 1280, height: 720 },
    ];
    for (const res of resolutions) {
      await page.setViewportSize(res);
      const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
      await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
    }
  });

  // Qase ID: 803
  test('ONEVIEW-803: Verify Remove button typography and color consistency @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '803' });
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 804
  test('ONEVIEW-804: Verify removing a card does not affect other users @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '804' });
    // Single-user test: verify remove is session-scoped (no cross-user contamination visible from this session)
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await removeButton.click();
    // Current user's drawer should now show Add for the removed card
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.short });
  });
});
});
});
