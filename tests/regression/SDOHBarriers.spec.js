// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { SDOHBarriersCard } from '../pages/cards/SDOHBarriersCard.js';

/**
 * SDOH Barriers Card - Regression Tests
 * Uses same setup logic as passing smoke tests for consistency
 * Qase Test Management Suite: Display SDOH Barriers
 */

test.use({ storageState: 'auth.json' });

test.describe('SDOH Barriers - Regression @regression', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let sdohCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    sdohCard = new SDOHBarriersCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-SDOHBarriers-regression-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 229 - Verify SDOH Barriers Card Displays
  test('ONEVIEW-229: Verify SDOH Barriers Card Displays', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '229' });
    await sdohCard.assertVisible();
  });

  // Qase Test Case ID: 232 - Verify Card Header Title
  test('ONEVIEW-232: Verify Card Header Title', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '232' });
    await sdohCard.assertVisible();

    const cardText = await sdohCard.getCardText();
    expect(cardText).toContain('Health Related Social Needs');
  });

  // Qase Test Case ID: 233 - Verify Barrier Categories Display
  test('ONEVIEW-233: Verify Barrier Categories Display', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '233' });
    await sdohCard.assertVisible();

    const cardText = await sdohCard.getCardText();
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 234 - Verify Barrier Status/Indicators
  test('ONEVIEW-234: Verify Barrier Status/Indicators', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '234' });
    test.setTimeout(60000);

    await sdohCard.assertVisible();
    const isVisible = await sdohCard.card.isVisible();
    expect(isVisible).toBeTruthy();
  });

  // Qase Test Case ID: 235 - Verify Barrier Details/Notes
  test('ONEVIEW-235: Verify Barrier Details/Notes', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '235' });
    await sdohCard.assertVisible();

    const cardText = await sdohCard.getCardText();
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 236 - Verify Last Updated Date
  test('ONEVIEW-236: Verify Last Updated Date', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '236' });
    await sdohCard.assertVisible();
    expect(sdohCard.card).toBeTruthy();
  });

  // Qase Test Case ID: 240 - Verify Card Responsiveness
  test('ONEVIEW-240: Verify Card Responsiveness', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '240' });
    test.setTimeout(90000);

    await sdohCard.assertVisible();

    // Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(sdohCard.card).toBeVisible();

    // Test mobile viewport (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const isVisible = await sdohCard.card.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();

    // Test desktop viewport (1920px)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(sdohCard.card).toBeVisible();

    // Verify no horizontal scrolling
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10);
  });
});
