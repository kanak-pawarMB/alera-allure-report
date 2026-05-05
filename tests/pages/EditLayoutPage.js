// @ts-check
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { TEST_DATA } from '../testData.js';

export class EditLayoutPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    // Profile avatar / menu trigger — top-right user button (initials + name + chevron)
    this.profileAvatar = page
      .locator('[data-testid="profile-avatar"]')
      .or(page.locator('[aria-haspopup="menu"]').last())
      .or(page.locator('[aria-haspopup="true"]').last())
      .or(page.locator('[class*="userMenu"], [class*="user-menu"], [class*="profileMenu"], [class*="profile-menu"]').first())
      .or(page.locator('[class*="avatar"]').first())
      .or(page.locator('[aria-label*="profile" i]').first())
      .or(page.locator('header button').last())
      .first();

    // Profile dropdown options
    this.editLayoutOption = page
      .getByRole('menuitem', { name: /Edit Layout/i })
      .or(page.getByRole('button', { name: /Edit Layout/i }))
      .or(page.getByText('Edit Layout', { exact: true }))
      .first();

    this.darkModeToggle = page
      .getByRole('menuitem', { name: /Dark Mode/i })
      .or(page.getByText('Dark Mode', { exact: true }))
      .first();

    this.logoutOption = page
      .getByRole('menuitem', { name: /Logout/i })
      .or(page.getByText('Logout', { exact: true }))
      .first();

    // Edit Mode info banner
    this.editModeBanner = page
      .locator('[class*="banner"]').filter({ hasText: /Edit Mode active/i })
      .or(page.locator('[class*="info"]').filter({ hasText: /Edit Mode active/i }))
      .or(page.locator('[class*="alert"]').filter({ hasText: /Edit Mode active/i }))
      .first();

    // Edit Dashboard header controls
    this.saveButton = page
      .getByRole('button', { name: /Save/i })
      .first();

    this.cancelButton = page
      .getByRole('button', { name: /^Cancel$/i })
      .first();

    this.addCardsButton = page
      .getByRole('button', { name: /Add Cards/i })
      .first();

    this.restoreLayoutDropdown = page
      .getByRole('button', { name: /Restore Layout/i })
      .or(page.locator('[class*="restore-layout"]').first())
      .first();

    // Layout toggle group — the bordered box containing the 5 column-layout icon pickers.
    // Each icon is a <div data-state="closed"> (Radix Tooltip wrapper) inside this container.
    const iconContainer = page
      .locator('[class*="border-grey-300"], [class*="border-grey-600"]')
      .filter({ has: page.locator('[data-state]') })
      .first();

    this.layoutToggleGroup = iconContainer;

    // Individual icons — scoped to the container, indexed by position (0-4)
    this.singleColumnIcon = iconContainer.locator('[data-state]').nth(0);
    this.twoColumnIcon    = iconContainer.locator('[data-state]').nth(1);
    this.threeColumnIcon  = iconContainer.locator('[data-state]').nth(2);
    this.layout3070Icon   = iconContainer.locator('[data-state]').nth(3);
    this.layout7030Icon   = iconContainer.locator('[data-state]').nth(4);

    // Fixed cards (always visible, cannot be moved or removed)
    this.demographicsCard = page
      .locator('[data-testid*="demographics"]')
      .or(page.locator('[class*="card"]').filter({ hasText: /Demographics/i }))
      .or(page.getByText(/^Demographics/i).first())
      .first();

    this.careManagementCard = page
      .locator('[data-testid*="care-management"]')
      .or(page.locator('[class*="card"]').filter({ hasText: /Care Management/i }))
      .or(page.getByText(/^Care Management/i).first())
      .first();

    // Fixed badge on non-editable cards in Edit Mode
    this.fixedBadge = page
      .locator('[class*="fixed-badge"], [class*="badge"]').filter({ hasText: /^Fixed$/i })
      .or(page.getByText('Fixed', { exact: true }))
      .first();

    // Empty column drop-zone placeholder (text varies by app version)
    this.emptyColumnPlaceholder = page
      .locator('text=/Drag a Card to the column/i')
      .or(page.locator('text=/Drop a card here/i'))
      .or(page.locator('text=/No cards/i'))
      .or(page.locator('[class*="empty-col"], [class*="emptyCol"], [class*="drop-zone"], [class*="dropzone"], [class*="empty"][class*="column"]'))
      .first();

    // Star / favourite icon on card headers (should NOT be visible in Phase-2)
    this.starIcon = page
      .locator('[class*="star"], [data-icon="star"], [aria-label*="star" i]')
      .first();
  }

  async goto() {
    await this.navigate(TEST_DATA.urls.dashboard);
    await this.assertNotRedirectedToLogin();
    await this._waitForAuthOverlay();
  }

  async openProfileMenu() {
    await this._waitForAuthOverlay();
    await this.profileAvatar.waitFor({ state: 'visible', timeout: 20000 });
    await this.profileAvatar.click();
  }

  async enterEditMode() {
    await this.openProfileMenu();
    await this.editLayoutOption.waitFor({ state: 'visible', timeout: 10000 });
    await this.editLayoutOption.click();
    // Wait for the Edit Mode banner — confirms the UI has fully mounted
    await this.editModeBanner.waitFor({ state: 'visible', timeout: 15000 });
  }

  async exitViaCancel() {
    await this.cancelButton.click();
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async clickAddCards() {
    await this.addCardsButton.click();
  }

  async selectSingleColumnLayout() {
    await this.singleColumnIcon.locator('> div').first().dispatchEvent('click');
    await this.page.waitForTimeout(400);
  }

  async selectTwoColumnLayout() {
    await this.twoColumnIcon.locator('> div').first().dispatchEvent('click');
    await this.page.waitForTimeout(400);
  }

  async selectThreeColumnLayout() {
    await this.threeColumnIcon.locator('> div').first().dispatchEvent('click');
    await this.page.waitForTimeout(400);
  }

  async select3070Layout() {
    await this.layout3070Icon.locator('> div').first().dispatchEvent('click');
    await this.page.waitForTimeout(400);
  }

  async select7030Layout() {
    await this.layout7030Icon.locator('> div').first().dispatchEvent('click');
    await this.page.waitForTimeout(400);
  }

  async openRestoreLayoutDropdown() {
    await this.restoreLayoutDropdown.click();
  }

  async assertEditModeBannerVisible() {
    await expect(this.editModeBanner).toBeVisible({ timeout: 15000 });
  }

  async assertSaveButtonDisabled() {
    await expect(this.saveButton).toBeDisabled({ timeout: 10000 });
  }

  async assertSaveButtonEnabled() {
    await expect(this.saveButton).toBeEnabled({ timeout: 10000 });
  }

  async assertAddCardsButtonVisible() {
    await expect(this.addCardsButton).toBeVisible({ timeout: 10000 });
  }

  async assertAddCardsButtonNotVisible() {
    await expect(this.addCardsButton).not.toBeVisible();
  }

  async assertFixedBadgeVisible() {
    await expect(this.fixedBadge).toBeVisible({ timeout: 10000 });
  }

  async assertEmptyColumnPlaceholderVisible() {
    await expect(this.emptyColumnPlaceholder).toBeVisible({ timeout: 15000 });
  }

  async assertLayoutToggleGroupVisible() {
    // Try the container first; fall back to checking the first individual icon
    const groupFound = await this.layoutToggleGroup.isVisible({ timeout: 3000 }).catch(() => false);
    if (!groupFound) {
      await expect(this.singleColumnIcon).toBeVisible({ timeout: 10000 });
    } else {
      await expect(this.layoutToggleGroup).toBeVisible();
    }
  }

  async assertProfileMenuContainsOptions() {
    await expect(this.darkModeToggle).toBeVisible({ timeout: 10000 });
    await expect(this.editLayoutOption).toBeVisible({ timeout: 10000 });
    await expect(this.logoutOption).toBeVisible({ timeout: 10000 });
  }
}
