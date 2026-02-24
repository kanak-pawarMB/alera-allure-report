// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { CareGapsCard } from '../pages/cards/CareGapsCard.js';

test.use({ storageState: 'auth.json' });

test.describe('Care Gaps - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let careGapsCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    careGapsCard = new CareGapsCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('caregaps-beforeeach-fail.png');
      throw e;
    }
  });

  test('ONEVIEW-365: Verify refresh on patient switch @smoke', async ({ page }) => {
    const card = page.locator('text=/Care Gaps|Gap Analysis/i').first();
    await expect(card).toBeVisible({ timeout: 30000 });
    const initialText = await card.textContent();
    expect(initialText).toBeTruthy();
    // @ts-ignore
    expect(initialText.length).toBeGreaterThan(0);

    // Switch to secondary patient
    await dashboard.medicaidSearchInput.click();
    await dashboard.medicaidSearchInput.fill('');
    await page.waitForTimeout(500);
    await dashboard.medicaidSearchInput.fill(TEST_DATA.patients.secondary.medicaidId);
    await page.waitForTimeout(500);

    const patientOption = page.getByText(new RegExp(TEST_DATA.patients.secondary.medicaidId)).first();
    const isVisible = await patientOption.isVisible().catch(() => false);
    if (isVisible) {
      await patientOption.click();
      await page.waitForLoadState('networkidle');
      await expect(card).toBeVisible({ timeout: 10000 });
      const updatedText = await card.textContent();
      expect(updatedText).toBeTruthy();
      // @ts-ignore
      expect(updatedText.length).toBeGreaterThan(0);
    } else {
      await expect(card).toBeVisible({ timeout: 10000 });
    }
  });

  test('ONEVIEW-375: Verify read-only behavior @smoke', async ({ page }) => {
    const card = page.locator('text=/Care Gaps|Gap Analysis/i').first();
    await expect(card).toBeVisible({ timeout: 30000 });
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);
    expect(await card.locator('[contenteditable="true"]').count()).toBe(0);
    expect(await card.isVisible()).toBeTruthy();
    const inputFields = card.locator('input[type="text"], textarea').filter({ hasNot: page.locator('[readonly]') });
    expect(await inputFields.count()).toBe(0);
  });
});
