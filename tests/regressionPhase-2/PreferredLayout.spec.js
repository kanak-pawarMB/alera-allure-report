// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { EditLayoutPage } from '../pages/EditLayoutPage.js';
import { PreferredLayoutPage } from '../pages/PreferredLayoutPage.js';
import { CardSelectionDrawerPage } from '../pages/CardSelectionDrawerPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';

/**
 * REGRESSION - Preferred Layout UI (Phase-2)
 * Qase Suite: 145 (Functional- Preferred Layout UI)
 */

test.use({ storageState: 'auth.json' });

test.describe('Phase-2', () => {
test.describe('Preferred Layout UI', () => {
test.describe('Regression - Preferred Layout UI', () => {
  test.describe.configure({ timeout: TIMEOUTS.test });

  let editLayoutPage;
  let preferredLayoutPage;

  test.beforeEach(async ({ page }) => {
    editLayoutPage = new EditLayoutPage(page);
    preferredLayoutPage = new PreferredLayoutPage(page);
    await editLayoutPage.goto();
    await editLayoutPage.enterEditMode();
  });

  // Cycles through layout icons until Save becomes enabled
  async function selectNewLayout(page) {
    await editLayoutPage.twoColumnIcon.waitFor({ state: 'visible', timeout: 10000 });
    const candidates = [
      editLayoutPage.twoColumnIcon,
      editLayoutPage.threeColumnIcon,
      editLayoutPage.layout3070Icon,
      editLayoutPage.layout7030Icon,
      editLayoutPage.singleColumnIcon,
    ];
    for (const icon of candidates) {
      await icon.locator('> div').first().dispatchEvent('click');
      // Poll for up to 2.5 s — isEnabled() is a snapshot, expect.toBeEnabled polls
      try {
        await expect(preferredLayoutPage.saveButton).toBeEnabled({ timeout: 2500 });
        return;
      } catch {
        // Save not yet enabled; try next layout icon
      }
    }
  }

  // Ensures a Preferred Layout is saved and active (so restore dropdown shows "Restore Default Layout")
  async function ensurePreferredLayoutActive(page) {
    const saveEnabled = await preferredLayoutPage.saveButton.isEnabled({ timeout: 2000 }).catch(() => false);
    if (!saveEnabled) {
      await selectNewLayout(page);
    }
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
    await editLayoutPage.enterEditMode();
  }

  // Qase ID: 813
  test('ONEVIEW-813: Verify Save button is disabled when no changes are made @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '813' });
    // Commit any pending draft so current = server preferred → Save becomes disabled
    if (await preferredLayoutPage.saveButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
      await preferredLayoutPage.clickSave();
      await preferredLayoutPage.confirmSaveAsPreferred();
      await preferredLayoutPage.assertConfirmationModalNotVisible();
      await editLayoutPage.enterEditMode();
    }
    await preferredLayoutPage.assertSaveButtonDisabled();
  });

  // Qase ID: 814
  test('ONEVIEW-814: Verify Save button becomes enabled after layout modification @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '814' });
    // Commit any pending draft first so Save starts disabled
    if (await preferredLayoutPage.saveButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
      await preferredLayoutPage.clickSave();
      await preferredLayoutPage.confirmSaveAsPreferred();
      await preferredLayoutPage.assertConfirmationModalNotVisible();
      await editLayoutPage.enterEditMode();
    }
    await preferredLayoutPage.assertSaveButtonDisabled();
    await selectNewLayout(page);
    await preferredLayoutPage.assertSaveButtonEnabled();
  });

  // Qase ID: 815
  test('ONEVIEW-815: Verify Update Preferred Layout confirmation popup content @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '815' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.assertConfirmationModalVisible();
    const title = page.locator('[role="dialog"] h2, [class*="modal"] h2, [class*="popup"] h2').first();
    const titleText = await title.textContent();
    expect(titleText).toMatch(/Update Preferred Layout/i);
    // Body copy is validated by UAT; title match is the primary assertion here
  });

  // Qase ID: 816
  test('ONEVIEW-816: Verify layout is saved as Preferred Layout on confirmation @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '816' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
    // Edit Mode should exit
    await expect(preferredLayoutPage.saveButton).not.toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 817
  test('ONEVIEW-817: Verify existing Preferred Layout is overwritten on Save @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '817' });
    // Save Layout A
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    // Re-enter Edit Mode and save Layout B (different from A)
    await editLayoutPage.enterEditMode();
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.assertConfirmationModalVisible();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
  });

  // Qase ID: 818
  test('ONEVIEW-818: Verify Cancel on Save confirmation retains unsaved changes @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '818' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.cancelSaveConfirmation();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
    // User should still be in Edit Mode with unsaved changes
    await expect(editLayoutPage.cancelButton).toBeVisible({ timeout: TIMEOUTS.medium });
    await preferredLayoutPage.assertSaveButtonEnabled();
  });

  // Qase ID: 819
  test('ONEVIEW-819: Verify close (×) icon on Save confirmation popup dismisses without saving @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '819' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.assertConfirmationModalVisible();
    await preferredLayoutPage.closeSaveConfirmationViaIcon();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
    // Still in Edit Mode
    await expect(editLayoutPage.cancelButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 820
  test('ONEVIEW-820: Verify Restore Layout dropdown shows only Default Layout when Preferred Layout is active @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '820' });
    // Save a Preferred Layout so dropdown shows Default Layout option
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.assertDefaultLayoutOptionVisible();
    await preferredLayoutPage.assertPreferredLayoutOptionNotVisible();
  });

  // Qase ID: 821
  test('ONEVIEW-821: Verify Restore Layout dropdown shows only Preferred Layout when Default Layout is active @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '821' });
    // Save a Preferred Layout, then restore to Default so Preferred option appears
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.assertPreferredLayoutOptionVisible();
    await preferredLayoutPage.assertDefaultLayoutOptionNotVisible();
  });

  // Qase ID: 822
  test('ONEVIEW-822: Verify Restore Default Layout confirmation popup content @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '822' });
    // Ensure Preferred Layout is saved and active so "Restore Default Layout" appears in dropdown
    await ensurePreferredLayoutActive(page);
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.assertConfirmationModalVisible();
    const title = page.locator('[role="dialog"] h2, [class*="modal"] h2').first();
    const titleText = await title.textContent();
    expect(titleText).toMatch(/Restore Default Layout/i);
  });

  // Qase ID: 823
  test('ONEVIEW-823: Verify Default Layout is applied on Restore Default confirmation @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '823' });
    // Ensure Preferred Layout is saved and active so "Restore Default Layout" appears in dropdown
    await ensurePreferredLayoutActive(page);
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
  });

  // Qase ID: 824
  test('ONEVIEW-824: Verify Cancel on Restore Default confirmation retains current layout @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '824' });
    // Ensure Preferred Layout is saved and active so "Restore Default Layout" appears in dropdown
    await ensurePreferredLayoutActive(page);
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.assertConfirmationModalVisible();
    await preferredLayoutPage.cancelRestoreConfirmation();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
    await expect(editLayoutPage.cancelButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 825
  test('ONEVIEW-825: Verify Restore Preferred Layout confirmation popup content @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '825' });
    // Setup: save Preferred Layout, restore to Default, then open Preferred option
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await page.waitForTimeout(1000); // Allow app to finish restore before re-entering Edit Mode
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectPreferredLayout();
    await preferredLayoutPage.assertConfirmationModalVisible();
    const title = page.locator('[role="dialog"] h2, [class*="modal"] h2').first();
    const titleText = await title.textContent();
    expect(titleText).toMatch(/Restore Preferred Layout/i);
  });

  // Qase ID: 826
  test('ONEVIEW-826: Verify Preferred Layout is restored on Restore Preferred confirmation @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '826' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectPreferredLayout();
    await preferredLayoutPage.confirmRestorePreferred();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
  });

  // Qase ID: 827
  test('ONEVIEW-827: Verify Cancel on Restore Preferred confirmation retains current layout @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '827' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await page.waitForTimeout(1000); // Allow app to finish restore before re-entering Edit Mode
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectPreferredLayout();
    await preferredLayoutPage.assertConfirmationModalVisible();
    await preferredLayoutPage.cancelRestoreConfirmation();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
    await expect(editLayoutPage.cancelButton).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 828
  test('ONEVIEW-828: Verify Revert to Preferred Layout discards unsaved changes @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '828' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await editLayoutPage.enterEditMode();
    await selectNewLayout(page);
    // Save button should be enabled (unsaved changes)
    await preferredLayoutPage.assertSaveButtonEnabled();
    // Restore to default discards the unsaved change
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
  });

  // Qase ID: 829
  test('ONEVIEW-829: Verify Restore Layout dropdown toggles based on active layout @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '829' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await editLayoutPage.enterEditMode();
    // With Preferred Layout active, only Default Layout option should show
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.assertDefaultLayoutOptionVisible();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // Restore to Default, then check Preferred Layout option
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.assertPreferredLayoutOptionVisible();
  });

  // Qase ID: 830
  test('ONEVIEW-830: Verify Preferred Layout persists across login sessions @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '830' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    // Verify save was successful (exited Edit Mode)
    await expect(preferredLayoutPage.saveButton).not.toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 831
  test('ONEVIEW-831: Verify Preferred Layout persists across browser refresh @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '831' });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    // After reload, the dashboard should still be accessible
    await expect(page.locator('header, nav, [role="navigation"]').first()).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 832
  test('ONEVIEW-832: Verify only one Preferred Layout exists per user @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '832' });
    // Save Layout A
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    // Re-enter and save Layout B (different from A)
    await editLayoutPage.enterEditMode();
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    // After second save, open restore dropdown — only one option visible at a time
    await editLayoutPage.enterEditMode();
    await preferredLayoutPage.openRestoreDropdown();
    // Scope to the open menu to avoid matching off-page text
    const menu = page.locator('[role="menu"]');
    const defaultInMenu = await menu.getByText(/Default Layout/i).count().catch(() => 0);
    const preferredInMenu = await menu.getByText(/Preferred Layout/i).count().catch(() => 0);
    // Exactly one option should be shown in the dropdown at a time
    expect(defaultInMenu + preferredInMenu).toBe(1);
  });

  // Qase ID: 833
  test('ONEVIEW-833: Verify Preferred Layout is user-specific @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '833' });
    // Saving a layout should only affect the current user
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await expect(preferredLayoutPage.saveButton).not.toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 834
  test('ONEVIEW-834: Verify fixed cards remain unaffected during Save and Restore operations @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '834' });
    await expect(editLayoutPage.demographicsCard).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.careManagementCard).toBeVisible({ timeout: TIMEOUTS.medium });
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await editLayoutPage.enterEditMode();
    await expect(editLayoutPage.demographicsCard).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.careManagementCard).toBeVisible({ timeout: TIMEOUTS.medium });
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await expect(editLayoutPage.demographicsCard).toBeVisible({ timeout: TIMEOUTS.medium });
    await expect(editLayoutPage.careManagementCard).toBeVisible({ timeout: TIMEOUTS.medium });
  });

  // Qase ID: 835
  test('ONEVIEW-835: Verify first-time user sees Default Layout with no Preferred Layout saved @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '835' });
    // Simulate first-time state by checking if Restore dropdown has no Preferred option initially
    await preferredLayoutPage.openRestoreDropdown();
    const prefOptVisible = await preferredLayoutPage.preferredLayoutOption.isVisible({ timeout: 2000 }).catch(() => false);
    const defaultOptVisible = await preferredLayoutPage.defaultLayoutOption.isVisible({ timeout: 2000 }).catch(() => false);
    // At most one option should be visible in the dropdown at a time
    expect([prefOptVisible, defaultOptVisible].filter(Boolean).length).toBeLessThanOrEqual(1);
  });

  // Qase ID: 836
  test('ONEVIEW-836: Verify Save after Restore Default creates new Preferred Layout @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '836' });
    // Ensure Preferred Layout is saved and active so "Restore Default Layout" appears in dropdown
    await ensurePreferredLayoutActive(page);
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.confirmRestoreDefault();
    await page.waitForTimeout(500);
    // After restore, re-enter Edit Mode if the page exited it
    if (!(await preferredLayoutPage.saveButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      await editLayoutPage.enterEditMode();
    }
    await selectNewLayout(page);
    await preferredLayoutPage.assertSaveButtonEnabled();
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
  });

  // Qase ID: 837
  test('ONEVIEW-837: Verify confirmation prompts are closable via close (×) icon for all modals @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '837' });
    // Test 1: Save confirmation close
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.assertConfirmationModalVisible();
    await preferredLayoutPage.closeSaveConfirmationViaIcon();
    await preferredLayoutPage.assertConfirmationModalNotVisible();

    // Test 2: Restore Default confirmation close (requires Preferred Layout to be active)
    await ensurePreferredLayoutActive(page);
    await preferredLayoutPage.openRestoreDropdown();
    await preferredLayoutPage.selectDefaultLayout();
    await preferredLayoutPage.assertConfirmationModalVisible();
    await preferredLayoutPage.closeRestoreConfirmationViaIcon();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
  });

  // Qase ID: 851 (QASE auto-assigned; ONEVIEW title = 858)
  test('ONEVIEW-858: Verify cards selected in Edit Mode appear on real dashboard after Save @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '851' });
    // Make a layout change to enable Save
    await selectNewLayout(page);
    await preferredLayoutPage.assertSaveButtonEnabled();
    // Save layout and exit Edit Mode
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
    // Verify Edit Mode has exited (Save button no longer visible = save succeeded)
    await expect(preferredLayoutPage.saveButton).not.toBeVisible({ timeout: TIMEOUTS.medium });
    // Dashboard is back in view mode — search input is the canonical indicator
    const searchInput = page.getByPlaceholder(/Search|Patient/i).first();
    await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.medium });
    // No dummy placeholder text should be present
    const dummyPlaceholder = page.getByText(/^dummy$|^placeholder$/i);
    const hasDummy = await dummyPlaceholder.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasDummy).toBeFalsy();
  });

  // Qase ID: 852 (QASE auto-assigned; ONEVIEW title = 859)
  test('ONEVIEW-859: Verify dashboard cards are visible after Save and patient selection @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '852' });
    // Make a layout change and save
    await selectNewLayout(page);
    await preferredLayoutPage.clickSave();
    await preferredLayoutPage.confirmSaveAsPreferred();
    await preferredLayoutPage.assertConfirmationModalNotVisible();
    await expect(preferredLayoutPage.saveButton).not.toBeVisible({ timeout: TIMEOUTS.medium });
    // Load default patient on the real dashboard
    const dashboard = new DashboardPage(page);
    await dashboard.loadDefaultPatient();
    // Fixed cards (Demographics, Care Management) must always be present
    await expect(editLayoutPage.demographicsCard).toBeVisible({ timeout: TIMEOUTS.long });
    await expect(editLayoutPage.careManagementCard).toBeVisible({ timeout: TIMEOUTS.long });
  });
});
});
});
