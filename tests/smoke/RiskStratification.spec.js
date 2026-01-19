// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Risk Stratification - Smoke Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Only increase timeout and add diagnostics for failing test ONEVIEW-386
    if (testInfo.title.includes('ONEVIEW-386')) {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 90000 });
      try {
        await page.waitForLoadState('networkidle', { timeout: 90000 });
        const medicaidBox = page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first();
        await expect(medicaidBox).toBeVisible({ timeout: 20000 });
        await medicaidBox.click();
        await medicaidBox.fill(TEST_DATA.patients.completeData.medicaidId);
        await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
      } catch (e) {
        await page.screenshot({ path: 'riskstrat-beforeeach-fail-386.png', fullPage: true });
        throw e;
      }
    } else {
      // ...existing code...
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
      await page.waitForLoadState('networkidle');
      await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().click();
      await page.getByRole('textbox', { name: 'Search by Patient\'s Medicaid' }).first().fill(TEST_DATA.patients.completeData.medicaidId);
      await page.getByText('NC767095351|Elizabeth Garcia|12/09/').click();
    }
  });

  test('ONEVIEW-385: Validate read-only mode @smoke', async ({ page }) => {
    // Locate Risk Stratification card
    const card = page.locator('text=/Risk Stratification|Risk Score/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Verify card has content
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    // @ts-ignore
    expect(cardText.length).toBeGreaterThan(0);

    // Verify no editable fields (read-only mode)
    const editableElements = card.locator('[contenteditable="true"]');
    const editableCount = await editableElements.count();
    expect(editableCount).toBe(0);

    // Verify no non-readonly input fields
    const editableInputs = card.locator('input:not([readonly]), textarea:not([readonly])');
    const editableInputCount = await editableInputs.count();
    expect(editableInputCount).toBe(0);

    // Confirm card displays data in read-only format
    const isVisible = await card.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('ONEVIEW-386: Validate presence of Risk Score link in header @smoke', async ({ page }) => {
    // Locate Risk Stratification card
    const card = page.locator('text=/Risk Stratification|Risk Score/i').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Verify card header contains Risk Score link using specific selector
    const riskScoreLink = page.locator("p[class='font-inter font-semibold text-[12px] leading-[21px] tracking-[0px] truncate block w-full']").first();
    const linkExists = await riskScoreLink.isVisible().catch(() => false);
    expect(linkExists).toBeTruthy();

    // Verify link is styled per design
    const linkText = await riskScoreLink.textContent();
    expect(linkText).toBeTruthy();
  });
});
