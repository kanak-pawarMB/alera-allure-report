// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { PCPCard } from '../pages/cards/PCPCard.js';

/**
 * SMOKE TEST - PCP Card Critical Path
 * Qase Test Management Suite: Suite 7
 */

test.use({ storageState: 'auth.json' });

test.describe('PCP Card - Smoke Tests', () => {

  let dashboard;
  let pcpCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    pcpCard = new PCPCard(page);
    await dashboard.goto();
    try {
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('pcp-beforeeach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 50
  test('ONEVIEW-50: Verify PCP card loads @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '50' });
    await pcpCard.assertVisible();
  });

  // Qase Test Case ID: 155
  test('ONEVIEW-155: Verify PCP card loads successfully with all fields @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '155' });
    await pcpCard.assertVisible();
    await pcpCard.assertNameFieldVisible();
    await pcpCard.assertPhoneFieldVisible();
    await pcpCard.assertAddressFieldVisible();
    await pcpCard.assertCityFieldVisible();

    const locationData = page.locator('text=/city|state|[A-Z]{2}/i');
    const locationCount = await locationData.count();
    expect(locationCount).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 156
  test('ONEVIEW-156: Verify PCP Address fields visibility @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '156' });
    await pcpCard.assertVisible();
    await pcpCard.assertAddressFieldVisible();

    const addressData = page.locator('[class*="address"]')
      .or(page.locator('p, span, div').filter({ hasText: /\d+\s+[A-Za-z]+/ }));
    const addressCount = await addressData.count();
    expect(addressCount).toBeGreaterThan(0);

    const address2 = page.locator(':text("Address 2")');
    const address2Count = await address2.count();
    console.log(`Address fields found: ${addressCount}, Address 2 fields: ${address2Count}`);
  });
});
