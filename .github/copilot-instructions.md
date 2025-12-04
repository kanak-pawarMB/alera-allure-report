# Copilot Instructions for Alera ONEView QA

This is a **Playwright-based end-to-end test automation** framework for the Alera ONEView healthcare application. ES modules configuration with comprehensive UI/API testing, Allure reporting, and multi-browser support.

## Architecture

### Project Structure
- **`tests/smoke/`** - Fast critical-path UI tests (happy path only, ~5 min total, Chromium only)
- **`tests/regression/`** - Comprehensive UI tests (edge cases, all browsers, cross-device responsive testing)
- **`tests/api/smoke/`** - Critical API health checks (~2 min total)
- **`tests/api/regression/`** - Full API CRUD and edge case coverage
- **`utils/responsiveHelpers.js`** - Responsive testing utilities (touch targets, scrolling, fonts, overlap detection)
- **`tests/testData.js`** - Centralized test data and constants (single source of truth)

### Configuration
- **`playwright.config.js`**: Multi-browser setup (Chromium, Firefox, Safari), parallel execution on local/sequential on CI
- **`package.json`**: ES modules (`"type": "module"`), npm scripts for all test scenarios
- **`.env`**: Environment variables (`LOGIN_URL`, `API_BASE_URL`, `API_USERNAME`, `API_PASSWORD`) - NOT in version control

## Key Commands

```bash
# UI Smoke Tests (ALWAYS start with these - fast feedback)
npx playwright test --project=smoke                        # Run smoke suite
npx playwright test --project=smoke --headed              # Visible browser
npx playwright test tests/smoke/HealthPlanCard.spec.js --headed --project=smoke  # Single test

# UI Regression Tests (specific browser or all)
npx playwright test --project=chromium                    # Chromium regression only
npx playwright test tests/regression/SearchPatient.spec.js  # Single file, all browsers

# API Tests
npx playwright test --project=api-smoke                   # API health checks
npx playwright test --project=api-regression              # Full API coverage

# Reports
npm run allure:clean && npx playwright test --project=smoke && npm run allure:generate && npm run allure:open
npx playwright show-report                                # HTML report (faster for local dev)
```

## Coding Patterns & Conventions

### Test Structure
Every test file follows this structure:
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and setup - thrown error will skip test
    if (!process.env.LOGIN_URL) throw new Error('LOGIN_URL not defined');
    await page.goto(process.env.LOGIN_URL);
  });

  test('ONEVIEW-66: Test description here @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '66' }); // For Qase integration
    // Test body with inline comments explaining WHY, not WHAT
  });
});
```

### Locator Strategy - **Semantic First, Fallback Chaining**
```javascript
// PREFERRED: Semantic locators
const button = page.getByRole('button', { name: /Login with Microsoft/i });
const input = page.getByRole('textbox', { name: /search/i });

// FALLBACK: Use .or() chaining for uncertain HTML structures
const element = page.locator('p:has-text("text")').or(page.getByText('text'));

// AVOID: CSS selectors unless absolutely necessary (brittle)
```

### Responsive Testing Pattern
```javascript
import { devices } from '@playwright/test';
import { checkTouchTargetSize, checkHorizontalScroll } from '../utils/responsiveHelpers.js';

test('Mobile test', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();
  
  // Verify touch targets are 44x44+ pixels (WCAG 2.1 AA)
  const box = await checkTouchTargetSize(button);
  expect(box.meetsStandard).toBeTruthy();
  
  // Verify no horizontal scroll
  const scroll = await checkHorizontalScroll(page);
  expect(scroll.hasScroll).toBeFalsy();
  
  await context.close();
});
```

### Test Categorization
- **Smoke tests**: Single happy path only, max 30 seconds, no error paths, `@smoke` tag
- **Regression tests**: Edge cases, error handling, validation, skip `@smoke` tag
- **Critical elements**: Check visibility + viewport + interactivity (enabled, clickable)

### Timeouts & Waits
```javascript
// Use appropriate wait patterns:
await page.goto(url, { timeout: 60000 });              // Initial navigation
await page.waitForLoadState('networkidle');           // Wait for async data
await page.waitForLoadState('domcontentloaded');      // Faster for loaded content
await page.waitForTimeout(2000);                      // Last resort only
await expect(element).toBeVisible({ timeout: 5000 }); // Preferred for assertions
```

## Cross-Team Integration Points

### Qase Test Management
- Tag tests with `@smoke` for critical path
- Add Qase test case IDs: `test.info().annotations.push({ type: 'qaseId', description: '66' })`
- Test descriptions follow pattern: `ONEVIEW-66: Description here`

### Allure Reporting
- Runs automatically via `allure-playwright` reporter in config
- Attach screenshots on failure, traces on retry (configured in `playwright.config.js`)
- Access via: `npm run allure:serve` (generates report + opens in browser)

### Environment Management
- **Local dev**: Uses `.env` (ignored by git)
- **CI/GitHub Actions**: Uses secrets (API_BASE_URL, API_USERNAME, API_PASSWORD)
- **Switching environments**: Only update `.env`, no code changes needed

## Critical "Gotchas" & Project-Specific Quirks

1. **`--project=smoke` vs `--project=chromium`**: ALWAYS use `--project=smoke` for smoke tests, even in headed mode. Using `--project=chromium` will skip smoke tests!

2. **Smoke tests run sequentially**: Configured with `retries: 0` - if a smoke test fails, it's genuinely broken (no flakiness masking)

3. **Mobile testing via `LoginResponsive.spec.js`**: Tests create new browser contexts with `devices['iPhone 12']`, not Playwright's `@mobile` fixture (see example in regression tests)

4. **Centralized test data**: Always read from `tests/testData.js` (e.g., `TEST_DATA.patients.completeData.medicaidId`) - maintains single source of truth across 6+ test files

5. **API context setup**: Create context once in `test.beforeAll()`, reuse in all tests, dispose in `test.afterAll()` (see `health-check-api.spec.js`)

6. **Placeholder text assertions**: Many tests verify radio button state changes update form placeholders - use `toHaveAttribute('data-state', 'on')` for radio state verification

## Add a New Test

**For smoke test (critical path only):**
1. Create file: `tests/smoke/FeatureName.spec.js`
2. Use pattern from `tests/smoke/Search.spec.js` (semantic locators, single happy path, 30s max)
3. Add `@smoke` tag to `test()` name
4. Run: `npx playwright test --project=smoke --headed`

**For regression test (comprehensive):**
1. Create file: `tests/regression/FeatureName.spec.js`
2. Use pattern from `tests/regression/SearchPatient.spec.js` (test both success + error paths)
3. Run: `npx playwright test --project=chromium` (then Firefox, Safari for full coverage)

## Debugging & CI/CD

- **Debug locally**: `npx playwright test --debug` (opens Inspector)
- **GitHub Actions**: Configured in `.github/workflows/` - runs smoke → full regression on pull requests
- **CI failures**: Check Playwright HTML report (Actions artifacts, retained 30 days) or Allure report for traces
