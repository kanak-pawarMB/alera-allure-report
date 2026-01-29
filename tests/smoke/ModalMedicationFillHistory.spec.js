// @ts-check
import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../testData.js';

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Medication Fill History - Smoke Tests', () => {

  // @ts-ignore
  async function loadPatientDashboard(page) {
    await page.goto(TEST_DATA.urls.dashboard, { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    const searchBox = page.getByRole('textbox', { name: "Search by Patient's Medicaid" }).first();
    await searchBox.click();
    await searchBox.fill(TEST_DATA.patients.completeData.medicaidId);
    
    const patientResult = page.getByText(TEST_DATA.patients.completeData.medicaidId, { exact: false }).first();
    await expect(patientResult).toBeVisible({ timeout: 15000 });
    await patientResult.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // @ts-ignore
  const getCard = (page) => page.locator('[class*="card"]').filter({ hasText: /Medication Fill History/i }).first();
  
  // @ts-ignore
  async function openMedicationFillModal(page) {
    const card = getCard(page);
    await expect(card).toBeVisible({ timeout: 10000 });
    
    const viewAll = card.locator('button:has-text("View All"), a:has-text("View All")').first();
    await expect(viewAll).toBeVisible({ timeout: 5000 });
    await viewAll.click();
    await page.waitForTimeout(800);
    
    const modal = page.locator('[role="dialog"], [class*="modal"], .modal').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
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
});
