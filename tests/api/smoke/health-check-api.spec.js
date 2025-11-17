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

  test('GET /healthCheck - API should be accessible and healthy', async () => {
    // Make GET request to health check endpoint
    const response = await apiContext.get('/healthCheck');

    // Log response for debugging
    console.log(`Health check response status: ${response.status()}`);
    const responseBody = await response.json();
    console.log('Health check response body:', JSON.stringify(responseBody, null, 2));

    // Verify HTTP status is 200 OK
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // Verify response structure matches expected schema
    expect(responseBody).toHaveProperty('status');
    expect(responseBody).toHaveProperty('message');
    expect(responseBody).toHaveProperty('data');

    // Verify status code in response body
    expect(responseBody.status).toBe(200);

    // Verify message is OK
    expect(responseBody.message).toBe('OK');

    // Verify data object contains status
    expect(responseBody.data).toHaveProperty('status');
    expect(responseBody.data.status).toBe('OK');
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

  test('GET /healthCheck - should be idempotent (multiple calls same result)', async () => {
    // Make multiple requests
    const response1 = await apiContext.get('/healthCheck');
    const response2 = await apiContext.get('/healthCheck');
    const response3 = await apiContext.get('/healthCheck');

    // All should return 200 OK
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    expect(response3.status()).toBe(200);

    // All should have same response structure
    const body1 = await response1.json();
    const body2 = await response2.json();
    const body3 = await response3.json();

    expect(body1.data.status).toBe('OK');
    expect(body2.data.status).toBe('OK');
    expect(body3.data.status).toBe('OK');
  });
});
