// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { DemographicsCard } from '../pages/cards/DemographicsCard.js';

/**
 * SMOKE TEST - Demographics Card Critical Path
 * Qase Test Management Suite: Suite 6
 */

test.use({ storageState: 'auth.json' });

test.describe('Demographics Card - Smoke Tests', () => {
  let dashboard;
  let demographicsCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    demographicsCard = new DemographicsCard(page);
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('demographics-beforeeach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 22
  test('ONEVIEW-22: Verify Demographics card loads @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '22' });
    await demographicsCard.assertVisible();
  });

  // Qase Test Case ID: 146
  test('ONEVIEW-146: Verify Demographics card loads successfully with all fields @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '146' });
    await demographicsCard.assertVisible();
    await demographicsCard.assertAllRequiredFieldsPresent();

    const locationData = page.locator('text=/city|state|[A-Z]{2}/i');
    const locationCount = await locationData.count();
    expect(locationCount).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 147
  test('ONEVIEW-147: Verify Address fields display correctly @smoke', async () => {
    test.info().annotations.push({ type: 'qaseId', description: '147' });
    try {
      await demographicsCard.assertVisible(TIMEOUTS.search);
    } catch (e) {
      await dashboard.screenshotOnFailure('demographics-card-not-visible-147.png');
      throw e;
    }
    try {
      await demographicsCard.assertAddressFieldVisible();
    } catch (e) {
      await dashboard.screenshotOnFailure('demographics-addresslabel-not-visible-147.png');
      throw new Error('Address label not visible in Demographics card');
    }
    try {
      await demographicsCard.assertCityFieldVisible();
    } catch (e) {
      await dashboard.screenshotOnFailure('demographics-citylabel-not-visible-147.png');
      throw new Error('City label not visible in Demographics card');
    }
    await demographicsCard.assertAddressDataPresent();
  });
});
