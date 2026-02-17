// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * Login Page Tests
 * These tests verify the login functionality of the application
 */

test.describe('Login Page - Regression @regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto(TEST_DATA.urls.login, { timeout: 60000 });
  });

  test('should load the login page successfully', async ({ page }) => {
    // Verify the page loads and contains the login URL
    const currentUrl = page.url();
    expect(currentUrl).toContain(TEST_DATA.urls.login);
  });

  test('should have a clickable "Login with Microsoft" button', async ({ page }) => {
    // Wait a moment for page to fully render
    await page.waitForTimeout(TEST_DATA.timeouts.pageLoad);

    // Locate the Microsoft login button using role-based selector
    const microsoftButton = page.getByRole('button', { name: 'Login with Microsoft' });

    // Verify the element is visible
    await expect(microsoftButton).toBeVisible();

    // Verify the element is in viewport (clickable area)
    await expect(microsoftButton).toBeInViewport();
  });

  test('should be able to click the "Login with Microsoft" button', async ({ page }) => {
    // Wait a moment for page to fully render
    await page.waitForTimeout(TEST_DATA.timeouts.pageLoad);

    // Locate the Microsoft login button using role-based selector
    const microsoftButton = page.getByRole('button', { name: 'Login with Microsoft' });

    // Verify the element is visible before clicking
    await expect(microsoftButton).toBeVisible();

    // Click the button
    await microsoftButton.click();

    // Wait for navigation or popup to occur
    await page.waitForTimeout(TEST_DATA.timeouts.pageLoad);

  });

});
