// @ts-check
import { BaseCard } from './BaseCard.js';

export class CareGapsCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Care Gaps/i);
  }
}
