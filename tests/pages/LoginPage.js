// @ts-check
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { TEST_DATA } from '../testData.js';

export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.microsoftLoginButton = page.getByRole('button', { name: /Login with Microsoft/i });
  }

  async goto() {
    await this.navigate(TEST_DATA.urls.login);
  }

  async assertPageLoaded() {
    await expect(this.page).toHaveURL(/qa\.oneview\.alerahealth\.com\/login/i);
    await expect(this.microsoftLoginButton).toBeVisible({ timeout: 10000 });
  }

  async clickMicrosoftLogin() {
    await this.microsoftLoginButton.click();
  }
}
