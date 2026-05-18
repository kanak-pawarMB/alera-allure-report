// @ts-check
import { test } from '@playwright/test';
import { TIMEOUTS } from '../timeouts.js';

/**
 * REGRESSION - Drag & Drop (Phase-2)
 * Qase Suite: Drag & Drop
 *
 * All tests in this suite are skipped because Playwright synthetic drag events
 * are not supported by the React DnD library used in this application.
 * These tests require manual verification.
 */

const SKIP_REASON =
  'Cannot be automated — Playwright synthetic drag events are not supported by the ' +
  'React DnD library used in this application. Requires manual testing.';

test.describe('Phase-2', () => {
test.describe('Drag & Drop', () => {
test.describe('Drag & Drop - Regression @regression', () => {
  test.describe.configure({ timeout: TIMEOUTS.test });

  // Qase ID: 853 (QASE auto-assigned; ONEVIEW title = 838)
  test('ONEVIEW-838: Verify drag handle cursor appears on configurable cards in Edit Mode @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '853' });
    test.skip(true, SKIP_REASON);
  });

  // Qase ID: 854 (QASE auto-assigned; ONEVIEW title = 839)
  test('ONEVIEW-839: Verify card can be dragged and dropped to a different column @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '854' });
    test.skip(true, SKIP_REASON);
  });

  // Qase ID: 855 (QASE auto-assigned; ONEVIEW title = 840)
  test('ONEVIEW-840: Verify card can be reordered within the same column via drag-and-drop @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '855' });
    test.skip(true, SKIP_REASON);
  });

  // Qase ID: 856 (QASE auto-assigned; ONEVIEW title = 841)
  test('ONEVIEW-841: Verify drag-and-drop card order persists after Save @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '856' });
    test.skip(true, SKIP_REASON);
  });

  // Qase ID: 857 (QASE auto-assigned; ONEVIEW title = 842)
  test('ONEVIEW-842: Verify fixed cards (Demographics, Care Management) cannot be dragged or dropped @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '857' });
    test.skip(true, SKIP_REASON);
  });
});
});
});
