// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { EditLayoutPage } from '../pages/EditLayoutPage.js';

/**
 * SMOKE - Edit Layout (Phase-2)
 * Qase Suite: Edit Layout > Smoke - Edit Layout
 * Test Cases: ONEVIEW-843, 844, 845, 846
 */

test.use({ storageState: 'auth.json' });

test.describe('Phase-2', () => {
test.describe('Edit Layout', () => {
test.describe('Smoke - Edit Layout', () => {
  test.describe.configure({ timeout: TIMEOUTS.test });

  let editLayoutPage;

  test.beforeEach(async ({ page }) => {
    editLayoutPage = new EditLayoutPage(page);
    await editLayoutPage.goto();
  });

  // Qase ID: 838 (QASE auto-assigned; ONEVIEW title = 843)
  test('ONEVIEW-843: Verify Edit Mode can be entered via Profile menu @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '838' });
    await editLayoutPage.openProfileMenu();
    await expect(editLayoutPage.editLayoutOption).toBeVisible({ timeout: TIMEOUTS.medium });
    await editLayoutPage.editLayoutOption.click();
    await editLayoutPage.assertEditModeBannerVisible();
  });

  // Qase ID: 858 (QASE auto-assigned; ONEVIEW title = 844)
  test('ONEVIEW-844: Verify all 5 layout toggle icons are visible in Edit Mode @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '858' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.assertLayoutToggleGroupVisible();
    await expect(editLayoutPage.singleColumnIcon).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.twoColumnIcon).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.threeColumnIcon).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.layout3070Icon).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.layout7030Icon).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 845
  test('ONEVIEW-845: Verify Save and Cancel buttons appear in Edit Mode @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '845' });
    await editLayoutPage.enterEditMode();
    await expect(editLayoutPage.saveButton).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.cancelButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 846
  test('ONEVIEW-846: Verify Cancel exits Edit Mode without saving @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '846' });
    await editLayoutPage.enterEditMode();
    await editLayoutPage.assertEditModeBannerVisible();
    await editLayoutPage.exitViaCancel();
    await expect(editLayoutPage.editModeBanner).not.toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.saveButton).not.toBeVisible({ timeout: TIMEOUTS.medium });
  });
});
});
});
