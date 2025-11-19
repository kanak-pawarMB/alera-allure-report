# 📊 Allure Report Setup Guide

## ✅ Installation Complete!

Allure reporting has been successfully installed and configured for your Playwright smoke tests.

---

## 🚀 Quick Start

### Method 1: Double-Click Batch Files (EASIEST) ⭐

1. **Run Tests + Generate Report (All-in-One)**
   - Double-click: `run-tests-and-report.bat`
   - This will:
     1. Run all smoke tests
     2. Generate Allure report
     3. Open report in browser

2. **Generate Report Only** (if tests already run)
   - Double-click: `generate-allure-report.bat`
   - Uses existing test results in `allure-results/`

3. **Serve Report** (Alternative Method)
   - Double-click: `serve-allure-report.bat`
   - Starts a live server with the report
   - Press Ctrl+C to stop server when done

4. **Clean Old Results**
   - Double-click: `clean-allure-results.bat`
   - Removes `allure-results/` and `allure-report/` folders

---

## 📁 What Was Installed

### Packages Installed:
```json
{
  "allure-playwright": "^3.4.2",
  "allure-commandline": "^2.34.1",
  "rimraf": "^6.1.0"
}
```

### Configuration Updated:

**1. playwright.config.js**
- Added `allure-playwright` reporter
- Configured to output results to `allure-results/`
- Added environment info (Environment, Node version, OS)

**2. package.json**
- Added npm scripts for Allure:
  - `allure:generate`
  - `allure:open`
  - `allure:serve`
  - `allure:clean`

**3. .gitignore**
- Added `/allure-results/`
- Added `/allure-report/`

---

## 📊 Understanding Allure Reports

### What You'll See:

**1. Overview Dashboard**
- Total tests: 27 smoke tests
- Pass/Fail statistics
- Test duration
- Execution timeline
- Trend graphs

**2. Test Suites**
Organized by:
- Care Management (6 tests)
- Demographics (3 tests)
- Dynamic Dashboard (3 tests)
- Health Plan Card (1 test)
- Login (3 tests)
- PCP Card (3 tests)
- Search (8 tests)

**3. Test Details**
Each test shows:
- **Steps**: Detailed execution steps
- **Screenshots**: Automatic on failure
- **Timing**: Duration of each step
- **Qase ID**: Test case traceability
- **Status**: Passed/Failed/Broken

**4. Categories**
- Smoke Tests
- By Feature (Search, Dashboard, Cards)
- By Status (Passed, Failed)

**5. Graphs**
- Test execution trend
- Duration trend over time
- Test status distribution
- Flaky test detection

---

## 💻 Command Line Usage

### Run Tests and Generate Report:
```bash
# Run smoke tests
npm run test:smoke

# Generate Allure report
npm run allure:generate

# Open the report
npm run allure:open
```

### Alternative - Serve Report Directly:
```bash
# Run tests
npm run test:smoke

# Serve report (auto-generates and opens)
npm run allure:serve
```

### Clean Old Results:
```bash
npm run allure:clean
```

---

## 📂 Folder Structure

```
project-root/
├── allure-results/          # Test execution results (JSON)
│   ├── *-result.json       # Test results
│   ├── *-attachment.json   # Screenshots, traces
│   └── ...
├── allure-report/           # Generated HTML report
│   ├── index.html          # Open this to view report
│   ├── data/
│   ├── plugins/
│   └── ...
├── tests/
│   └── smoke/              # Smoke test specs
│       ├── CareManagement.spec.js
│       ├── Demographics.spec.js
│       └── ...
└── playwright.config.js    # Allure reporter configured here
```

---

## 🎯 Workflow

### Typical Daily Usage:

1. **Write/Update Tests**
   - Edit test files in `tests/smoke/`

2. **Run Tests**
   - Double-click `run-tests-and-report.bat`
   - OR run: `npm run test:smoke`

3. **View Report**
   - Report opens automatically
   - OR run: `npm run allure:open`

4. **Analyze Results**
   - Check pass/fail status
   - Review failed tests
   - See screenshots of failures
   - Track trends over time

