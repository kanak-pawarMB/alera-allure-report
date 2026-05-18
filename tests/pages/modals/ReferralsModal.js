// @ts-check
import { expect } from '@playwright/test';
import { BaseModal } from './BaseModal.js';

export class ReferralsModal extends BaseModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
  }

  /**
   * Assert modal contains referral-related content.
   */
  async assertContent() {
    await expect(this.modal).toContainText(/Referral|Specialist|Provider|Facility/i);
  }
}
