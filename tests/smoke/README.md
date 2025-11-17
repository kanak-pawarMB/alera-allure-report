# Smoke Tests

## Overview
Smoke tests are **critical path tests** that verify the most essential functionality of the Alera ONEView application. These tests should:
- Run **fast** (typically under 5 minutes)
- Cover **critical user journeys** only
- Be **stable** and rarely fail
- Run on **every deployment** before full regression

## Purpose
Smoke tests answer the question: **"Is the application fundamentally broken?"**

They do NOT:
- Test edge cases
- Validate detailed UI behavior
- Cover all possible scenarios
- Replace comprehensive regression testing

## What Belongs in Smoke Tests?

### ✅ Include:
- **Login functionality** - Can users access the application?
- **Critical navigation** - Can users reach main pages?
- **Essential search** - Can users find patients?
- **Key workflows** - Can users complete primary tasks?
- **Core data display** - Are essential cards/components visible?

### ❌ Exclude:
- Edge case validations
- Error message text verification
- Detailed UI styling checks
- Complex multi-step workflows
- Non-critical features
- Data manipulation tests
- Responsive design tests

## Current Smoke Tests

### 1. Login.spec.js
Tests the basic login page functionality:
- Page loads successfully
- Microsoft login button is visible and clickable

### 2. LandingPage.spec.js (To be added)
Tests critical dashboard functionality:
- Dashboard loads successfully
- Search field is visible and enabled
- Toggle switches work (Medicaid ID ↔ DOB + Last Name)

### 3. SearchPatient.spec.js (To be added)
Tests essential search functionality:
- Patient search by Medicaid ID works
- Patient search by DOB + Last Name works
- Search results display correctly

## Best Practices

### 1. Keep Tests Simple
```javascript
// ✅ Good - Simple and fast
test('should load dashboard', async ({ page }) => {
  await page.goto(DASHBOARD_URL);
  expect(page.url()).toContain('dashboard');
});

// ❌ Bad - Too detailed for smoke test
test('should validate all dashboard elements', async ({ page }) => {
  // ... 50 lines of detailed UI validation
});
```

### 2. Test Happy Path Only
Smoke tests should ONLY test successful scenarios:
- ✅ Valid login
- ✅ Successful search
- ✅ Data loads correctly

Leave error handling and edge cases for regression tests.

### 3. Use Minimal Assertions
```javascript
// ✅ Good - Just verify it's there
await expect(searchField).toBeVisible();

// ❌ Bad - Too many details
await expect(searchField).toBeVisible();
await expect(searchField).toBeEnabled();
await expect(searchField).toHaveAttribute('placeholder', 'exact text');
await expect(searchField).toHaveCSS('color', 'rgb(0, 0, 0)');
```

### 4. Keep Tests Independent
Each test should:
- Set up its own data
- Not depend on other tests
- Clean up after itself

### 5. Use Meaningful Test Names
```javascript
// ✅ Good
test('should load the dashboard page successfully', ...)

// ❌ Bad
test('test1', ...)
test('dashboard stuff', ...)
```

## Running Smoke Tests

### Run ALL smoke tests:
```bash
# Run smoke tests in all browsers
npx playwright test tests/smoke

# Run smoke tests in specific browser
npx playwright test tests/smoke --project=chromium

# Run in headed mode
npx playwright test tests/smoke --headed
```

### Run smoke tests using the configured project:
```bash
# Run the smoke project (Chromium only)
npx playwright test --project=smoke
```

### Run specific smoke test file:
```bash
npx playwright test tests/smoke/Login.spec.js
```

## CI/CD Integration

### Smoke Test Strategy:
1. **On Pull Request** - Run smoke tests first (fast feedback)
2. **On Merge** - Run full regression suite
3. **Before Production Deploy** - Run smoke tests as gate
4. **After Deploy** - Run smoke tests to verify deployment

### Example GitHub Actions:
```yaml
- name: Run Smoke Tests
  run: npx playwright test --project=smoke

- name: Run Full Regression (if smoke passes)
  if: success()
  run: npx playwright test
```

## When to Add a New Smoke Test

Ask yourself:
1. ⚠️ **Is this feature critical?** - If it breaks, does the app become unusable?
2. ⏱️ **Is this test fast?** - Can it complete in under 30 seconds?
3. 🎯 **Is this the happy path?** - Does it test the most common successful scenario?

If **YES** to all three → Add to smoke tests
If **NO** to any → Keep in regression suite

## Maintenance

### Keep Smoke Suite Small
- **Target:** 10-20 tests maximum
- **Time:** Complete in under 5 minutes
- **Review:** Quarterly to ensure tests are still relevant

### Remove Tests If:
- Test becomes flaky
- Feature is no longer critical
- Test takes too long
- Better covered elsewhere

## Questions?

Refer to:
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [CLAUDE.md](../../CLAUDE.md) for project-specific guidance
- Full regression tests in [tests/](../) directory
