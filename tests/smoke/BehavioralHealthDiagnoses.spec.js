import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.describe('Behavioral Health Diagnoses - Smoke Tests @smoke', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000); // 3min
    
    // CRITICAL: FAIL-FAST TOKEN CHECK
    const tokenLength = process.env.MS_TOKEN ? process.env.MS_TOKEN.length : 0;
    console.log('🔑 MS_TOKEN LENGTH:', tokenLength);
    
    if (!process.env.MS_TOKEN || tokenLength < 500) {
      throw new Error(`❌ MS_TOKEN EMPTY (length: ${tokenLength}). Update GitHub secret!`);
    }

    // STEP 1: Navigate to app
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // STEP 2: INJECT TOKEN (your new one)
    await page.evaluate((token) => {
      console.log('INJECTING TOKEN...');
      
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

      // Clear + inject ALL MSAL storage
      localStorage.clear();
      sessionStorage.clear();
      
      Object.entries(tokenData).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
        sessionStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });

      // Trigger MSAL
      window.dispatchEvent(new Event('storage'));
      console.log('✅ TOKEN INJECTED');
    }, process.env.MS_TOKEN);

    // STEP 3: RELOAD (MSAL reads token)
    await page.reload({ waitUntil: 'networkidle' });
    
    // STEP 4: VERIFY DASHBOARD (not login)
    const currentUrl = page.url();
    console.log('📍 URL AFTER RELOAD:', currentUrl);
    
    if (currentUrl.includes('login') || currentUrl.includes('microsoftonline')) {
      throw new Error('❌ LOGIN PAGE - TOKEN FAILED');
    }

    // Patient search flow
    const searchBox = page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first();
    await expect(searchBox).toBeVisible({ timeout: 60000 });
    
    await searchBox.click();
    await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
    
    const searchResult = page.getByText('NC767095351|Elizabeth Garcia|12/09/');
    await expect(searchResult).toBeVisible({ timeout: 30000 });
    await searchResult.click();
    
    await page.waitForLoadState('networkidle');
  });

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
  });
});
