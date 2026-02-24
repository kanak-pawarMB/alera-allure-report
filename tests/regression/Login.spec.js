// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { TEST_DATA } from '../testData.js';

/**
 * Login Page Tests
 * These tests verify the login functionality of the application
 */

test.describe('Login Page - Regression @regression', () => {
  test.describe.configure({ timeout: 120000 });

  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto(TEST_DATA.urls.login, { timeout: 60000 });
  });

  test('should load the login page successfully', async ({ page }) => {
    const currentUrl = page.url();
    expect(currentUrl).toContain(TEST_DATA.urls.login);
  });

  test('should have a clickable "Login with Microsoft" button', async ({ page }) => {
    await page.waitForTimeout(TEST_DATA.timeouts.pageLoad);

    const microsoftButton = page.getByRole('button', { name: 'Login with Microsoft' });
    await expect(microsoftButton).toBeVisible();
    await expect(microsoftButton).toBeInViewport();
  });

  test('should be able to click the "Login with Microsoft" button', async ({ page }) => {
    await page.waitForTimeout(TEST_DATA.timeouts.pageLoad);

    const microsoftButton = page.getByRole('button', { name: 'Login with Microsoft' });
    await expect(microsoftButton).toBeVisible();
    await microsoftButton.click();
    await page.waitForTimeout(TEST_DATA.timeouts.pageLoad);
  });
});
