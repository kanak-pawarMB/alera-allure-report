// tests/auth/globalSetup.js
const { chromium } = require('@playwright/test');
const fs = require('fs');

module.exports = async () => {
  // If session already exists, skip login
  if (fs.existsSync('auth.json')) {
    console.log('auth.json found – skipping Microsoft login');
    return;
  }

  console.log('auth.json missing – running Microsoft login flow...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(process.env.BASE_URL);

  // Trigger test runner (runs auth.setup.js)
  await browser.close();
};
