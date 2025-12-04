// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'], // Console output during test execution
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        'Environment': process.env.CI ? 'CI' : 'Local',
        'Node Version': process.version,
        'OS': process.platform,
      }
    }],
    ['playwright-qase-reporter', {
      apiToken: process.env.QASE_API_TOKEN,
      projectCode: process.env.QASE_PROJECT_CODE,
      runComplete: process.env.QASE_RUN_COMPLETE === 'true',
      logging: true,
      uploadAttachments: true,
      basePath: 'https://api.qase.io/v1',
    }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // UI Smoke Tests - Fast critical path tests (Chromium only)
    // USAGE: npx playwright test --project=smoke
    // For headed mode: npx playwright test --project=smoke --headed
    // IMPORTANT: Use --project=smoke (NOT --project=chromium) for smoke tests
    {
      name: 'smoke',
      testMatch: /tests\/smoke\/.*\.spec\.js/,
      testIgnore: /tests\/api\/.*\.spec\.js/, // Exclude API tests
      use: { ...devices['Desktop Chrome'] },
      retries: 0, // Smoke tests should not retry - they must be stable
    },

    // API Smoke Tests - Fast critical API endpoint tests
    // USAGE: npx playwright test --project=api-smoke
    {
      name: 'api-smoke',
      testMatch: /tests\/api\/smoke\/.*\.spec\.js/,
      use: {
        baseURL: process.env.API_BASE_URL,
      },
      retries: 0, // API smoke tests should not retry
    },

    // API Regression Tests - Comprehensive API test coverage
    // USAGE: npx playwright test --project=api-regression
    {
      name: 'api-regression',
      testMatch: /tests\/api\/regression\/.*\.spec\.js/,
      use: {
        baseURL: process.env.API_BASE_URL,
      },
      retries: process.env.CI ? 2 : 0,
    },

    // Full UI Regression Test Suite - Chromium (excludes smoke tests)
    // USAGE: npx playwright test --project=chromium
    // NOTE: This project excludes smoke tests to avoid duplication
    // To run smoke tests, use --project=smoke instead
    {
      name: 'chromium',
      testIgnore: [/.*smoke.*\.spec\.js/, /tests\/api\/.*\.spec\.js/], // Exclude smoke and API tests
      use: { ...devices['Desktop Chrome'] },
    },

    // Full UI Regression Test Suite - Firefox (excludes smoke tests)
    // USAGE: npx playwright test --project=firefox
    {
      name: 'firefox',
      testIgnore: [/.*smoke.*\.spec\.js/, /tests\/api\/.*\.spec\.js/],
      use: { ...devices['Desktop Firefox'] },
    },

    // Full UI Regression Test Suite - Safari (excludes smoke tests)
    // USAGE: npx playwright test --project=safari
    {
      name: 'safari',
      testIgnore: [/.*smoke.*\.spec\.js/, /tests\/api\/.*\.spec\.js/],
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

