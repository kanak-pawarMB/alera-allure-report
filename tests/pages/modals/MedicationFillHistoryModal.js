// @ts-check
import { expect } from '@playwright/test';
import { BaseModal } from './BaseModal.js';

export class MedicationFillHistoryModal extends BaseModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    // Override modal locator — MedFill modal may use a capital-M class or custom
    // aria attribute instead of the lowercase [class*="modal"] / [role="dialog"]
    // that BaseModal relies on.
    this.modal = page
      .locator(
        '[role="dialog"], [class*="modal"], [class*="Modal"],' +
        ' [aria-modal="true"], [class*="DrillDown"], [class*="drilldown"]'
      )
      .first();
  }

  /**
   * Assert modal contains medication-related content.
   */
  async assertContent() {
    await expect(this.modal).toContainText(/Medication|Drug|Fill|Prescription/i);
  }
}
