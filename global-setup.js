// @ts-check
import { rimraf } from 'rimraf';

/**
 * Global setup hook - runs once before all tests
 * Cleans previous Allure results to ensure fresh report data
 */
export default async function globalSetup() {
  // Clean previous Allure results before test run
  await rimraf(['allure-results', 'allure-report']);
  console.log('Cleaned previous Allure results');
}
