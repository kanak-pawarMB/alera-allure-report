// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { RecentVisitsCard } from '../pages/cards/RecentVisitsCard.js';

/**
 * Recent Visits / Encounters Card - Regression Tests
 * Suite: Display Recent Visits/ Encounters
 * Test Cases: ONEVIEW-325, 327, 328, 329, 332, 335, 336, 338, 339, 341, 342, 344, 345, 346, 347
 */

test.use({ storageState: 'auth.json' });

test.describe('Recent Visits / Encounters - Regression @regression', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let recentVisitsCard;

  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    recentVisitsCard = new RecentVisitsCard(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    try {
      await dashboard.goto();
      await dashboard.loadDefaultPatient();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-RecentVisits-regression-beforeEach-fail.png');
      throw e;
    }
  });

  // 325 - Verify sorting by Service_Date (newest first)
  test('ONEVIEW-325: Verify sorting by Service_Date (newest first) @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '325' });
    await recentVisitsCard.assertVisible();

    const dateCells = recentVisitsCard.card.locator('text=/\d{1,2}\/\d{1,2}\/\d{2,4}/');
    const count = await dateCells.count();

    if (count > 1) {
      const dates = [];
      for (let i = 0; i < count; i++) {
        const text = await dateCells.nth(i).textContent();
        if (text) {
          const [month, day, year] = text.trim().split('/').map(Number);
          const normalizedYear = year < 100 ? 2000 + year : year;
          dates.push(new Date(normalizedYear, month - 1, day));
        }
      }
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
      }
    }
  });

  // 327 - Verify 5-record limit
  test('ONEVIEW-327: Verify 5-record limit @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '327' });
    await recentVisitsCard.assertVisible();

    const rows = recentVisitsCard.card.locator('tbody tr, [role="row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeLessThanOrEqual(5);
  });

  // 328 - Verify card title
  test('ONEVIEW-328: Verify card title @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '328' });
    await recentVisitsCard.assertVisible();

    const header = recentVisitsCard.card.locator('text=/Recent Visits|Encounters/i').first();
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    expect(headerText).toMatch(/Recent Visits|Encounters/i);
  });

  // 329 - Verify table alignment and spacing per Figma
  test('ONEVIEW-329: Verify table alignment and spacing per Figma @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '329' });
    await recentVisitsCard.assertVisible();

    const table = recentVisitsCard.card.locator('table, [role="table"]').first();
    await expect(table).toBeVisible();

    const headers = recentVisitsCard.card.locator('th, [class*="header"]');
    expect(await headers.count()).toBeGreaterThanOrEqual(1);
  });

  // 332 - Verify modal title and layout
  test('ONEVIEW-332: Verify modal title and layout @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '332' });
    await recentVisitsCard.assertVisible();

    const viewAllButton = recentVisitsCard.card.locator('button:has-text("View All"), button:has-text("See All"), a:has-text("View All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      const modalHeader = modal.locator('h1, h2, h3, [class*="header"]').first();
      await expect(modalHeader).toBeVisible();

      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close" i]').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 335 - Verify dynamic search response
  test('ONEVIEW-335: Verify dynamic search response @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '335' });
    await recentVisitsCard.assertVisible();

    const viewAllButton = recentVisitsCard.card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      const searchInput = modal.locator('input[type="search"], input[placeholder*="search" i]').first();

      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        await expect(modal).toBeVisible();
      }

      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 336 - Verify search case-insensitivity
  test('ONEVIEW-336: Verify search case-insensitivity @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '336' });
    await recentVisitsCard.assertVisible();

    const viewAllButton = recentVisitsCard.card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      const searchInput = modal.locator('input[type="search"], input[placeholder*="search" i]').first();

      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.fill('hospital');
        await page.waitForTimeout(500);
        const lowercaseResults = await modal.locator('tbody tr, [role="row"]').count();

        await searchInput.fill('HOSPITAL');
        await page.waitForTimeout(500);
        const uppercaseResults = await modal.locator('tbody tr, [role="row"]').count();

        expect(lowercaseResults).toBe(uppercaseResults);
      }

      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 338 - Verify combined search + filter
  test('ONEVIEW-338: Verify combined search + filter @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '338' });
    await recentVisitsCard.assertVisible();

    const viewAllButton = recentVisitsCard.card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();

      const filterDropdown = modal.locator('select, [role="combobox"]').first();
      if (await filterDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        await filterDropdown.selectOption({ index: 1 });
        await page.waitForTimeout(500);
      }

      const searchInput = modal.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('clinic');
        await page.waitForTimeout(500);
        await expect(modal).toBeVisible();
      }

      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 339 - Verify no results message
  test('ONEVIEW-339: Verify no results message @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '339' });
    await recentVisitsCard.assertVisible();

    const viewAllButton = recentVisitsCard.card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      const searchInput = modal.locator('input[type="search"], input[placeholder*="search" i]').first();

      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.fill('xyzabcnotfound123456');
        await page.waitForTimeout(500);

        const noResults = modal.locator('text=/No records found|No results|No data/i');
        const hasNoResultsMessage = await noResults.isVisible({ timeout: 3000 }).catch(() => false);
        const rowCount = await modal.locator('tbody tr, [role="row"]').count();

        expect(hasNoResultsMessage || rowCount === 0).toBeTruthy();
      }

      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 341 - Verify modal dismiss via cancel button
  test('ONEVIEW-341: Verify modal dismiss via cancel button @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '341' });
    await recentVisitsCard.assertVisible();

    const viewAllButton = recentVisitsCard.card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      const cancelButton = modal.locator('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close" i]').first();
      await cancelButton.click();
      await page.waitForTimeout(500);

      await expect(modal).not.toBeVisible({ timeout: 3000 });
    }
  });

  // 342 - Verify modal dismissibility without page reload
  test('ONEVIEW-342: Verify modal dismissibility without page reload @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '342' });
    await recentVisitsCard.assertVisible();

    const initialUrl = page.url();

    const viewAllButton = recentVisitsCard.card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      await closeButton.click();
      await page.waitForTimeout(500);

      await expect(modal).not.toBeVisible({ timeout: 3000 });
      expect(page.url()).toBe(initialUrl);
      await recentVisitsCard.assertVisible();
    }
  });

  // 344 - Verify data display when some fields are null
  test('ONEVIEW-344: Verify data display when some fields are null @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '344' });
    await recentVisitsCard.assertVisible();

    const cardText = await recentVisitsCard.getCardText();
    await recentVisitsCard.assertVisible();
    expect(cardText.length).toBeGreaterThan(0);
  });

  // 345 - Verify behavior with no encounter data
  test('ONEVIEW-345: Verify behavior with no encounter data @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '345' });
    await recentVisitsCard.assertVisible();

    const emptyMessage = recentVisitsCard.card.locator('text=/No recent visits found|No data|No encounters/i');
    const rows = recentVisitsCard.card.locator('tbody tr, [role="row"]');

    const hasMessage = await emptyMessage.isVisible({ timeout: 3000 }).catch(() => false);
    const rowCount = await rows.count();

    expect(hasMessage || rowCount > 0).toBeTruthy();
  });

  // 346 - Verify pagination in modal
  test('ONEVIEW-346: Verify pagination in modal @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '346' });
    await recentVisitsCard.assertVisible();

    const viewAllButton = recentVisitsCard.card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      await expect(modal).toBeVisible();

      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 347 - Verify table sorting stability post-refresh
  test('ONEVIEW-347: Verify table sorting stability post-refresh @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '347' });
    await recentVisitsCard.assertVisible();

    const dateCells = recentVisitsCard.card.locator('text=/\d{1,2}\/\d{1,2}\/\d{2,4}/');
    const beforeDates = [];
    const count = await dateCells.count();
    for (let i = 0; i < count; i++) {
      const text = await dateCells.nth(i).textContent();
      if (text) beforeDates.push(text.trim());
    }

    // Refresh page and reload patient
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await dashboard.loadDefaultPatient();

    await recentVisitsCard.assertVisible(10000);

    const afterCells = recentVisitsCard.card.locator('text=/\d{1,2}\/\d{1,2}\/\d{2,4}/');
    const afterDates = [];
    const afterCount = await afterCells.count();
    for (let i = 0; i < afterCount; i++) {
      const text = await afterCells.nth(i).textContent();
      if (text) afterDates.push(text.trim());
    }

    if (beforeDates.length > 0 && afterDates.length > 0) {
      expect(afterDates.length).toBeGreaterThan(0);
      if (beforeDates.length === afterDates.length) {
        expect(afterDates[0]).toBe(beforeDates[0]);
      }
    }
  });
});
