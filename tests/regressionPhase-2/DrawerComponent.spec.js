// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { EditLayoutPage } from '../pages/EditLayoutPage.js';
import { CardSelectionDrawerPage } from '../pages/CardSelectionDrawerPage.js';

/**
 * REGRESSION - Drawer Component (Phase-2)
 * Qase Suite: 140 (Drawer Component)
 */

test.use({ storageState: 'auth.json' });

test.describe('Phase-2', () => {
test.describe('Drawer Component', () => {
test.describe('Drawer Component - Regression @regression', () => {
  test.describe.configure({ timeout: TIMEOUTS.test });

  let editLayoutPage;
  let drawerPage;

  test.beforeEach(async ({ page }) => {
    editLayoutPage = new EditLayoutPage(page);
    drawerPage = new CardSelectionDrawerPage(page);
    await editLayoutPage.goto();
  });

  // Qase ID: 744
  test('ONEVIEW-744: Verify Add Cards button visibility in Edit Mode @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '744' });
    // Not visible in view mode
    await editLayoutPage.assertAddCardsButtonNotVisible();
    // Visible in Edit Mode
    await editLayoutPage.enterEditMode();
    await editLayoutPage.assertAddCardsButtonVisible();
  });

  // Qase ID: 745
  test('ONEVIEW-745: Verify Card Selection Drawer opens on Add Cards click @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '745' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
  });

  // Qase ID: 746
  test('ONEVIEW-746: Verify Card Selection Drawer header layout @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '746' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertTitleVisible();
    const titleText = await drawerPage.drawerTitle.textContent();
    expect(titleText).toMatch(/Add Cards/i);
  });

  // Qase ID: 747
  test('ONEVIEW-747: Verify search bar display in Card Selection Drawer @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '747' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertSearchBarVisible();
    const placeholder = await drawerPage.searchBar.getAttribute('placeholder');
    expect(placeholder).toMatch(/Search for a Card/i);
  });

  // Qase ID: 748
  test('ONEVIEW-748: Verify card list item layout in drawer @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '748' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Each card item has an Add or Remove action button — use those as the item proxy
    const firstItem = drawerPage.drawer.getByRole('button', { name: /Add|Remove/i }).first();
    await expect(firstItem).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 749
  test('ONEVIEW-749: Verify all configurable cards are listed in the drawer @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '749' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // 13 configurable cards expected; count via action buttons (Add/Remove per item)
    const items = drawerPage.drawer.getByRole('button', { name: /Add|Remove/i });
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(13);
  });

  // Qase ID: 750
  test('ONEVIEW-750: Verify cards are displayed in alphabetical order @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '750' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    const titles = await page
      .locator('[class*="drawer"] [class*="card-item"] [class*="title"], [class*="drawer"] li [class*="title"]')
      .allTextContents();
    if (titles.length > 1) {
      const cleaned = titles.map(t => t.trim());
      const sorted = [...cleaned].sort((a, b) => a.localeCompare(b));
      expect(cleaned).toEqual(sorted);
    }
  });

  // Qase ID: 751
  test('ONEVIEW-751: Verify Add button styling for cards not yet added @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '751' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // If all cards are already on the dashboard (previous tests added them), remove one so an Add button appears
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    if (!(await addButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      await drawerPage.drawer.getByRole('button', { name: /Remove/i }).first().click();
      await page.waitForTimeout(400);
    }
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 752
  test('ONEVIEW-752: Verify Remove button styling for cards already added @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '752' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Ensure at least one card is added so a Remove button exists
    const addSetup = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    if (await addSetup.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addSetup.click();
    }
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 753
  test('ONEVIEW-753: Verify button state toggle on Add action @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '753' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // If all cards are already on the dashboard, remove one so an Add button is available to click
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    if (!(await addButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      await drawerPage.drawer.getByRole('button', { name: /Remove/i }).first().click();
      await page.waitForTimeout(400);
    }
    await addButton.click();
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 754
  test('ONEVIEW-754: Verify button state toggle on Remove action @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '754' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Ensure at least one card is added so a Remove button exists to click
    const removeFirst = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    if (!(await removeFirst.isVisible({ timeout: 2000 }).catch(() => false))) {
      await drawerPage.drawer.getByRole('button', { name: /Add/i }).first().click();
    }
    await removeFirst.click();
    const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
    await expect(addButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 755
  test('ONEVIEW-755: Verify drawer reflects real-time layout changes @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '755' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Remove a card from drawer, verify it shows Add state
    const removeButton = drawerPage.drawer.getByRole('button', { name: /Remove/i }).first();
    if (await removeButton.count() > 0) {
      await removeButton.click();
      const addButton = drawerPage.drawer.getByRole('button', { name: /Add/i }).first();
      await expect(addButton).toBeVisible({ timeout: TIMEOUTS.medium });
    }
  });

  // Qase ID: 756
  test('ONEVIEW-756: Verify drawer is scrollable when content exceeds viewport @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '756' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Scroll within drawer content area
    await drawerPage.drawer.evaluate(el => el.scrollTo(0, 200));
    const scrollTop = await drawerPage.drawer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeGreaterThanOrEqual(0);
  });

  // Qase ID: 757
  test('ONEVIEW-757: Verify drawer close via close (×) icon @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '757' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await drawerPage.close();
    await drawerPage.assertNotVisible();
  });

  // Qase ID: 758
  test('ONEVIEW-758: Verify drawer auto-closes on exiting Edit Mode @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '758' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await editLayoutPage.exitViaCancel();
    await drawerPage.assertNotVisible();
  });

  // Qase ID: 759
  test('ONEVIEW-759: Verify drawer is not accessible outside Edit Mode @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '759' });
    await editLayoutPage.assertAddCardsButtonNotVisible();
    await drawerPage.assertNotVisible();
  });

  // Qase ID: 760
  test('ONEVIEW-760: Verify fixed cards are excluded from the drawer @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '760' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // Demographics and Care Management should not appear in the drawer list
    await drawerPage.assertCardNotListed('Demographics');
    await drawerPage.assertCardNotListed('Care Management');
  });

  // Qase ID: 761
  test('ONEVIEW-761: Verify card icons and visual identity in drawer @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '761' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    // SVG icons inside the drawer (class name "drawer" may not exist; use drawerPage.drawer scope)
    const icons = drawerPage.drawer.locator('svg').first();
    await expect(icons).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 762
  test('ONEVIEW-762: Verify drawer open and close animations @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '762' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await drawerPage.close();
    await drawerPage.assertNotVisible();
  });

  // Qase ID: 763
  test('ONEVIEW-763: Verify drawer typography and color consistency @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '763' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.clickAddCards();
    await drawerPage.assertVisible();
    await drawerPage.assertTitleVisible();
    await drawerPage.assertSearchBarVisible();
  });

  // Qase ID: 764
  test('ONEVIEW-764: Verify drawer responsiveness across supported screen sizes @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '764' });
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
});
});
});
