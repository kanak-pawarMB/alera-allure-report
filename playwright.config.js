// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',
  testDir: './tests',
  timeout: parseInt(process.env.TEST_TIMEOUT) || 120000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // SINGLE REPORTER CONFIG - Qase + others
  reporter: [
    ['html'],
    ['list'],
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
    // Qase TestOps configuration - TEMPORARILY DISABLED
    // ['playwright-qase-reporter', {
    //   mode: 'testops',
    //   debug: true,
    //   testops: {
    //     api: {
    //       token: process.env.QASE_API_TOKEN,
    //     },
    //     project: process.env.QASE_PROJECT || 'ONEVIEW',
    //     uploadAttachments: true,
    //     run: {
    //       complete: true,
    //     },
    //   },
    // }]
  ],

  use: {
    trace: 'retain-on-failure',
    screenshots: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Auth Setup - Chromium only
    {
      name: 'auth-setup',
      testMatch: /tests\/auth\/.*\.spec\.js/,
      use: { ...devices['Desktop Chrome'], headless: false },
      retries: 0,
    },

    // Smoke UI Tests
    {
      name: 'smoke',
      testMatch: /tests\/smoke\/.*\.spec\.js/,
      testIgnore: /tests\/api\/.*\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
      retries: 0,
      fullyParallel: false,
    },
    
    // API Smoke
    {
      name: 'api-smoke',
      testMatch: /tests\/api\/smoke\/.*\.spec\.js/,
      use: { baseURL: process.env.API_BASE_URL },
      retries: 0,
    },
    
    // API Regression
    {
      name: 'api-regression',
      testMatch: /tests\/api\/regression\/.*\.spec\.js/,
      use: { baseURL: process.env.API_BASE_URL },
      retries: process.env.CI ? 2 : 0,
    },
    
    // UI Regression (Chromium)
    {
      name: 'chromium',
      testIgnore: [/.*smoke.*\.spec\.js/, /tests\/api\/.*\.spec\.js/, /tests\/auth\/.*\.spec\.js/],
      use: { ...devices['Desktop Chrome'] },
    },

    // UI Regression (Firefox)
    {
      name: 'firefox',
      testIgnore: [/.*smoke.*\.spec\.js/, /tests\/api\/.*\.spec\.js/, /tests\/auth\/.*\.spec\.js/],
      use: { ...devices['Desktop Firefox'] },
    },

    // UI Regression (Safari)
    {
      name: 'safari',
      testIgnore: [/.*smoke.*\.spec\.js/, /tests\/api\/.*\.spec\.js/, /tests\/auth\/.*\.spec\.js/],
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
