// @ts-check
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class CardSelectionDrawerPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    // Drawer container — side panel with left border, scoped by its search input child
    this.drawer = page
      .locator('[class*="flex-col"][class*="border-l"]')
      .filter({ has: page.locator('input[placeholder*="Search"]') })
      .first();

    // Drawer title — <p> tag (not a heading) inside the drawer header
    this.drawerTitle = page
      .locator('[class*="border-l"] p')
      .filter({ hasText: /^Add Cards$/i })
      .first();

    // Close button — <div role="button" aria-label="Close"> scoped inside the drawer panel
    this.closeIcon = page
      .locator('[class*="flex-col"][class*="border-l"]')
      .filter({ has: page.locator('input[placeholder*="Search"]') })
      .locator('[aria-label="Close"]')
      .first();

    // Search bar
    this.searchBar = page
      .locator('[placeholder="Search for a Card"]')
      .or(page.locator('[class*="drawer"] input[type="search"]'))
      .or(page.locator('[class*="drawer"] input[placeholder*="Search" i]'))
      .first();
  }

  async assertVisible() {
    await expect(this.drawer).toBeVisible({ timeout: 15000 });
  }

  async assertNotVisible() {
    // Drawer slides off-screen (CSS transform) rather than being hidden via display/visibility.
    // toBeInViewport detects this correctly where not.toBeVisible() cannot.
    await expect(this.drawer).not.toBeInViewport({ timeout: 10000 });
  }

  async assertTitleVisible() {
    await expect(this.drawerTitle).toBeVisible({ timeout: 10000 });
  }

  async assertSearchBarVisible() {
    await expect(this.searchBar).toBeVisible({ timeout: 10000 });
  }

  async close() {
    await this.closeIcon.click();
  }

  async search(term) {
    await this.searchBar.fill(term);
    await this.page.waitForTimeout(500);
  }

  /** Returns the locator for a card list item by card name. */
  getCardItem(cardName) {
    return this.page
      .locator('[class*="drawer"] [class*="card-item"], [class*="drawer"] [class*="list-item"]')
      .filter({ hasText: cardName })
      .or(this.page.locator('[class*="drawer"] li').filter({ hasText: cardName }))
      .first();
  }

  /** Returns the Add button for a named card. Button text is "+ Add". */
  getAddButton(cardName) {
    return this.getCardItem(cardName).getByRole('button', { name: /Add/i });
  }

  /** Returns the Remove button for a named card. */
  getRemoveButton(cardName) {
    return this.getCardItem(cardName).getByRole('button', { name: /^Remove$/i });
  }

  async clickAdd(cardName) {
    await this.getAddButton(cardName).click();
  }

  async clickRemove(cardName) {
    await this.getRemoveButton(cardName).click();
  }

  async assertCardListed(cardName) {
    await expect(this.getCardItem(cardName)).toBeVisible({ timeout: 10000 });
  }

  async assertCardNotListed(cardName) {
    await expect(this.getCardItem(cardName)).not.toBeVisible();
  }

  async assertAddButtonVisible(cardName) {
    await expect(this.getAddButton(cardName)).toBeVisible({ timeout: 10000 });
  }

  async assertRemoveButtonVisible(cardName) {
    await expect(this.getRemoveButton(cardName)).toBeVisible({ timeout: 10000 });
  }

  async assertDrawerScrollable() {
    const drawerEl = this.drawer;
    const scrollHeight = await drawerEl.evaluate(el => el.scrollHeight);
    const clientHeight = await drawerEl.evaluate(el => el.clientHeight);
    expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
  }
}
