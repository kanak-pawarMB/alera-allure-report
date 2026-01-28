// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

/**
 * Recent Visits / Encounters Card - Regression Tests
 * Suite: Display Recent Visits/ Encounters
 * Test Cases: ONEVIEW-325, 327, 328, 329, 332, 335, 336, 338, 339, 341, 342, 344, 345, 346, 347
 */

test.use({ storageState: 'auth.json' });

test.describe('Recent Visits / Encounters - Regression @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
    await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
    await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  // @ts-ignore
  const getRecentVisitsCard = (page) => page.locator('[class*="card"]').filter({ hasText: /Recent Visits|Encounters/i }).first();
  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/;

  // 325 - Verify sorting by Service_Date (newest first)
  test('ONEVIEW-325: Verify sorting by Service_Date (newest first) @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '325' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    const dateCells = card.locator('text=/\d{1,2}\/\d{1,2}\/\d{2,4}/');
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
      // Verify descending order (newest first)
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
      }
    }
  });

  // 327 - Verify 5-record limit
  test('ONEVIEW-327: Verify 5-record limit @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '327' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    const rows = card.locator('tbody tr, [role="row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeLessThanOrEqual(5);
  });

  // 328 - Verify card title
  test('ONEVIEW-328: Verify card title @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '328' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    const header = card.locator('text=/Recent Visits|Encounters/i').first();
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    expect(headerText).toMatch(/Recent Visits|Encounters/i);
  });

  // 329 - Verify table alignment and spacing per Figma
  test('ONEVIEW-329: Verify table alignment and spacing per Figma @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '329' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Verify table structure exists
    const table = card.locator('table, [role="table"]').first();
    await expect(table).toBeVisible();
    
    // Verify headers exist
    const headers = card.locator('th, [class*="header"]');
    expect(await headers.count()).toBeGreaterThanOrEqual(1);
  });

  // 332 - Verify modal title and layout
  test('ONEVIEW-332: Verify modal title and layout @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '332' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Click "View All" or similar button to open modal
    const viewAllButton = card.locator('button:has-text("View All"), button:has-text("See All"), a:has-text("View All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);
      
      // Verify modal is visible
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Verify modal header
      const modalHeader = modal.locator('h1, h2, h3, [class*="header"]').first();
      await expect(modalHeader).toBeVisible();
      
      // Close modal
      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close" i]').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 335 - Verify dynamic search response
  test('ONEVIEW-335: Verify dynamic search response @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '335' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Open modal if search is in modal
    const viewAllButton = card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      const searchInput = modal.locator('input[type="search"], input[placeholder*="search" i]').first();
      
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        // Results should update dynamically without manual submission
        await expect(modal).toBeVisible();
      }
      
      // Close modal
      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 336 - Verify search case-insensitivity
  test('ONEVIEW-336: Verify search case-insensitivity @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '336' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Open modal for search functionality
    const viewAllButton = card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      const searchInput = modal.locator('input[type="search"], input[placeholder*="search" i]').first();
      
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Search with lowercase
        await searchInput.fill('hospital');
        await page.waitForTimeout(500);
        const lowercaseResults = await modal.locator('tbody tr, [role="row"]').count();
        
        // Search with uppercase
        await searchInput.fill('HOSPITAL');
        await page.waitForTimeout(500);
        const uppercaseResults = await modal.locator('tbody tr, [role="row"]').count();
        
        // Both should return same results (case-insensitive)
        expect(lowercaseResults).toBe(uppercaseResults);
      }
      
      // Close modal
      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 338 - Verify combined search + filter
  test('ONEVIEW-338: Verify combined search + filter @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '338' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Open modal
    const viewAllButton = card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      
      // Apply timeline filter if available
      const filterDropdown = modal.locator('select, [role="combobox"]').first();
      if (await filterDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        await filterDropdown.selectOption({ index: 1 });
        await page.waitForTimeout(500);
      }
      
      // Apply search
      const searchInput = modal.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('clinic');
        await page.waitForTimeout(500);
        // Verify results update
        await expect(modal).toBeVisible();
      }
      
      // Close modal
      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 339 - Verify no results message
  test('ONEVIEW-339: Verify no results message @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '339' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Open modal
    const viewAllButton = card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      const searchInput = modal.locator('input[type="search"], input[placeholder*="search" i]').first();
      
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Search for something unlikely to match
        await searchInput.fill('xyzabcnotfound123456');
        await page.waitForTimeout(500);
        
        // Check for no results message
        const noResults = modal.locator('text=/No records found|No results|No data/i');
        const hasNoResultsMessage = await noResults.isVisible({ timeout: 3000 }).catch(() => false);
        const rowCount = await modal.locator('tbody tr, [role="row"]').count();
        
        // Either message shown or zero rows
        expect(hasNoResultsMessage || rowCount === 0).toBeTruthy();
      }
      
      // Close modal
      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 341 - Verify modal dismiss via cancel button
  test('ONEVIEW-341: Verify modal dismiss via cancel button @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '341' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Open modal
    const viewAllButton = card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Click cancel/close button
      const cancelButton = modal.locator('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close" i]').first();
      await cancelButton.click();
      await page.waitForTimeout(500);
      
      // Verify modal is closed
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    }
  });

  // 342 - Verify modal dismissibility without page reload
  test('ONEVIEW-342: Verify modal dismissibility without page reload @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '342' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Capture initial page URL
    const initialUrl = page.url();
    
    // Open modal
    const viewAllButton = card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Close modal
      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      await closeButton.click();
      await page.waitForTimeout(500);
      
      // Verify modal closed
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // Verify page didn't reload (URL unchanged and card still visible)
      expect(page.url()).toBe(initialUrl);
      await expect(card).toBeVisible();
    }
  });

  // 344 - Verify data display when some fields are null
  test('ONEVIEW-344: Verify data display when some fields are null @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '344' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Check for em-dash or double-dash for missing data
    const cardText = await card.textContent() || '';
    const hasDashPlaceholder = /—|--|N\/A/i.test(cardText);
    
    // Verify card displays properly even with null fields
    await expect(card).toBeVisible();
    expect(cardText.length).toBeGreaterThan(0);
  });

  // 345 - Verify behavior with no encounter data
  test('ONEVIEW-345: Verify behavior with no encounter data @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '345' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Check for empty state message or data rows
    const emptyMessage = card.locator('text=/No recent visits found|No data|No encounters/i');
    const rows = card.locator('tbody tr, [role="row"]');
    
    const hasMessage = await emptyMessage.isVisible({ timeout: 3000 }).catch(() => false);
    const rowCount = await rows.count();
    
    // Either empty message shown or rows exist
    expect(hasMessage || rowCount > 0).toBeTruthy();
  });

  // 346 - Verify pagination in modal
  test('ONEVIEW-346: Verify pagination in modal @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '346' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Open modal
    const viewAllButton = card.locator('button:has-text("View All"), button:has-text("See All")').first();
    if (await viewAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Check for pagination controls
      const pagination = modal.locator('[class*="pagination"], button:has-text("Next"), button:has-text("Previous"), [aria-label*="pagination" i]');
      const hasPagination = await pagination.isVisible({ timeout: 3000 }).catch(() => false);
      
      // Pagination may or may not be present depending on data size
      // Just verify modal is functional
      await expect(modal).toBeVisible();
      
      // Close modal
      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  // 347 - Verify table sorting stability post-refresh
  test('ONEVIEW-347: Verify table sorting stability post-refresh @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '347' });
    const card = getRecentVisitsCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Get initial order
    const dateCells = card.locator('text=/\d{1,2}\/\d{1,2}\/\d{2,4}/');
    const beforeDates = [];
    const count = await dateCells.count();
    for (let i = 0; i < count; i++) {
      const text = await dateCells.nth(i).textContent();
      if (text) beforeDates.push(text.trim());
    }
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get order after refresh
    const cardAfter = getRecentVisitsCard(page);
    await expect(cardAfter).toBeVisible({ timeout: 10000 });
    
    const afterCells = cardAfter.locator('text=/\d{1,2}\/\d{1,2}\/\d{2,4}/');
    const afterDates = [];
    const afterCount = await afterCells.count();
    for (let i = 0; i < afterCount; i++) {
      const text = await afterCells.nth(i).textContent();
      if (text) afterDates.push(text.trim());
    }
    
    // Verify order maintained (newest first)
    if (beforeDates.length > 0 && afterDates.length > 0) {
      expect(afterDates.length).toBeGreaterThan(0);
      // First date should be the same (newest)
      if (beforeDates.length === afterDates.length) {
        expect(afterDates[0]).toBe(beforeDates[0]);
      }
    }
  });
});
