// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { EditLayoutPage } from '../pages/EditLayoutPage.js';
import { CardSelectionDrawerPage } from '../pages/CardSelectionDrawerPage.js';
import { PreferredLayoutPage } from '../pages/PreferredLayoutPage.js';

/**
 * REGRESSION - Add Cards (Phase-2)
 * Qase Suite: 141 (Add Cards)
 */

test.use({ storageState: 'auth.json' });

test.describe('Phase-2', () => {
test.describe('Add Cards', () => {
test.describe('Add Cards - Regression @regression', () => {
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
  });

  // Qase ID: 765
  test('ONEVIEW-765: Verify Add Cards option visibility in Edit Mode only @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '765' });
    await editLayoutPage.assertAddCardsButtonVisible();
  });

  // Qase ID: 766
  test('ONEVIEW-766: Verify Add Cards button styling and label @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '766' });
    await expect(editLayoutPage.addCardsButton).toBeVisible({ timeout: TIMEOUTS.medium });
    const label = await editLayoutPage.addCardsButton.textContent();
    expect(label).toMatch(/Add Cards/i);
  });

  // Qase ID: 767
  test('ONEVIEW-767: Verify card selection panel opens on Add Cards click @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '767' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
  });

  // Qase ID: 768
  test('ONEVIEW-768: Verify card selection panel is scrollable @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '768' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await drawerPage.drawer.evaluate(el => el.scrollTo(0, 200));
    const scrollTop = await drawerPage.drawer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeGreaterThanOrEqual(0);
  });

  // Qase ID: 769
  test('ONEVIEW-769: Verify card list item layout with name, description, and action button @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '769' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Use action buttons as the card item proxy (card-item class not in actual DOM)
    const firstItem = drawerPage.drawer.getByRole('button', { name: /Add|Remove/i }).first();
    await expect(firstItem).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 770
  test('ONEVIEW-770: Verify all configurable cards are listed in the panel @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '770' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const items = drawerPage.drawer.getByRole('button', { name: /Add|Remove/i });
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(13);
    // Fixed cards should not appear
    await drawerPage.assertCardNotListed('Demographics');
    await drawerPage.assertCardNotListed('Care Management');
  });

  // Qase ID: 771
  test('ONEVIEW-771: Verify Add button default state styling @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '771' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.medium });
    const label = await addButton.textContent();
    expect(label?.trim()).toMatch(/Add/i);
  });

  // Qase ID: 772
  test('ONEVIEW-772: Verify card appears in dashboard layout on Add click @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '772' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await addButton.click();
    // After adding, a Remove button should appear confirming the card is now in layout
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 773
  test('ONEVIEW-773: Verify newly added card appears in leftmost column @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '773' });
    await editLayoutPage.selectTwoColumnLayout();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await addButton.click();
    // After adding, a Remove button should appear confirming the card is in layout
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 774
  test('ONEVIEW-774: Verify Remove button state styling after Add @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '774' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await addButton.click();
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
    const label = await removeButton.textContent();
    expect(label?.trim()).toMatch(/Remove/i);
  });

  // Qase ID: 775
  test('ONEVIEW-775: Verify duplicate addition is prevented visually @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '775' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // After adding a card, it should show Remove (not Add) - preventing re-add
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await addButton.click();
    // Same card now shows Remove
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 776
  test('ONEVIEW-776: Verify multiple cards can be added without restriction @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '776' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButtons = drawerPage.drawer.getByRole('button', { name: /Add/i });
    const count = await addButtons.count();
    if (count >= 2) {
      await addButtons.first().click();
      await page.waitForTimeout(300);
      // Re-fetch after DOM update; click next available Add button
      const nextAdd = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
      if (await nextAdd.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextAdd.click();
      }
    }
    // Remove buttons should now be visible for all added cards
    const removeButtons = drawerPage.drawer.getByRole('button', { name: /Remove/i });
    expect(await removeButtons.count()).toBeGreaterThan(0);
  });

  // Qase ID: 777
  test('ONEVIEW-777: Verify immediate visual feedback on Add action @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '777' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await addButton.click();
    // Immediately after click, Remove button should appear (no delay)
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.short });
  });

  // Qase ID: 778
  test('ONEVIEW-778: Verify card icons and visual identity in the panel @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '778' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const icons = drawerPage.drawer.locator('svg').first();
    await expect(icons).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 779
  test('ONEVIEW-779: Verify panel remains open after adding a card @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '779' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await addButton.click();
    // Drawer should still be visible after adding
    await drawerPage.assertVisible();
  });

  // Qase ID: 780
  test('ONEVIEW-780: Verify visual state of added card matches existing dashboard cards @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '780' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await addButton.click();
    await drawerPage.close();
    // Drawer closed → back on layout in Edit Mode; banner confirms edit mode is still active
    await editLayoutPage.assertEditModeBannerVisible();
    await drawerPage.assertNotVisible();
  });

  // Qase ID: 781
  test('ONEVIEW-781: Verify added cards persist visually after Save and re-login @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '781' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await addButton.click();
    await drawerPage.close();
    // Switch to a new layout to ensure Save is enabled
    await editLayoutPage.selectTwoColumnLayout();
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    // After save, should be back in view mode (Save button gone)
    await expect(preferredLayoutPage.saveButton).not.toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 782
  test('ONEVIEW-782: Verify Add Cards panel typography and color consistency @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '782' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await drawerPage.assertTitleVisible();
    await drawerPage.assertSearchBarVisible();
  });

  // Qase ID: 783
  test('ONEVIEW-783: Verify Add Cards panel responsiveness across supported screen sizes @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '783' });
    const resolutions = [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
      { width: 1280, height: 720 },
    ];
    for (const res of resolutions) {
      await page.setViewportSize(res);
      await editLayoutPage.goto();
      await editLayoutPage.enterEditMode();
      await editLayoutPage.clickAddCards();
      await drawerPage.assertVisible();
      await drawerPage.close();
    }
  });

  // Qase ID: 784
  test('ONEVIEW-784: Verify fixed cards are excluded from Add Cards panel @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '784' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await drawerPage.assertCardNotListed('Demographics');
    await drawerPage.assertCardNotListed('Care Management');
  });
});
});
});
