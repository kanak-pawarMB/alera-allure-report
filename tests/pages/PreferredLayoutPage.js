// @ts-check
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class PreferredLayoutPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    // Edit Mode action buttons — Save renders as "✓ Save" so use unanchored match
    this.saveButton = page
      .getByRole('button', { name: /Save/i })
      .first();

    this.cancelButton = page
      .getByRole('button', { name: /^Cancel$/i })
      .first();

    // Restore Layout dropdown trigger
    this.restoreLayoutDropdown = page
      .getByRole('button', { name: /Restore Layout/i })
      .or(page.locator('[class*="restore-layout"]').first())
      .first();

    // Restore Layout dropdown options
    this.defaultLayoutOption = page
      .getByRole('menuitem', { name: /Default Layout/i })
      .or(page.getByRole('option', { name: /Default Layout/i }))
      .or(page.getByText(/Default Layout/i))
      .first();

    this.preferredLayoutOption = page
      .getByRole('menuitem', { name: /Preferred Layout/i })
      .or(page.getByRole('option', { name: /Preferred Layout/i }))
      .or(page.getByText(/Preferred Layout/i))
      .first();

    // Confirmation popup / modal container
    this.confirmationModal = page
      .locator('[role="dialog"]')
      .or(page.locator('[class*="modal"]'))
      .or(page.locator('[class*="popup"]'))
      .first();

    // Confirmation popup action buttons
    this.saveAsPreferredButton = page
      .getByRole('button', { name: /Save as Preferred Layout/i })
      .first();

    this.restoreDefaultButton = page
      .getByRole('button', { name: /Restore Default Layout/i })
      .first();

    this.restorePreferredButton = page
      .getByRole('button', { name: /Restore Preferred Layout/i })
      .first();

    this.popupCancelButton = page
      .locator('[role="dialog"] button').filter({ hasText: /^Cancel$/i })
      .or(page.locator('[class*="modal"] button').filter({ hasText: /^Cancel$/i }))
      .first();

    this.popupCloseIcon = page
      .locator('[role="dialog"] [aria-label*="close" i]')
      .or(page.locator('[role="dialog"] button').filter({ hasText: '×' }))
      .or(page.locator('[role="dialog"] [class*="close"]').first())
      .first();
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async confirmSaveAsPreferred() {
    await this.saveAsPreferredButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async cancelSaveConfirmation() {
    await this.popupCancelButton.click();
  }

  async closeSaveConfirmationViaIcon() {
    await this.popupCloseIcon.click();
  }

  async openRestoreDropdown() {
    await this.restoreLayoutDropdown.click();
    await this.page.waitForTimeout(400);
  }

  async selectDefaultLayout() {
    await this.defaultLayoutOption.waitFor({ state: 'visible', timeout: 10000 });
    await this.defaultLayoutOption.click();
  }

  async selectPreferredLayout() {
    // Scope the click to the open dropdown menu to avoid matching broad page text
    const menu = this.page.locator('[role="menu"]').or(this.page.locator('[role="listbox"]')).first();
    const menuVisible = await menu.isVisible({ timeout: 3000 }).catch(() => false);
    if (menuVisible) {
      const item = menu.getByRole('menuitem', { name: /Preferred Layout/i })
        .or(menu.getByText(/Preferred Layout/i)).first();
      await item.waitFor({ state: 'visible', timeout: 10000 });
      await item.click();
    } else {
      await this.preferredLayoutOption.waitFor({ state: 'visible', timeout: 10000 });
      await this.preferredLayoutOption.click();
    }
  }

  async confirmRestoreDefault() {
    await this.restoreDefaultButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async confirmRestorePreferred() {
    await this.restorePreferredButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async cancelRestoreConfirmation() {
    await this.popupCancelButton.click();
  }

  async closeRestoreConfirmationViaIcon() {
    await this.popupCloseIcon.click();
  }

  async assertSaveButtonDisabled() {
    await expect(this.saveButton).toBeDisabled({ timeout: 10000 });
  }

  async assertSaveButtonEnabled() {
    await expect(this.saveButton).toBeEnabled({ timeout: 10000 });
  }

  async assertConfirmationModalVisible() {
    await expect(this.confirmationModal).toBeVisible({ timeout: 10000 });
  }

  async assertConfirmationModalNotVisible() {
    await expect(this.confirmationModal).not.toBeVisible({ timeout: 10000 });
  }

  async assertRestoreDropdownVisible() {
    await expect(this.restoreLayoutDropdown).toBeVisible({ timeout: 10000 });
  }

  async assertDefaultLayoutOptionVisible() {
    await expect(this.defaultLayoutOption).toBeVisible({ timeout: 10000 });
  }

  async assertDefaultLayoutOptionNotVisible() {
    await expect(this.defaultLayoutOption).not.toBeVisible();
  }

  async assertPreferredLayoutOptionVisible() {
    await expect(this.preferredLayoutOption).toBeVisible({ timeout: 10000 });
  }

  async assertPreferredLayoutOptionNotVisible() {
    await expect(this.preferredLayoutOption).not.toBeVisible();
  }
}
