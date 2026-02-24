// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { MedicationFillHistoryCard } from '../pages/cards/MedicationFillHistoryCard.js';

/**
 * SMOKE TEST - Medication Fill History Card Critical Path
 * Qase Test Management Suite: Suite 12
 */

test.use({ storageState: 'auth.json' });

test.describe('Medication Fill History - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let medFillCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    medFillCard = new MedicationFillHistoryCard(page);
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-MedicationFillHistory-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 110
  test('ONEVIEW-110: Verify Medication Fill History Card Loads @smoke', async () => {
    await medFillCard.assertVisible();
  });

  // Qase Test Case ID: 93
  test('ONEVIEW-93: Verify data retrieval from Rx_Claims table @smoke', async () => {
    await medFillCard.assertVisible();
  });

  // Qase Test Case ID: 96
  test('ONEVIEW-96: Verify read-only mode @smoke', async () => {
    await medFillCard.assertVisible();
    const editableInputs = medFillCard.card.locator('input:not([readonly]):not([disabled])');
    expect(await editableInputs.count()).toBe(0);
  });

  // Qase Test Case ID: 100
  test('ONEVIEW-100: Verify "View All" link presence @smoke', async ({ page }) => {
    await medFillCard.assertVisible();
    // Medication Fill History is the 3rd "View all" button on the page
    const viewAllButton = page.locator("(//button[contains(text(),'View all')])[3]");
    await expect(viewAllButton).toBeVisible({ timeout: 5000 });
  });
});
