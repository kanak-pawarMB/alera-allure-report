// @ts-check
import { BaseCard } from './BaseCard.js';

export class CareManagementCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Care Management/i);
  }
}
