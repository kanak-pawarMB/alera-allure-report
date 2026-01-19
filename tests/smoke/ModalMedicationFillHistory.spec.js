// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Medication Fill History - Smoke Tests', () => {

  const viewAllXpath = "(//button[contains(normalize-space(),'View all')])[3]";

  // @ts-ignore
  async function loadPatientDashboard(page) {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });

    const search = page.getByRole('textbox', { name: /search/i }).first();
    await expect(search).toBeVisible({ timeout: 20000 });
    await search.fill(TEST_DATA.patients.completeData.medicaidId);

    await page.locator('text=NC767095351').first().click({ timeout: 20000 });

    await expect(
      page.locator('div').filter({ hasText: /Medication Fill History/i }).first()
    ).toBeVisible({ timeout: 30000 });
  }

  // @ts-ignore
  async function openMedicationFillModal(page) {
    const card = page.locator('div').filter({
      hasText: /Medication Fill History/i,
    }).first();

    await expect(card).toBeVisible({ timeout: 15000 });

    const viewAll = page.locator(viewAllXpath);
    await expect(viewAll).toBeVisible({ timeout: 15000 });
    // Add a hover before click to ensure visibility
    await viewAll.hover();
    await page.waitForTimeout(300); // small pause
    await viewAll.click();

    // Wait for modal to appear, with extra diagnostics
    const modal = page.getByRole('dialog');
    try {
      await expect(modal).toBeVisible({ timeout: 30000 });
    } catch (e) {
      await page.screenshot({ path: 'modal-not-visible.png', fullPage: true });
      throw e;
    }

    return modal;
  }

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await loadPatientDashboard(page);
  });

  test('ONEVIEW-101: View All opens modal @smoke', async ({ page }) => {
    // Extra wait before modal open for debug
    await page.waitForTimeout(500);
    const modal = await openMedicationFillModal(page);
    await expect(modal).toContainText(/Medication Fill History/i);
  });

  test('ONEVIEW-102: Modal contains search bar @smoke', async ({ page }) => {
    const modal = await openMedicationFillModal(page);
    await expect(modal.getByRole('textbox').first()).toBeVisible();
  });

  test('ONEVIEW-103: Search by drug name @smoke', async ({ page }) => {
    const modal = await openMedicationFillModal(page);
    const rows = modal.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    const text = (await rows.first().textContent()) || '';
    const query = text.split(/\s+/)[0]?.slice(0, 3) || 'a';

    await modal.getByRole('textbox').first().fill(query);
    await expect(rows.filter({ hasText: new RegExp(query, 'i') }).first()).toBeVisible();
  });

  test('ONEVIEW-104: All Time dropdown selectable @smoke', async ({ page }) => {
    const modal = await openMedicationFillModal(page);
    const dropdown = modal.getByRole('button', { name: /All Time/i }).first();
    await dropdown.click();
    await expect(modal.locator('[role="option"]').first()).toBeVisible();
  });

  test('ONEVIEW-105: Class dropdown selectable @smoke', async ({ page }) => {
    const modal = await openMedicationFillModal(page);
    const dropdown = modal.getByRole('button', { name: /Class/i }).first();
    await dropdown.click();
    await expect(modal.locator('[role="option"]').first()).toBeVisible();
  });

  test('ONEVIEW-111: Multiple dropdown filters usable @smoke', async ({ page }) => {
    const modal = await openMedicationFillModal(page);

    await modal.getByRole('button', { name: /All Time/i }).first().click();
    await modal.locator('[role="option"]').first().click();

    await modal.getByRole('button', { name: /Class/i }).first().click();
    await modal.locator('[role="option"]').first().click();
  });

  test('ONEVIEW-399: Modal opens consistently @smoke', async ({ page }) => {
    const modal = await openMedicationFillModal(page);
    await expect(modal).toBeVisible();
  });

  test('ONEVIEW-410: Modal close via Close icon @smoke', async ({ page }) => {
    // Extra wait before modal open for debug
    await page.waitForTimeout(500);
    const modal = await openMedicationFillModal(page);
    // Click the close icon using the provided XPath
    const closeIcon = page.locator("(//div[@aria-label='Close'])[1]");
    await expect(closeIcon).toBeVisible({ timeout: 5000 });
    await closeIcon.click();
    // Modal should be closed
    await expect(modal).toHaveCount(0);
  });

  test('ONEVIEW-414: Modal responsive across resolutions @smoke', async ({ page }) => {
    const modal = await openMedicationFillModal(page);

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(modal).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(modal).toBeVisible();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');
  });

});
