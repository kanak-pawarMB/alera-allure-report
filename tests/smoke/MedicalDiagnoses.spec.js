// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { MedicalDiagnosesCard } from '../pages/cards/MedicalDiagnosesCard.js';

test.use({ storageState: 'auth.json' });

test.describe('Medical Diagnoses - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let medDxCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    medDxCard = new MedicalDiagnosesCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-MedicalDiagnoses-beforeEach-fail.png');
      throw e;
    }
  });

  test('ONEVIEW-309: Verify read-only behavior @smoke', async ({ page }) => {
    const card = page.locator('text=/Medical Diagnoses|Diagnoses/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);

    const editableInputs = page.locator('input[contenteditable="true"], textarea[contenteditable="true"]');
    expect(await editableInputs.count()).toBeLessThanOrEqual(1);

    const dataElements = page.locator('span, p, div').filter({ has: page.locator('text=/[A-Z0-9]/') });
    const hasReadOnlyData = await dataElements.count().then(count => count > 0);
    expect(hasReadOnlyData).toBeTruthy();
  });

  test('ONEVIEW-310: Verify responsiveness @smoke', async ({ page }) => {
    const card = page.locator('text=/Medical Diagnoses|Diagnoses/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await expect(card).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBeFalsy();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await expect(card).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBeFalsy();

    const mobileCardText = await card.textContent();
    // @ts-ignore
    expect(mobileCardText.length).toBeGreaterThan(0);

    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
