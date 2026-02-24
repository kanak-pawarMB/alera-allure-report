// @ts-check
import { expect } from '@playwright/test';
import { BaseModal } from './BaseModal.js';

export class MedicationFillHistoryModal extends BaseModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
  }

  /**
   * Assert modal contains medication-related content.
   */
  async assertContent() {
    await expect(this.modal).toContainText(/Medication|Drug|Fill|Prescription/i);
  }
}
