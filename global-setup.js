// @ts-check
import { rimraf } from 'rimraf';

/**
 * Global setup hook - runs once before all tests
 * Cleans previous Allure results to ensure fresh report data
 */
export default async function globalSetup() {
  // Skip clean when accumulating results across multiple runs (e.g. QASE batch runner)
  if (process.env.SKIP_ALLURE_CLEAN === '1') {
    return;
  }
  // Clean previous Allure results before test run
  await rimraf(['allure-results', 'allure-report']);
  console.log('Cleaned previous Allure results');
}
