// @ts-check
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { RiskStratificationCard } from '../pages/cards/RiskStratificationCard.js';

test.use({ storageState: 'auth.json' });

test.describe('Risk Stratification - Smoke Tests', () => {
  let dashboard;
  let riskCard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    riskCard = new RiskStratificationCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-RiskStratification-beforeEach-fail.png');
      throw e;
    }
  });

  test('ONEVIEW-385: Validate read-only mode @smoke', async ({ page }) => {
    const card = page.locator('text=/Risk Stratification|Risk Score/i').first();
    await expect(card).toBeVisible({ timeout: TIMEOUTS.medium });
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);
    await riskCard.assertReadOnly();
  });

  test('ONEVIEW-386: Validate presence of Risk Score link in header @smoke', async () => {
    await riskCard.assertRiskScoreLinkPresent();
    const linkText = await riskCard.riskScoreLink.textContent();
    expect(linkText).toBeTruthy();
  });
});
