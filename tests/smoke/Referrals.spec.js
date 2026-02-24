// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ReferralsCard } from '../pages/cards/ReferralsCard.js';

/**
 * SMOKE TEST - Referrals Card Critical Path
 * Qase Test Management Suite: Suite 14
 */

test.use({ storageState: 'auth.json' });

test.describe('Referrals - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let referralsCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    referralsCard = new ReferralsCard(page);
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-Referrals-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 123
  test('ONEVIEW-123: Verify Referrals Card Data Retrieval @smoke', async () => {
    await referralsCard.assertVisible();
  });

  // Qase Test Case ID: 124
  test('ONEVIEW-124: Verify Referrals Data Display @smoke', async ({ page }) => {
    await referralsCard.assertVisible();
    const dataRows = page.locator('tr, [role="row"]').filter({ has: page.locator('text=/Referral|Facility|Status/i') });
    const rowCount = await dataRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 130
  test('ONEVIEW-130: Verify "View All" Link Visibility @smoke', async ({ page }) => {
    await referralsCard.assertVisible();
    // Referrals is the 4th "View all" button on the page
    const viewAllButton = page.locator("(//button[contains(text(),'View all')])[4]");
    await expect(viewAllButton).toBeVisible({ timeout: 5000 });
    await expect(viewAllButton).toBeEnabled();
  });

  // Qase Test Case ID: 144
  test('ONEVIEW-144: Verify Responsive Design @smoke', async ({ page }) => {
    await referralsCard.assertVisible();
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await referralsCard.assertVisible();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await referralsCard.assertVisible();
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10);
  });
});
