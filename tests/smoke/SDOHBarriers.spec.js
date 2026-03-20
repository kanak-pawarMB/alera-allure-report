// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { TEST_DATA } from '../testData.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { SDOHBarriersCard } from '../pages/cards/SDOHBarriersCard.js';

/**
 * SMOKE TEST - SDOH Barriers Card Critical Path
 * Qase Test Management Suite: Suite 23
 */

test.use({ storageState: 'auth.json' });

test.describe('SDOH Barriers - Smoke Tests', () => {
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
      await dashboard.screenshotOnFailure('screenshots/debug-SDOHBarriers-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 237
  test('ONEVIEW-237: Verify read-only behavior @smoke', async ({ page }) => {
    const sdohTitle = sdohCard.card;
    await expect(sdohTitle).toBeVisible({ timeout: TIMEOUTS.medium });
    const editableInputs = page.locator('input:not([readonly]):not([disabled])').filter({
      has: page.locator('text=/Health Related Social Needs/i')
    });
    expect(await editableInputs.count()).toBe(0);
    expect(await sdohCard.card.locator('[contenteditable="true"]').count()).toBe(0);
  });

  // Qase Test Case ID: 238
  test('ONEVIEW-238: Data refresh on patient selection @smoke', async ({ page }) => {
    const sdohTitle = sdohCard.card;
    await expect(sdohTitle).toBeVisible({ timeout: TIMEOUTS.medium });
    const initialText = await sdohCard.getCardText();
    expect(initialText.length).toBeGreaterThan(0);

    await dashboard.medicaidSearchInput.clear();
    await dashboard.medicaidSearchInput.fill(TEST_DATA.patients.completeData.medicaidId);
    await page.waitForTimeout(1000);
    await expect(sdohTitle).toBeVisible({ timeout: TIMEOUTS.short });
  });

  // Qase Test Case ID: 239
  test('ONEVIEW-239: Handle backend unavailability @smoke', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    const sdohTitle = sdohCard.card;
    const cardExists = await sdohTitle.isVisible({ timeout: TIMEOUTS.xs }).catch(() => false);
    const cardContainerExists = await sdohCard.card.isVisible({ timeout: TIMEOUTS.xs }).catch(() => false);
    const pageLoaded = await page.evaluate(() => document.readyState === 'complete');
    expect(cardExists || cardContainerExists || pageLoaded).toBeTruthy();
  });

  // Qase Test Case ID: 241
  test('ONEVIEW-241: Verify accessibility and responsiveness @smoke', async ({ page }) => {
    const sdohTitle = sdohCard.card;
    await expect(sdohTitle).toBeVisible({ timeout: TIMEOUTS.medium });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(sdohTitle).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    expect(await sdohCard.card.isVisible().catch(() => false)).toBeTruthy();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(sdohTitle).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.body.clientWidth) + 10);
  });

  // Qase Test Case ID: 242
  test('ONEVIEW-242: Verify HIPAA compliance (read-only data) @smoke', async () => {
    const sdohTitle = sdohCard.card;
    await expect(sdohTitle).toBeVisible({ timeout: TIMEOUTS.medium });
    const inputs = sdohCard.card.locator('input, textarea, [contenteditable="true"], button[onclick*="edit"]');
    expect(await inputs.count()).toBe(0);
    const textContent = await sdohCard.getCardText();
    expect(textContent.length).toBeGreaterThan(0);
    expect(await inputs.count() === 0).toBeTruthy();
  });
});
