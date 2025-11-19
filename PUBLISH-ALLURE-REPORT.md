# 📊 How to Publish Allure Report to GitHub Pages

## Quick Guide - Manual Publishing Only

### 🎯 What This Does
- Publishes your Allure report to a public GitHub Pages URL
- **Manual trigger only** - you decide when to publish
- Does NOT publish automatically on every test run

---

## 🚀 One-Time Setup (Do This First)

### Step 1: Enable GitHub Pages
1. Go to your GitHub repository
2. Click **Settings** → **Pages** (in left sidebar)
3. Under **Source**:
   - Select: `Deploy from a branch`
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

### Step 2: Set Workflow Permissions
1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select: **"Read and write permissions"**
4. Check: **"Allow GitHub Actions to create and approve pull requests"**
5. Click **Save**

---

## 📤 How to Publish Your Report

### Method 1: Using GitHub Website (Easiest)

1. Go to your GitHub repository
2. Click the **Actions** tab
3. In the left sidebar, click **"Publish Allure Report to GitHub Pages"**
4. Click the **"Run workflow"** button (on the right)
5. Select branch: `master` (or your main branch)
6. Click **"Run workflow"** (green button)
7. Wait for the workflow to complete (green checkmark ✅)
8. Your report is now published!

**Your Report URL:**
```
https://[your-username].github.io/[repository-name]/allure-report/
```

**Example:**
```
https://santosh-hundekar.github.io/Alerahealth-Oneview/allure-report/
```

### Method 2: Using GitHub CLI (Command Line)

```bash
# Make sure you have allure-results ready
# (run tests first if needed)
npm run test:smoke

# Trigger the publish workflow
gh workflow run publish-allure-report.yml

# Check workflow status
gh run list --workflow=publish-allure-report.yml
```

---

## 📋 Complete Workflow Example

### Typical Usage:

```bash
# 1. Run your tests locally
npm run test:smoke

# 2. Generate and view report locally (optional)
npm run allure:generate
npm run allure:open

# 3. When satisfied, commit your test results
git add allure-results/
git commit -m "Add test results"
git push origin master

# 4. Manually publish to GitHub Pages
# Go to GitHub → Actions → "Publish Allure Report" → Run workflow
```

---

## ❓ When Should I Publish?

Publish your report when:
- ✅ You want to share test results with your team
- ✅ You've completed a test cycle or sprint
- ✅ You need to demonstrate test coverage
- ✅ You want to track trends over time

You do NOT need to publish:
- ❌ After every single test run
- ❌ During development/debugging
- ❌ For personal/local testing

---

## 🔍 Accessing Your Published Report

**Your report will be available at:**
```
https://[username].github.io/[repository]/allure-report/
```

**To find your exact URL:**
1. Go to **Settings** → **Pages**
2. Look for: **"Your site is published at..."**
3. Add `/allure-report/` to the end

**Bookmark this URL** - it will always show the latest published report.

---

## 🛠️ Troubleshooting

### Problem: "404 Not Found" when accessing report

**Solution:**
1. Make sure you completed the [One-Time Setup](#-one-time-setup-do-this-first)
2. Verify the workflow completed successfully (green checkmark in Actions tab)
3. Wait 2-3 minutes after workflow completes (GitHub Pages needs time to deploy)
4. Try accessing: `https://[username].github.io/[repo]/allure-report/index.html`

### Problem: Workflow fails with "Permission denied"

**Solution:**
- Check workflow permissions (see [Step 2](#step-2-set-workflow-permissions) above)

### Problem: Old report still showing

**Solution:**
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- The workflow uses `keep_files: false` so it replaces the old report

---

## 📁 Files Created

This setup created:
- `.github/workflows/publish-allure-report.yml` - Manual publish workflow
- `PUBLISH-ALLURE-REPORT.md` - This guide

Your original test workflow (`.github/workflows/playwright.yml`) remains unchanged.

---

## ✅ Quick Checklist

**One-Time Setup:**
- [ ] GitHub Pages enabled
- [ ] Source set to `gh-pages` branch
- [ ] Workflow permissions set to "Read and write"

**Each Time You Want to Publish:**
- [ ] Run tests: `npm run test:smoke`
- [ ] Push changes: `git push origin master`
- [ ] Go to GitHub → Actions → "Publish Allure Report"
- [ ] Click "Run workflow"
- [ ] Wait for completion
- [ ] Access your report URL

---

## 🎉 That's It!

You now have full control over when your Allure reports are published to GitHub Pages.

**Next Steps:**
1. Complete the [One-Time Setup](#-one-time-setup-do-this-first)
2. Run your first manual publish
3. Bookmark your report URL
4. Share the link with your team!
