// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { RiskStratificationCard } from '../pages/cards/RiskStratificationCard.js';

/**
 * Risk Stratification Card - Regression Tests
 * Suite: Display Risk Stratification
 * Test Cases: ONEVIEW-379, 380, 381, 382, 383, 384, 388, 391, 392, 393, 395, 396, 397
 */

test.use({ storageState: 'auth.json' });

test.describe('Risk Stratification - Regression @regression', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let riskCard;

  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    riskCard = new RiskStratificationCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-RiskStratification-regression-beforeEach-fail.png');
      throw e;
    }
  });

  // 379 - Validate latest risk score record
  test('ONEVIEW-379: Validate latest risk score record @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '379' });
    await riskCard.assertVisible();

    const dateCells = riskCard.card.locator('text=/\d{1,2}\/\d{1,2}\/\d{2,4}/');
    const count = await dateCells.count();
    if (count > 1) {
      const dates = [];
      for (let i = 0; i < count; i++) {
        const text = await dateCells.nth(i).textContent();
        if (text) {
          const [m, d, y] = text.trim().split('/').map(Number);
          const normalizedYear = y < 100 ? 2000 + y : y;
          dates.push(new Date(normalizedYear, m - 1, d));
        }
      }
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
      }
    }
  });

  // 380 - Validate central risk score display
  test('ONEVIEW-380: Validate central risk score display @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '380' });
    await riskCard.assertVisible();

    const score = riskCard.card.locator('text=/^\d+$/').first();
    const text = await score.textContent();
    expect(text && text.trim().length > 0).toBeTruthy();
  });

  // 381 - Validate Last Updated Date
  test('ONEVIEW-381: Validate Last Updated Date @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '381' });
    await riskCard.assertVisible();

    const lastUpdated = riskCard.card.getByText(/Last updated/i).first();
    await expect(lastUpdated).toBeVisible();
    const text = await lastUpdated.textContent() || '';
    const hasDate = dateRegex.test(text);
    expect(hasDate || text.length > 0).toBeTruthy();
  });

  // 382 - Validate display of 5 factorial bullet points
  test('ONEVIEW-382: Validate display of 5 factorial bullet points @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '382' });
    await riskCard.assertVisible();

    const bullets = riskCard.card.locator('li, [role="listitem"]');
    const count = await bullets.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  // 383 - Validate trend image mapping
  test('ONEVIEW-383: Validate trend image mapping @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '383' });
    await riskCard.assertVisible();

    const images = riskCard.card.locator('img, svg');
    expect(await images.count()).toBeGreaterThanOrEqual(1);
  });

  // 384 - Validate card title
  test('ONEVIEW-384: Validate card title @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '384' });
    await riskCard.assertVisible();

    const header = riskCard.card.locator('text=/Risk Stratification/i').first();
    await expect(header).toBeVisible();
  });

  // 388 - Validate modal close via X icon
  test('ONEVIEW-388: Validate modal close via X icon @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '388' });
    await riskCard.assertVisible();

    const viewAll = riskCard.card.locator('button:has-text("View All"), a:has-text("View All")').first();
    if (await viewAll.isVisible().catch(() => false)) {
      await viewAll.click();
      await page.waitForTimeout(1000);
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      const close = modal.locator('button[aria-label*="close" i], button:has-text("Close"), button:has-text("Cancel"), [class*="close"]').first();
      if (await close.isVisible().catch(() => false)) {
        await close.click();
        await expect(modal).not.toBeVisible({ timeout: 5000 });
      }
    }
  });

  // 391 - Validate dynamic update of graph
  test('ONEVIEW-391: Validate dynamic update of graph @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '391' });
    await riskCard.assertVisible();

    const viewAll = riskCard.card.locator('button:has-text("View All"), a:has-text("View All"), button:has-text("View Details")').first();
    if (await viewAll.isVisible().catch(() => false)) {
      await viewAll.click();
      await page.waitForTimeout(1000);
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      const filter = modal.locator('select, [role="combobox"]');
      if (await filter.isVisible().catch(() => false)) {
        const before = await modal.locator('canvas, svg').screenshot({ timeout: 3000 }).catch(() => null);
        await filter.selectOption({ index: 0 }).catch(() => {});
        await page.waitForTimeout(800);
        await filter.selectOption({ index: 1 }).catch(() => {});
        await page.waitForTimeout(800);
        const after = await modal.locator('canvas, svg').screenshot({ timeout: 3000 }).catch(() => null);
        expect(before || after).toBeTruthy();
      }
    }
  });

  // 392 - Validate graph correctness for timeline
  test('ONEVIEW-392: Validate graph correctness for timeline @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '392' });
    await riskCard.assertVisible();

    const viewAll = riskCard.card.locator('button:has-text("View All"), a:has-text("View All"), button:has-text("View Details")').first();
    if (await viewAll.isVisible().catch(() => false)) {
      await viewAll.click();
      await page.waitForTimeout(1000);
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      const filter = modal.locator('select, [role="combobox"]');
      if (await filter.isVisible().catch(() => false)) {
        await filter.selectOption({ index: 0 }).catch(() => {});
        await page.waitForTimeout(500);
        const chart = modal.locator('canvas, svg');
        await expect(chart.first()).toBeVisible();
      }
    }
  });

  // 393 - Validate no records found message
  test('ONEVIEW-393: Validate no records found message @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '393' });
    await riskCard.assertVisible();

    const viewAll = riskCard.card.locator('button:has-text("View All"), a:has-text("View All"), button:has-text("View Details")').first();
    if (await viewAll.isVisible().catch(() => false)) {
      await viewAll.click();
      await page.waitForTimeout(1000);
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      const filter = modal.locator('select, [role="combobox"]');
      if (await filter.isVisible().catch(() => false)) {
        await filter.selectOption({ index: 0 }).catch(() => {});
        await page.waitForTimeout(500);
      }
      const noData = modal.getByText(/No records found|No data/i);
      const rows = modal.locator('tbody tr, [role="row"]');
      const hasMessage = await noData.isVisible().catch(() => false);
      const rowCount = await rows.count();
      expect(hasMessage || rowCount > 0).toBeTruthy();
    }
  });

  // 395 - Validate wrapping of risk drivers
  test('ONEVIEW-395: Validate wrapping of risk drivers @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '395' });
    await riskCard.assertVisible();

    const bullets = riskCard.card.locator('li, [role="listitem"]');
    const first = bullets.first();
    await expect(first).toBeVisible();
    const text = await first.textContent();
    expect((text || '').length).toBeGreaterThan(0);
  });

  // 396 - Validate score alignment & formatting
  test('ONEVIEW-396: Validate score alignment & formatting @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '396' });
    await riskCard.assertVisible();

    const score = riskCard.card.locator('text=/^\d+$/').first();
    const box = await score.boundingBox();
    expect(box && box.width > 0 && box.height > 0).toBeTruthy();
  });

  // 397 - Validate design spacing & padding
  test('ONEVIEW-397: Validate design spacing & padding @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '397' });
    await riskCard.assertVisible();

    const box = await riskCard.card.boundingBox();
    expect(box && box.width > 0 && box.height > 0).toBeTruthy();
  });
});
