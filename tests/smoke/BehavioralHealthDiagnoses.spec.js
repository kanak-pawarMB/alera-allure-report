// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.describe('Behavioral Health Diagnoses - Smoke Tests @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // TOKEN INJECTION FROM GITHUB SECRET
    await page.addInitScript(() => {
      const token = process.env.MS_TOKEN;
      if (token) {
        const tokenData = {
          idToken: token,
          accessToken: token,
          account: {
            username: "kanak.pawar@mindbowser.com",
            name: "Kanak Pawar",
            localAccountId: "dr9dAb24ipxCHkGQZhTe8uLPQiHXEvj7B7LszqvbAvo",
            tenantId: "08a4eb8b-a310-46b8-8157-425a0241bcf5",
            clientId: "110de466-b599-4380-b2bf-8380474aa63c"
          }
        };
        
        ['localStorage', 'sessionStorage'].forEach(storage => {
          Object.entries(tokenData).forEach(([key, value]) => {
            window[storage].setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
          });
        });
        
        window.msalInstance = {
          getAllAccounts: () => [tokenData.account],
          getActiveAccount: () => tokenData.account
        };
      }
    });

    // Navigate to dashboard (no login needed)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // Rest of your beforeEach unchanged...
    const searchBox = page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first();
    await expect(searchBox).toBeVisible({ timeout: 60000 });
    await expect(searchBox).toBeEnabled({ timeout: 30000 });

    await searchBox.click();
    await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);

    const searchResult = page.getByText('NC767095351|Elizabeth Garcia|12/09/');
    await expect(searchResult).toBeVisible({ timeout: 30000 });
    await searchResult.click();

    await page.waitForLoadState('networkidle', { timeout: 30000 });
  });

  // Your existing test unchanged...
  test('ONEVIEW-323: Verify read-only data behavior @smoke', async ({ page }) => {
    test.setTimeout(120000);
    const card = page.locator('text=/Behavioral Health Diagnoses|Mental Health|Behavioral/i').first();
    await expect(card).toBeVisible({ timeout: 30000 });

    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    expect(cardText.length).toBeGreaterThan(0);

    const editableElements = card.locator('[contenteditable="true"]');
    const editableCount = await editableElements.count();
    expect(editableCount).toBe(0);

    const isVisible = await card.isVisible();
    expect(isVisible).toBeTruthy();
  });
});
