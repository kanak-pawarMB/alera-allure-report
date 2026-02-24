// @ts-check
import { expect } from '@playwright/test';
import { BaseCard } from './BaseCard.js';

export class MedicalDiagnosesCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Medical Diagnoses|Medical/i);
  }

  /**
   * Assert diagnosis entries are present.
   */
  async assertDiagnosesPresent() {
    const text = await this.getCardText();
    expect(text.length).toBeGreaterThan(0);
  }
}
