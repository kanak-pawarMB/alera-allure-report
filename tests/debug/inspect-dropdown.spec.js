import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test('Debug: Inspect Search Dropdown Structure', async ({ page }) => {
  await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Get search field
  const searchField = page.getByRole('textbox', { name: /search/i }).first();
  await expect(searchField).toBeVisible({ timeout: 30000 });
  
  console.log('\n=== SEARCH FIELD FOUND ===');
  console.log('Search field locator:', searchField);

  // Click and type
  await searchField.click();
  await searchField.fill(TEST_DATA.patients.completeData.medicaidId);
  await page.waitForTimeout(3000);

  // Check what's visible on page
  const pageText = await page.textContent('body');
  console.log('\n=== PAGE CONTAINS MEDICAID ID:', pageText?.includes(TEST_DATA.patients.completeData.medicaidId));

  // Try to find dropdown items
  const dropdownItems = await page.locator('[role="option"]').count();
  console.log('=== DROPDOWN ITEMS (role=option):', dropdownItems);

  const listItems = await page.locator('[role="listbox"] *').count();
  console.log('=== LISTBOX ITEMS:', listItems);

  // Try to find any div/li containing the medicaid ID
  const allDivs = await page.locator('div, li, button').count();
  console.log('=== TOTAL DIVS/LI/BUTTONS:', allDivs);

  // Get all visible text elements
  const allElements = page.locator('*').all();
  let foundCount = 0;
  for await (const el of allElements) {
    const text = await el.textContent();
    if (text?.includes(TEST_DATA.patients.completeData.medicaidId)) {
      foundCount++;
      const tagName = await el.evaluate(e => e.tagName);
      const classes = await el.evaluate(e => e.className);
      const role = await el.getAttribute('role');
      console.log(`\n=== FOUND ELEMENT #${foundCount} ===`);
      console.log(`Tag: ${tagName}, Classes: ${classes}, Role: ${role}`);
      console.log(`Text: ${text?.substring(0, 100)}`);
      
      if (foundCount === 1) {
        // Try to check if it's clickable
        const isClickable = await el.evaluate(e => {
          const style = window.getComputedStyle(e);
          return style.pointerEvents !== 'none' && style.display !== 'none';
        });
        console.log(`Is Clickable: ${isClickable}`);
        
        // Get bounding box
        const box = await el.boundingBox();
        console.log(`Bounding Box: ${JSON.stringify(box)}`);
      }
    }
  }

  console.log(`\n=== TOTAL ELEMENTS WITH MEDICAID ID: ${foundCount} ===`);

  // Check for common dropdown selectors
  const popovers = await page.locator('[role="dialog"], .dropdown, .popup, .menu').count();
  console.log('=== POPOVERS/DROPDOWNS:', popovers);

  // Get HTML structure around search field
  const searchContainer = await searchField.evaluate(el => {
    let parent = el.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      console.log(`Level ${depth}:`, parent.className, parent.innerHTML?.substring(0, 200));
      parent = parent.parentElement;
      depth++;
    }
    return el.parentElement?.innerHTML;
  });
  
  console.log('\n=== SEARCH FIELD CONTAINER HTML (first 1000 chars):\n', searchContainer?.substring(0, 1000));
});
