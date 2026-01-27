import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test('Debug: Find editable input in PCP card', async ({ page }) => {
  await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Search and load patient
  const searchField = page.getByRole('textbox', { name: /search/i }).first();
  await expect(searchField).toBeVisible({ timeout: 30000 });
  await searchField.click();
  await searchField.fill(TEST_DATA.patients.completeData.medicaidId);
  await page.waitForTimeout(2000);

  const result = page.getByText(TEST_DATA.patients.completeData.medicaidId).first();
  await expect(result).toBeVisible({ timeout: 15000 });
  await result.scrollIntoViewIfNeeded();
  await result.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Get PCP card
  const pcpCard = page.locator(':has-text("PCP")').first();
  await expect(pcpCard).toBeVisible({ timeout: 20000 });

  // Find all editable inputs
  const allInputs = await pcpCard.locator('input').all();
  console.log(`\n=== TOTAL INPUTS IN PCP CARD: ${allInputs.length} ===`);

  for (let i = 0; i < allInputs.length; i++) {
    const input = allInputs[i];
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    const readonly = await input.getAttribute('readonly');
    const disabled = await input.getAttribute('disabled');
    const value = await input.inputValue();
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    
    console.log(`\n=== INPUT ${i + 1} ===`);
    console.log(`Type: ${type}`);
    console.log(`Placeholder: ${placeholder}`);
    console.log(`Readonly: ${readonly}`);
    console.log(`Disabled: ${disabled}`);
    console.log(`Value: ${value}`);
    console.log(`ID: ${id}`);
    console.log(`Name: ${name}`);
    console.log(`Is editable: ${!readonly && !disabled}`);
  }

  // Check the specific locator from the test
  const editableFields = pcpCard.locator('input:not([readonly]):not([disabled]):not([type="search"]):not([type="text"][placeholder*="search"]), textarea:not([readonly]):not([disabled])');
  const count = await editableFields.count();
  console.log(`\n=== EDITABLE FIELDS COUNT (from test): ${count} ===`);
  
  if (count > 0) {
    const field = editableFields.first();
    const type = await field.getAttribute('type');
    const placeholder = await field.getAttribute('placeholder');
    const classList = await field.evaluate(el => el.className);
    console.log(`\nEditable field details:`);
    console.log(`Type: ${type}`);
    console.log(`Placeholder: ${placeholder}`);
    console.log(`Classes: ${classList}`);
  }
});
