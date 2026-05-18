// @ts-check
import { execSync } from 'child_process';

/**
 * Global teardown hook - runs once after all tests complete
 * Automatically generates the Allure report from test results
 */
export default async function globalTeardown() {
  // Skip report generation during Qase runs — report is generated manually at the end
  if (process.env.SKIP_ALLURE_CLEAN === '1') return;

  try {
    // Generate Allure report after tests complete
    execSync('npx allure generate allure-results --clean -o allure-report', {
      stdio: 'inherit'
    });
    console.log('Allure report generated at allure-report/index.html');
  } catch (error) {
    console.error('Failed to generate Allure report:', error.message);
  }
}
