import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test('Debug: Inspect PCP Card DOM Structure', async ({ page }) => {
  await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Search and load patient
  const searchField = page.getByRole('textbox', { name: /search/i }).first();
  await expect(searchField).toBeVisible({ timeout: 30000 });
  await searchField.click();
  await searchField.fill(TEST_DATA.patients.completeData.medicaidId);
  await page.waitForTimeout(3000);

  const result = page.locator('div, p, span').filter({ hasText: new RegExp(TEST_DATA.patients.completeData.medicaidId) }).first();
  await expect(result).toBeVisible({ timeout: 20000 });
  await result.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);

  // Debug: Get all elements containing "Provider", "PCP", "Primary Care"
  const allText = await page.locator('body').textContent();
  console.log('\n=== PAGE CONTAINS "Provider":', allText?.includes('Provider'));
  console.log('=== PAGE CONTAINS "PCP":', allText?.includes('PCP'));
  console.log('=== PAGE CONTAINS "Primary Care":', allText?.includes('Primary Care'));

  // Try to find any card-like structures
  const cards = await page.locator('[class*="card"], [class*="Card"]').count();
  console.log('\n=== CARD ELEMENTS FOUND:', cards);

  // Check for sections
  const sections = await page.locator('section').count();
  console.log('=== SECTION ELEMENTS FOUND:', sections);

  // Check for divs with specific patterns
  const providerDivs = await page.locator('div:has-text("Provider")').count();
  console.log('=== DIVS WITH "Provider":', providerDivs);

  // Get HTML of the page for inspection
  const html = await page.content();
  console.log('\n=== PAGE HTML (first 2000 chars):\n', html.substring(0, 2000));

  // Try alternative selectors
  const alt1 = await page.locator('div:has-text(/Primary Care|PCP/)').count();
  console.log('\n=== DIVS with "Primary Care" or "PCP":', alt1);

  const alt2 = await page.locator('[role="region"]').count();
  console.log('=== ROLE="region" elements:', alt2);

  // Dump the visible text structure
  const pageText = await page.locator('body').allTextContents();
  console.log('\n=== VISIBLE TEXT:\n', pageText);
});
