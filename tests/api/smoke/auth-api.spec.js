/**
 * API Smoke Tests - Authentication
 *
 * Purpose: Fast, critical API tests to verify authentication endpoints are working
 * Run: npx playwright test --project=api-smoke
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication API - Smoke Tests', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    // Create a new API request context
    apiContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ignoreHTTPSErrors: true, // For dev/staging environments with self-signed certs
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('API health check - verify API is accessible', async () => {
    // Adjust endpoint based on your actual health check endpoint
    const response = await apiContext.get('/health', {
      failOnStatusCode: false, // Don't throw error if endpoint doesn't exist
    });

    // If no health endpoint exists, you can test any simple GET endpoint
    // Just checking if we can reach the API
    console.log(`API response status: ${response.status()}`);
    expect([200, 404, 401]).toContain(response.status()); // API is reachable
  });

  test('POST /api/auth/login - successful authentication', async () => {
    const response = await apiContext.post('/api/auth/login', {
      data: {
        username: process.env.API_USERNAME || 'test-user',
        password: process.env.API_PASSWORD || 'test-password',
      },
      failOnStatusCode: false,
    });

    console.log(`Login response status: ${response.status()}`);

    // Verify successful response
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Login response:', JSON.stringify(responseBody, null, 2));

    // Verify response contains authentication token
    // Adjust based on your actual API response structure
    expect(responseBody).toBeTruthy();
    // Common token field names - adjust to match your API
    const hasToken = responseBody.token ||
                     responseBody.accessToken ||
                     responseBody.access_token ||
                     responseBody.authToken;
    expect(hasToken).toBeTruthy();
  });

  test('GET /api/users/me - verify authenticated request', async () => {
    // First, login to get authentication token
    const loginResponse = await apiContext.post('/api/auth/login', {
      data: {
        username: process.env.API_USERNAME || 'test-user',
        password: process.env.API_PASSWORD || 'test-password',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();

    // Extract token (adjust field name based on your API)
    const token = loginData.token ||
                  loginData.accessToken ||
                  loginData.access_token ||
                  loginData.authToken;

    expect(token).toBeTruthy();

    // Make authenticated request
    const userResponse = await apiContext.get('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });

    console.log(`User profile response status: ${userResponse.status()}`);

    expect(userResponse.ok()).toBeTruthy();
    expect(userResponse.status()).toBe(200);

    const userData = await userResponse.json();
    console.log('User data:', JSON.stringify(userData, null, 2));

    // Verify user data structure (adjust based on your API)
    expect(userData).toBeTruthy();
    expect(userData).toHaveProperty('id');
    // Add other essential fields your user object should have
  });

  test('POST /api/auth/login - invalid credentials should fail', async () => {
    const response = await apiContext.post('/api/auth/login', {
      data: {
        username: 'invalid-user',
        password: 'wrong-password',
      },
      failOnStatusCode: false,
    });

    console.log(`Invalid login response status: ${response.status()}`);

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());

    const responseBody = await response.json().catch(() => null);
    console.log('Error response:', JSON.stringify(responseBody, null, 2));
  });
});
