// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Login Page Tests
 * These tests verify the login functionality of the application
 */

test.describe('Login Page', () => {
  // Get the login URL from environment variable
  const LOGIN_URL = process.env.LOGIN_URL;

  test.beforeEach(async ({ page }) => {
    // Verify that LOGIN_URL is defined
    if (!LOGIN_URL) {
      throw new Error('LOGIN_URL environment variable is not defined. Please check your .env file.');
    }

    // Navigate to the login page before each test
    await page.goto(LOGIN_URL);
  });

  test('should load the login page successfully', async ({ page }) => {
    // Verify the page loads and contains the login URL
    const currentUrl = page.url();
    expect(currentUrl).toContain('demooneview.z20.web.core.windows.net');
  });

  test('should have a clickable "Login with Microsoft" button', async ({ page }) => {
    // Wait a moment for page to fully render
    await page.waitForTimeout(2000);

    // Locate the Microsoft login button using role-based selector
    const microsoftButton = page.getByRole('button', { name: 'Login with Microsoft' });

    // Verify the element is visible
    await expect(microsoftButton).toBeVisible();

    // Verify the element is in viewport (clickable area)
    await expect(microsoftButton).toBeInViewport();
  });

  test('should be able to click the "Login with Microsoft" button', async ({ page }) => {
    // Wait a moment for page to fully render
    await page.waitForTimeout(2000);

    // Locate the Microsoft login button using role-based selector
    const microsoftButton = page.getByRole('button', { name: 'Login with Microsoft' });

    // Verify the element is visible before clicking
    await expect(microsoftButton).toBeVisible();

    // Click the button
    await microsoftButton.click();

    // Wait for navigation or popup to occur
    await page.waitForTimeout(1000);

  });

});
