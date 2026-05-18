// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { BehavioralHealthDiagnosesCard } from '../pages/cards/BehavioralHealthDiagnosesCard.js';

test.use({ storageState: 'auth.json' });

test.describe('Behavioral Health Diagnoses - Smoke Tests', () => {
  let dashboard;
  let bhCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    bhCard = new BehavioralHealthDiagnosesCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('behavioralhealth-beforeeach-fail.png');
      throw e;
    }
  });

  test('ONEVIEW-323: Verify read-only data behavior @smoke', async ({ page }) => {
    const card = page.locator('text=/Behavioral Health Diagnoses|Mental Health|Behavioral/i').first();
    await expect(card).toBeVisible({ timeout: TIMEOUTS.long });
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);
    const editableElements = card.locator('[contenteditable="true"]');
    expect(await editableElements.count()).toBe(0);
  });
});
