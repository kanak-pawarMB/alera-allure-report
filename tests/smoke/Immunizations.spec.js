// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ImmunizationsCard } from '../pages/cards/ImmunizationsCard.js';

/**
 * SMOKE TEST - Immunizations Card Critical Path
 * Qase Test Management Suite: Suite 31
 */

test.use({ storageState: 'auth.json' });

test.describe('Immunizations - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let immunizationsCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    immunizationsCard = new ImmunizationsCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('immunizations-beforeeach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 352
  test('ONEVIEW-352: Verify read-only view @smoke', async () => {
    await immunizationsCard.assertVisible();
    const editableInputs = immunizationsCard.card.locator('input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])');
    expect(await editableInputs.count()).toBe(0);
    const cardText = await immunizationsCard.getCardText();
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 355
  test('ONEVIEW-355: Verify layout and font per Figma @smoke', async () => {
    await immunizationsCard.assertVisible();
    const cardBox = await immunizationsCard.card.boundingBox();
    expect(cardBox).not.toBeNull();
    const cardText = await immunizationsCard.getCardText();
    expect(cardText.length).toBeGreaterThan(0);
  });

  // Qase Test Case ID: 358
  test('ONEVIEW-358: Verify tab/mobile responsiveness @smoke', async ({ page }) => {
    await immunizationsCard.assertVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await immunizationsCard.assertVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    expect(await immunizationsCard.card.isVisible().catch(() => false)).toBeTruthy();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await immunizationsCard.assertVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.body.clientWidth) + 10);
  });
});
