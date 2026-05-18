// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { EditLayoutPage } from '../pages/EditLayoutPage.js';
import { CardSelectionDrawerPage } from '../pages/CardSelectionDrawerPage.js';

/**
 * SMOKE - Drawer Component (Phase-2)
 * Qase Suite: Drawer Component > Smoke - Drawer Component
 * Test Cases: ONEVIEW-847, 848, 849
 */

test.use({ storageState: 'auth.json' });

test.describe('Phase-2', () => {
test.describe('Drawer Component', () => {
test.describe('Smoke - Drawer Component', () => {
  test.describe.configure({ timeout: TIMEOUTS.test });

  let editLayoutPage;
  let drawerPage;

  test.beforeEach(async ({ page }) => {
    editLayoutPage = new EditLayoutPage(page);
    drawerPage = new CardSelectionDrawerPage(page);
    await editLayoutPage.goto();
    await editLayoutPage.enterEditMode();
  });

  // Qase ID: 842 (QASE auto-assigned; ONEVIEW title = 847)
  test('ONEVIEW-847: Verify Add Cards drawer opens when Add Cards is clicked @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '842' });
    await editLayoutPage.assertAddCardsButtonVisible();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await drawerPage.assertTitleVisible();
  });

  // Qase ID: 843 (QASE auto-assigned; ONEVIEW title = 848)
  test('ONEVIEW-848: Verify drawer displays card list with Add and Remove buttons @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '843' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Wait for Add/Remove buttons to confirm card list has loaded; scoped to drawer
    // Add buttons show "+ Add", Remove buttons show "Remove"
    const actionButtons = drawerPage.drawer.getByRole('button', { name: /Add|Remove/i });
    await expect(actionButtons.first()).toBeVisible({ timeout: 10000 });
    expect(await actionButtons.count()).toBeGreaterThan(0);
    // Drawer must list configurable cards (rows with bottom borders)
    const cardItems = drawerPage.drawer.locator('[class*="border-b"]');
    expect(await cardItems.count()).toBeGreaterThan(0);
  });

  // Qase ID: 844 (QASE auto-assigned; ONEVIEW title = 849)
  test('ONEVIEW-849: Verify drawer closes via the X icon @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '844' });
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await drawerPage.close();
    await drawerPage.assertNotVisible();
  });
});
});
});
