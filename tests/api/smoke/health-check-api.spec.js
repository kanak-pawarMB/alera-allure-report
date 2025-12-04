/**
 * API Smoke Tests - Health Check
 *
 * Purpose: Verify API is up and running
 * Endpoint: GET /healthCheck
 * Run: npx playwright test tests/api/smoke/health-check-api.spec.js
 * or: npx playwright test --project=api-smoke
 */

import { test, expect } from '@playwright/test';

test.describe('Health Check API - Smoke Tests', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    // Create a new API request context
    apiContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
        'accept': 'application/json',
      },
      ignoreHTTPSErrors: true, // For dev/staging environments with self-signed certs
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET /healthCheck - should have correct response headers', async () => {
    const response = await apiContext.get('/healthCheck');

    // Verify content type is JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('GET /healthCheck - should respond quickly (performance check)', async () => {
    const startTime = Date.now();

    await apiContext.get('/healthCheck');

    const responseTime = Date.now() - startTime;
    console.log(`Health check response time: ${responseTime}ms`);

    // Health check should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });

  test('GET /healthCheck - should return valid JSON', async () => {
    const response = await apiContext.get('/healthCheck');

    // Verify we can parse JSON without errors
    const jsonBody = await response.json();

    // Verify it's a valid object
    expect(typeof jsonBody).toBe('object');
    expect(jsonBody).not.toBeNull();
  });
});
