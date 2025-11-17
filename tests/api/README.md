# API Testing Guide

This directory contains API tests for the Alera ONEView application using Playwright's API testing capabilities.

## Directory Structure

```
tests/api/
├── smoke/              # Fast, critical API endpoint tests
│   ├── health-check-api.spec.js
│   └── auth-api.spec.js
├── regression/         # Comprehensive API test coverage
│   └── patients-api.spec.js (example)
└── utils/              # Reusable helper functions
    └── api-helpers.js
```

## Quick Start

### 1. Configure Environment Variables

Update [.env](../../.env) with your API details:

```bash
# API Base URL - Update this when switching environments
API_BASE_URL=https://your-api-url.ngrok-free.dev

# API Credentials
API_USERNAME=your-username
API_PASSWORD=your-password
```

### 2. Run API Tests

```bash
# Run all API smoke tests (recommended first)
npx playwright test --project=api-smoke

# Run specific API test file
npx playwright test tests/api/smoke/health-check-api.spec.js

# Run all API regression tests
npx playwright test --project=api-regression

# Run all API tests (smoke + regression)
npx playwright test tests/api

# Run with detailed output
npx playwright test --project=api-smoke --reporter=list

# Run in debug mode
npx playwright test tests/api/smoke/health-check-api.spec.js --debug
```

## Test Categories

### Smoke Tests (`tests/api/smoke/`)

**Purpose:** Fast, critical endpoint tests to verify API is functional

**Characteristics:**
- Fast execution (target: under 2 minutes total)
- Tests critical endpoints only
- Happy path scenarios
- Zero retries (must be stable)
- Runs before deployments

**When to add a smoke test:**
- Endpoint is critical for application functionality
- Test completes in under 10 seconds
- Tests the most common successful scenario

**Current smoke tests:**
- `health-check-api.spec.js` - API health check endpoint
- `auth-api.spec.js` - Authentication endpoints (template)

### Regression Tests (`tests/api/regression/`)

**Purpose:** Comprehensive API test coverage

**Characteristics:**
- Covers all endpoints and methods (GET, POST, PUT, DELETE)
- Tests edge cases and error scenarios
- Includes data validation tests
- Tests authentication and authorization
- Performance checks
- Can have retries on CI (configured in playwright.config.js)

**Example test file:**
- `patients-api.spec.js` - Full CRUD operations for patients (template)

## Writing API Tests

### Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';

test.describe('Your API Endpoint', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
        'accept': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET /endpoint - description', async () => {
    const response = await apiContext.get('/endpoint');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('expectedField');
  });
});
```

### Using Helper Functions

```javascript
import { getAuthToken, createTestPatient } from '../utils/api-helpers.js';

test('Protected endpoint with auth', async () => {
  const token = await getAuthToken(apiContext);

  const response = await apiContext.get('/protected-endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  expect(response.ok()).toBeTruthy();
});
```

## Environment Management

### Multiple Environments

Create separate environment files for different stages:

```bash
.env.dev      # Development (ngrok)
.env.staging  # Staging environment
.env.prod     # Production
```

**Run tests against specific environment:**

```bash
# Option 1: Temporarily set environment variable
API_BASE_URL=https://staging-api.com npx playwright test --project=api-smoke

# Option 2: Use different env file
cp .env.staging .env
npx playwright test --project=api-smoke
```

### Switching from ngrok to Production

**No code changes needed!** Just update [.env](../../.env):

```bash
# Before (Development with ngrok)
API_BASE_URL=https://abc123.ngrok-free.dev

# After (Production)
API_BASE_URL=https://api.alerahealth.com
```

## Best Practices

### 1. Test Organization
- **Smoke tests:** Only critical happy paths
- **Regression tests:** Comprehensive coverage including edge cases
- Group related tests using `test.describe()`
- Use descriptive test names: `'GET /endpoint - should return paginated results'`

### 2. Authentication
- Use helper functions for login (`getAuthToken()`)
- Store tokens in test context, not global variables
- Clean up test data after tests complete

### 3. Test Data
- Use unique identifiers (timestamps) for test data
- Clean up created test data in `afterAll()` hooks
- Use the `testDataGenerator` utility for random data

### 4. Assertions
```javascript
// Good - Specific assertions
expect(response.status()).toBe(200);
expect(data).toHaveProperty('id');
expect(data.email).toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

// Bad - Vague assertions
expect(response.ok()).toBeTruthy();
expect(data).toBeTruthy();
```

### 5. Error Handling
```javascript
// Use failOnStatusCode: false when testing error responses
const response = await apiContext.post('/endpoint', {
  data: invalidData,
  failOnStatusCode: false,
});

expect(response.status()).toBe(400);
expect(await response.json()).toHaveProperty('errors');
```

### 6. Logging
```javascript
// Log responses for debugging
console.log('Response status:', response.status());
const body = await response.json();
console.log('Response body:', JSON.stringify(body, null, 2));
```

## Common Patterns

### GET Request with Query Parameters
```javascript
const response = await apiContext.get('/api/patients', {
  params: {
    page: 1,
    limit: 10,
    search: 'John',
  },
});
```

### POST Request with JSON Body
```javascript
const response = await apiContext.post('/api/patients', {
  data: {
    firstName: 'John',
    lastName: 'Doe',
  },
});
```

### Authenticated Request
```javascript
const token = await getAuthToken(apiContext);

const response = await apiContext.get('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Testing Error Responses
```javascript
const response = await apiContext.post('/api/endpoint', {
  data: invalidData,
  failOnStatusCode: false,
});

expect([400, 422]).toContain(response.status());
const errors = await response.json();
expect(errors).toHaveProperty('message');
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run API Smoke Tests
  run: npx playwright test --project=api-smoke
  env:
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
    API_USERNAME: ${{ secrets.API_USERNAME }}
    API_PASSWORD: ${{ secrets.API_PASSWORD }}

- name: Run API Regression Tests
  if: success()
  run: npx playwright test --project=api-regression
```

### Recommended CI/CD Strategy

1. **On Pull Request:** Run API smoke tests
2. **On Merge to Main:** Run full API regression suite
3. **Before Deploy:** Run API smoke tests as gate
4. **After Deploy:** Run API smoke tests to verify deployment

## Troubleshooting

### Common Issues

**Issue:** `Error: connect ECONNREFUSED`
- **Solution:** Verify API_BASE_URL in .env is correct and API is running

**Issue:** `401 Unauthorized`
- **Solution:** Check API_USERNAME and API_PASSWORD in .env

**Issue:** `Test timeout`
- **Solution:** Increase timeout in test or check API performance

**Issue:** ngrok URL changed
- **Solution:** Update API_BASE_URL in .env with new ngrok URL

### Debug Mode

```bash
# Run test in debug mode with Playwright Inspector
npx playwright test tests/api/smoke/health-check-api.spec.js --debug

# Run with verbose logging
DEBUG=pw:api npx playwright test --project=api-smoke
```

## Next Steps

1. **Add your endpoints:** Create test files for your API endpoints
2. **Update auth helper:** Modify `getAuthToken()` to match your auth flow
3. **Add more smoke tests:** Identify critical endpoints for smoke suite
4. **Expand regression tests:** Add comprehensive coverage for all endpoints

## Resources

- [Playwright API Testing Docs](https://playwright.dev/docs/api-testing)
- [Playwright Request Context](https://playwright.dev/docs/api/class-apirequestcontext)
- [Project CLAUDE.md](../../CLAUDE.md) - Main project documentation
