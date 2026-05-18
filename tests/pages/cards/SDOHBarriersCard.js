// @ts-check
import { BaseCard } from './BaseCard.js';

export class SDOHBarriersCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Health Related Social Needs/i);
  }
}
