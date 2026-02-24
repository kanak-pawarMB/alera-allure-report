// @ts-check
import { BaseCard } from './BaseCard.js';

export class BehavioralHealthDiagnosesCard extends BaseCard {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, /Behavioral Health|Behavioral/i);
  }
}
