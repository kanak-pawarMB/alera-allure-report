// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * SMOKE TEST - Referrals Modal Drill Down
 * XPath for View All button: (//button[contains(text(),'View all')])[4]
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Referrals - Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Search and select patient
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
  });

  // ===================== ONEVIEW-417 =====================
  test('ONEVIEW-417: Smoke_Validate opening of modal on clicking “View All” @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '417' });
    await page.locator("(//button[contains(text(),'View all')])[4]").click();
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
    await expect(modal.first()).toContainText(/Referral|Sending Facility|Receiving Facility|Referral Type|Timeline|Search/i);
    // Timeline filter and search bar should be visible
    await expect(modal.getByRole('textbox').first()).toBeVisible();
    await expect(modal.getByRole('button', { name: /All Time|Timeline|Date Range/i }).first()).toBeVisible();
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(modal.first()).not.toBeVisible();
  });
  // ===================== ONEVIEW-142 =====================
  test('ONEVIEW-142: Smoke_Verify Scroll Functionality @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '142' });
    // Open modal by clicking View All link for Referrals
    await page.locator("(//button[contains(text(),'View all')])[4]").click();
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
    // Wait longer for modal after first test
    await expect(modal.first()).toBeVisible({ timeout: 10000 });
    // Scroll inside modal
    await modal.evaluate(node => { node.scrollTop = node.scrollHeight; });
    await expect(modal.first()).toBeVisible();
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(modal.first()).not.toBeVisible();
  });

});
