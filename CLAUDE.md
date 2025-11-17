# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright-based end-to-end test automation project for the Alera ONEView healthcare application. The project uses ES modules and includes:
- **UI Tests**: Web application testing (accessed via Azure Static Web Apps)
- **API Tests**: REST API testing (accessed via ngrok tunnel or production URL)

## Key Commands

### Running UI Tests
```bash
# Run UI smoke tests (fast critical path - recommended first)
npx playwright test --project=smoke

# Run all UI tests
npx playwright test

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run a single test file
npx playwright test tests/Login.spec.js

# Run all smoke tests from the smoke folder
npx playwright test tests/smoke

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run specific test by grep pattern
npx playwright test -g "should load the login page"
```

### Running API Tests
```bash
# Run API smoke tests (recommended first)
npx playwright test --project=api-smoke

# Run API regression tests
npx playwright test --project=api-regression

# Run all API tests (smoke + regression)
npx playwright test tests/api

# Run specific API test file
npx playwright test tests/api/smoke/health-check-api.spec.js

# Run API tests with verbose output
npx playwright test --project=api-smoke --reporter=list

# Run both UI and API smoke tests
npx playwright test --project=smoke --project=api-smoke
```

### View Test Reports
```bash
# Open the HTML report
npx playwright show-report
```

### Install/Update Browsers
```bash
# Install Playwright browsers
npx playwright install

# Install browsers with system dependencies
npx playwright install --with-deps
```

## Architecture

### Configuration
- **playwright.config.js**: Main configuration file
  - Uses ES modules (`type: "module"` in package.json)
  - Loads environment variables from `.env` using dotenv
  - Configured for 3 browsers: Chromium, Firefox, and Webkit
  - Tests run in parallel by default (`fullyParallel: true`)
  - On CI: runs sequentially (workers: 1), retries up to 2 times
  - Trace collection enabled on first retry for debugging

### Environment Variables
Environment-specific configuration is stored in `.env` file (not committed to git):

**UI Testing:**
- `LOGIN_URL`: The web application URL (Azure Static Web Apps)

**API Testing:**
- `API_BASE_URL`: The API base URL (ngrok tunnel for dev, production URL for prod)
- `API_USERNAME`: Username for API authentication
- `API_PASSWORD`: Password for API authentication

**When deploying or switching environments:** Simply update the URLs in `.env` - no code changes needed!

Add new environment variables to `.env` and access via `process.env.VARIABLE_NAME`

### Test Structure
Tests are organized into UI and API test categories:

#### UI Tests

##### 1. UI Smoke Tests (`tests/smoke/`)
**Purpose:** Fast, critical path tests that verify the application is not fundamentally broken.
- **Run first** - Quick feedback (target: under 5 minutes)
- **Happy path only** - Test successful scenarios
- **Minimal assertions** - Just verify core functionality works
- **Chromium only** - No cross-browser testing in smoke suite
- **Zero retries** - Must be stable and reliable

**Current smoke tests:**
- `Login.spec.js` - Basic login functionality
- `Search.spec.js` - Search functionality
- Additional critical path tests to be added

**When to add a smoke test:**
- Feature is critical (app unusable if broken)
- Test is fast (completes in under 30 seconds)
- Tests the most common successful scenario

See [tests/smoke/README.md](tests/smoke/README.md) for detailed guidelines.

##### 2. UI Regression Tests (`tests/`)
**Purpose:** Comprehensive test coverage including edge cases, validations, and detailed UI testing.
- Each spec file follows the pattern `*.spec.js`
- Tests use `test.describe()` for grouping related tests
- Common setup is done in `test.beforeEach()` hooks
- Run across all browsers (Chromium, Firefox, Safari)
- Include error handling, validation, and edge cases

#### API Tests

##### 3. API Smoke Tests (`tests/api/smoke/`)
**Purpose:** Fast, critical API endpoint tests to verify the API is functional.
- **Run first** - Quick feedback (target: under 2 minutes)
- **Critical endpoints only** - Health check, authentication, key endpoints
- **Happy path scenarios** - Test successful API responses
- **Zero retries** - Must be stable and reliable

**Current API smoke tests:**
- `health-check-api.spec.js` - API health check endpoint
- `auth-api.spec.js` - Authentication endpoints (template)

**When to add an API smoke test:**
- Endpoint is critical for application functionality
- Test completes in under 10 seconds
- Tests the most common successful scenario

##### 4. API Regression Tests (`tests/api/regression/`)
**Purpose:** Comprehensive API test coverage for all endpoints.
- **Full CRUD coverage** - GET, POST, PUT, DELETE for all resources
- **Edge cases** - Error handling, validation, boundary conditions
- **Authentication & Authorization** - Test protected endpoints
- **Data validation** - Verify response schemas and data types
- **Performance checks** - Response time assertions

**Example test files:**
- `patients-api.spec.js` - Patient management endpoints (template)

See [tests/api/README.md](tests/api/README.md) for detailed API testing guidelines.

### Locator Strategy
The project uses multiple fallback locators to handle different HTML structures:
- Prefer semantic locators: `page.getByRole()`, `page.getByText()`
- Use `.or()` chaining for fallback locators when element structure is uncertain
- Example: `page.locator('p:has-text("text")').or(page.getByText('text'))`

## CI/CD
GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on:
- Push to main/master branches
- Pull requests to main/master branches

The workflow installs dependencies, browsers, runs tests, and uploads HTML reports as artifacts (retained for 30 days).

### Recommended CI/CD Strategy
1. **On Pull Request**: Run UI and API smoke tests first for fast feedback
2. **On Merge to Main**: Run full UI and API regression suite
3. **Before Production Deploy**: Run UI and API smoke tests as a gate
4. **After Deploy**: Run UI and API smoke tests to verify deployment

Example GitHub Actions steps:
```yaml
# Run smoke tests in parallel for fast feedback
- name: Run UI Smoke Tests
  run: npx playwright test --project=smoke

- name: Run API Smoke Tests
  run: npx playwright test --project=api-smoke
  env:
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
    API_USERNAME: ${{ secrets.API_USERNAME }}
    API_PASSWORD: ${{ secrets.API_PASSWORD }}

# Run full regression if smoke tests pass
- name: Run Full UI Regression
  if: success()
  run: npx playwright test --project=chromium

- name: Run Full API Regression
  if: success()
  run: npx playwright test --project=api-regression
  env:
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
    API_USERNAME: ${{ secrets.API_USERNAME }}
    API_PASSWORD: ${{ secrets.API_PASSWORD }}
```

## Best Practices
- Use standard practice while writing scripts
- Keep smoke tests minimal and fast (target: under 5 minutes)
- Add comprehensive coverage in regression tests
- Use semantic locators (`page.getByRole()`) whenever possible
- Use `.or()` chaining for fallback locators when needed