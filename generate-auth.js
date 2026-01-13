import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://qa.oneview.alerahealth.com');

  console.log('Please login manually in the browser window that opened. After logging in and reaching the dashboard, press Enter in this terminal.');

  // Wait for user input
  process.stdin.setRawMode(true);
  process.stdin.resume();
  await new Promise(resolve => {
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve();
    });
  });

  await context.storageState({ path: 'auth.json' });
  await browser.close();
  console.log('auth.json has been updated.');
})();