5. **Clean Up (Optional)**
   - Before new test run: `clean-allure-results.bat`

---

## 🔍 Report Features Explained

### 1. Suites Tab
- **Purpose**: See all test suites organized hierarchically
- **Use Case**: Navigate to specific test suite
- **Features**:
  - Expand/collapse suites
  - Filter by status
  - Search tests

### 2. Graphs Tab
- **Purpose**: Visual analytics of test execution
- **Charts**:
  - Status breakdown (pie chart)
  - Severity distribution
  - Duration trend
  - Categories distribution

### 3. Timeline Tab
- **Purpose**: See when tests ran and how long they took
- **Use Case**: Identify slow tests or parallelization issues
- **Features**:
  - Visual timeline
  - Concurrent execution view
  - Duration per test

### 4. Behaviors Tab
- **Purpose**: BDD-style view of tests
- **Organization**:
  - Epic → Feature → Story
  - Test scenarios grouped by functionality

### 5. Packages Tab
- **Purpose**: Technical view by test file location
- **Use Case**: Developer-focused navigation

---

## 🏷️ Test Annotations

All smoke tests include:
- **@smoke tag**: Identifies smoke tests
- **Qase ID**: Links to test management system
- **Suite name**: Groups related tests

Example in code:
```javascript
test('ONEVIEW-22: Verify Demographics card loads @smoke', async ({ page }) => {
  test.info().annotations.push({ type: 'qaseId', description: '22' });
  // Test steps...
});
```

---

## 🔄 Integration with Qase

Tests are integrated with Qase.io:
- **Qase IDs** appear in Allure report
- Test results sync to Qase automatically
- Traceability between Allure and Qase

---

## 🛠️ Troubleshooting

### Problem: "allure-results directory not found"
**Solution**: Run tests first
```bash
npm run test:smoke
```

### Problem: Report shows old data
**Solution**: Clean and regenerate
```bash
npm run allure:clean
npm run test:smoke
npm run allure:generate
```

### Problem: Can't open report
**Solution**: Use serve instead
```bash
npm run allure:serve
```

### Problem: Port already in use
**Solution**: Stop other Allure servers or change port
- Close other terminal windows
- Restart your computer if needed

---

## 📈 CI/CD Integration

### GitHub Actions Example:
```yaml
- name: Run Smoke Tests
  run: npm run test:smoke

- name: Generate Allure Report
  if: always()
  run: npm run allure:generate

- name: Upload Allure Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: allure-report
    path: allure-report/
    retention-days: 30

- name: Publish Allure Report
  if: always()
  uses: simple-elf/allure-report-action@master
  with:
    allure_results: allure-results
    gh_pages: gh-pages
    allure_report: allure-report
    allure_history: allure-history
```

---

## 📋 Available Batch Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `run-tests-and-report.bat` | Run tests + generate report | Daily testing |
| `generate-allure-report.bat` | Generate report from existing results | After manual test run |
| `serve-allure-report.bat` | Serve live report | Alternative to generate |
| `clean-allure-results.bat` | Delete old results | Start fresh |

---

## 💡 Tips & Best Practices

1. **Keep Historical Data**
   - Don't clean `allure-results` too often
   - Allure tracks trends across runs

2. **Run Tests Regularly**
   - More test runs = better trend data
   - Helps identify flaky tests

3. **Review Failed Tests**
   - Screenshots are auto-captured
   - Error logs included in attachments

4. **Use Categories**
   - Filter by @smoke tag
   - Group by suite name

5. **Share Reports**
   - `allure-report/` folder is standalone
   - Can be hosted on any web server
   - Or share via GitHub Pages

---

## 🎓 Learn More

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Allure Playwright Plugin](https://www.npmjs.com/package/allure-playwright)
- [Playwright Documentation](https://playwright.dev/)

---

## ✅ Summary

**✅ Allure is fully configured and ready to use!**

**Quick Start:**
1. Double-click `run-tests-and-report.bat`
2. Wait for tests to complete
3. Report opens in browser automatically

**That's it! Enjoy your beautiful Allure reports!** 🎉
