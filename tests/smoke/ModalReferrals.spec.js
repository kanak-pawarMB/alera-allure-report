// @ts-check
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ReferralsCard } from '../pages/cards/ReferralsCard.js';
import { ReferralsModal } from '../pages/modals/ReferralsModal.js';

/**
 * SMOKE TEST - Referrals Modal Drill Down
 * Patient: NC767095351 (Elizabeth Garcia, DOB 12/09/1961)
 */

test.use({ storageState: 'auth.json' });

test.describe('Drill Down Referrals - Smoke Tests', () => {
  test.describe.configure({ timeout: 120000 });

  let dashboard;
  let referralsCard;
  let referralsModal;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    referralsCard = new ReferralsCard(page);
    referralsModal = new ReferralsModal(page);
    try {
      await dashboard.goto();
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
      await page.waitForTimeout(2000);
      await dashboard.assertNotRedirectedToLogin();
      await dashboard.loadDefaultPatient();
      await page.waitForTimeout(3000);
      await dashboard.dismissAlertBannerIfPresent();
    } catch (e) {
      await dashboard.screenshotOnFailure('screenshots/debug-ModalReferrals-beforeEach-fail.png');
      throw e;
    }
  });

  // Qase Test Case ID: 142
  test('ONEVIEW-142: Smoke_Verify Scroll Functionality @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '142' });
    await referralsCard.assertVisible(15000);
    await page.waitForTimeout(2000);
    await referralsCard.clickViewAll();
    await referralsModal.assertVisible(15000);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Scroll inside modal
    await referralsModal.modal.evaluate(node => { node.scrollTop = node.scrollHeight; });
    await referralsModal.assertVisible();
    await referralsModal.close();
  });
});
