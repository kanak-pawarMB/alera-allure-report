// @ts-check
import { BaseCard } from './BaseCard.js';

export class ImmunizationsCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Immunizations/i);
  }
}
