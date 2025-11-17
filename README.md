# Alera ONEView Test Automation

End-to-end test automation framework for the Alera ONEView healthcare application, built with Playwright.

## Overview

This project provides comprehensive test coverage for the Alera ONEView platform, including both UI and API testing capabilities. The framework is designed for reliability, speed, and maintainability with a focus on fast feedback through smoke tests and thorough coverage via regression tests.

## Features

- **UI Testing**: Cross-browser testing (Chromium, Firefox, WebKit) for web application
- **API Testing**: REST API endpoint testing with authentication support
- **Smoke Tests**: Fast, critical path tests for quick feedback (target: <5 minutes)
- **Regression Tests**: Comprehensive test coverage including edge cases
- **CI/CD Ready**: GitHub Actions workflow pre-configured
- **Parallel Execution**: Tests run in parallel for faster execution
- **HTML Reports**: Detailed test reports with screenshots and traces
- **Environment Management**: Easy environment switching via .env configuration

## Prerequisites

- **Node.js**: Version 14 or higher
- **npm**: Version 6 or higher
- **Git**: For version control

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Sachin-Mindbowser/alera-health-oneview-QA.git
cd alera-health-oneview-QA
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Configuration

Create a `.env` file in the project root with the following variables:

```env
# UI Testing
LOGIN_URL=https://your-app-url.azurestaticapps.net

# API Testing
API_BASE_URL=https://your-api-url.com
API_USERNAME=your-username
API_PASSWORD=your-password
```

**Note**: The `.env` file is excluded from version control for security. Update these values based on your environment (dev, staging, production).

## Running Tests

### UI Tests

```bash
# Run UI smoke tests (recommended first - fast critical path)
npx playwright test --project=smoke

# Run all UI tests
npx playwright test

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run a single test file
npx playwright test tests/smoke/Login.spec.js

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run specific test by pattern
npx playwright test -g "should load the login page"
```

### API Tests

```bash
# Run API smoke tests (recommended first)
npx playwright test --project=api-smoke

# Run API regression tests
npx playwright test --project=api-regression

# Run all API tests
npx playwright test tests/api

# Run specific API test file
npx playwright test tests/api/smoke/health-check-api.spec.js

# Run API tests with verbose output
npx playwright test --project=api-smoke --reporter=list
```

### Combined Tests

```bash
# Run both UI and API smoke tests
npx playwright test --project=smoke --project=api-smoke
```

### View Test Reports

```bash
# Open the HTML report
npx playwright show-report
```

## Project Structure

```
alera-health-oneview-QA/
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI/CD workflow configuration
├── tests/
│   ├── smoke/                      # UI smoke tests (fast, critical path)
│   │   ├── Login.spec.js
│   │   ├── Search.spec.js
│   │   └── README.md
│   ├── regression/                 # UI regression tests (comprehensive)
│   │   ├── Login.spec.js
│   │   ├── SearchPatient.spec.js
│   │   └── DemographicDetails.spec.js
│   ├── api/
│   │   ├── smoke/                  # API smoke tests
│   │   │   ├── health-check-api.spec.js
│   │   │   └── auth-api.spec.js
│   │   ├── regression/             # API regression tests
│   │   └── utils/
│   │       └── api-helpers.js      # API utility functions
│   └── testData.js                 # Test data configuration
├── utils/
│   └── responsiveHelpers.js        # Responsive testing utilities
├── playwright.config.js            # Playwright configuration
├── package.json                    # Project dependencies
├── .env                            # Environment variables (not in git)
├── .gitignore                      # Git ignore rules
├── CLAUDE.md                       # Claude Code AI assistant instructions
└── README.md                       # This file
```

## Test Strategy

### Smoke Tests
- **Purpose**: Fast feedback on critical functionality
- **Target Time**: Under 5 minutes
- **Coverage**: Happy path only, minimal assertions
- **Browser**: Chromium only
- **Retries**: Zero (must be stable)
- **When to Run**: On every pull request, before deployments

### Regression Tests
- **Purpose**: Comprehensive coverage
- **Coverage**: Edge cases, validations, error handling
- **Browsers**: Chromium, Firefox, WebKit
- **When to Run**: On merge to main, scheduled nightly runs

## CI/CD

The project includes a GitHub Actions workflow that:
- Runs on push/PR to main/master branches
- Installs dependencies and browsers
- Executes tests
- Uploads HTML reports as artifacts (retained for 30 days)

### Recommended CI/CD Strategy

1. **On Pull Request**: Run smoke tests for fast feedback
2. **On Merge to Main**: Run full regression suite
3. **Before Production Deploy**: Run smoke tests as a gate
4. **After Deploy**: Run smoke tests to verify deployment

## Best Practices

- **Locator Strategy**: Prefer semantic locators (`page.getByRole()`, `page.getByText()`)
- **Fallback Locators**: Use `.or()` chaining for resilient element selection
- **Test Independence**: Each test should be independent and runnable in isolation
- **Test Data**: Use the `tests/testData.js` file for test data management
- **Page Objects**: Consider implementing Page Object Model for better maintainability
- **Assertions**: Use meaningful assertion messages for easier debugging

## Writing New Tests

### Adding a Smoke Test

Smoke tests should be:
- **Critical**: Application unusable if broken
- **Fast**: Under 30 seconds
- **Stable**: Zero retries, reliable
- **Happy Path**: Test successful scenarios only

See `tests/smoke/README.md` for detailed guidelines.

### Adding a Regression Test

Regression tests should include:
- Edge cases and boundary conditions
- Error handling and validation
- Cross-browser compatibility
- Detailed assertions

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LOGIN_URL` | Web application URL | `https://app.azurestaticapps.net` |
| `API_BASE_URL` | API base URL | `https://api.example.com` |
| `API_USERNAME` | API authentication username | `test-user` |
| `API_PASSWORD` | API authentication password | `test-pass` |

## Troubleshooting

### Tests Failing Locally

1. Ensure browsers are installed: `npx playwright install`
2. Check `.env` file has correct URLs and credentials
3. Run in headed mode to see what's happening: `npx playwright test --headed`
4. Use debug mode: `npx playwright test --debug`

### Tests Passing Locally but Failing in CI

1. Check CI environment variables are set correctly
2. Review test artifacts and screenshots in GitHub Actions
3. Enable trace collection for failed tests (already configured)

## Contributing

1. Create a feature branch from `master`
2. Write tests following the existing patterns
3. Ensure all smoke tests pass: `npx playwright test --project=smoke --project=api-smoke`
4. Create a pull request with a clear description

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## License

This project is proprietary and confidential.

## Support

For issues or questions, please contact the QA team or create an issue in this repository.
