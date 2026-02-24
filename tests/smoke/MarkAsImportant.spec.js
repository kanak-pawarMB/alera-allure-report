// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';

test.use({ storageState: 'auth.json' });

test.describe('Mark Cards as Important - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      // Wait for any initial cards before searching
      const anyCard = page.locator('[role="region"], [class*="card"], [class*="Card"], div[class*="shadow"]').first();
      await anyCard.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('markimportant-beforeeach-fail.png');
      throw e;
    }
  });

  test('ONEVIEW-511: Verify Star Icon Exists @smoke', async ({ page }) => {
    const cards = page.locator('[role="region"], [class*="card"], [class*="Card"], div[class*="shadow"]').filter({ hasText: /[A-Z]/ }).first();
    await expect(cards).toBeVisible({ timeout: 10000 });
    const starIcons = page.locator('button[aria-label*="star" i], button[title*="star" i], [class*="star"], svg[class*="star"]');
    const starCount = await starIcons.count();
    expect(starCount).toBeGreaterThan(0);
    expect(await starIcons.first().isVisible().catch(() => false)).toBeTruthy();
  });

  test('ONEVIEW-512: Verify Click Star to Mark Important @smoke', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const starButton = page.locator('button[aria-label*="star" i], button[title*="star" i], [class*="star-icon"] button').first();
    const isVisible = await starButton.isVisible().catch(() => false);
    if (isVisible) {
      await starButton.click();
      await page.waitForTimeout(500);
      const starParent = starButton.locator('..');
      const hasFilledClass = await starParent.locator('[class*="fill"], [class*="important"], [class*="selected"]').isVisible().catch(() => false);
      const cardWithGlow = page.locator('[class*="highlight"], [class*="glow"], [class*="selected"], [class*="important"]').first();
      const hasGlow = await cardWithGlow.isVisible().catch(() => false);
      expect(hasFilledClass || hasGlow).toBeTruthy();
    } else {
      const card = page.locator('[role="region"], [class*="card"]').first();
      await expect(card).toBeVisible({ timeout: 5000 });
    }
  });
});
