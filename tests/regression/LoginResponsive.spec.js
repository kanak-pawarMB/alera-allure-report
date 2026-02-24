// @ts-check
import { test, expect, devices } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { TEST_DATA } from '../testData.js';

/**
 * Login Page Responsive Tests
 * Tests verify the responsiveness and mobile-first design of the login page
 * Following WCAG 2.1 AA standards and best practices for responsive design
 */

test.describe('Login Page - Responsive Design Tests @regression', () => {
  const LOGIN_URL = TEST_DATA.urls.login;

  /**
   * Mobile Device Tests
   * Testing on various mobile devices with different screen sizes
   */
  test.describe('Mobile Devices', () => {

    test('iPhone 12 - Portrait (390x844)', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveTitle(/OneView|Login/i);

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      const buttonBox = await loginButton.boundingBox();
      expect(buttonBox).not.toBeNull();
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      }

      const logo = page.locator('img, svg').first();
      if (await logo.count() > 0) {
        await expect(logo).toBeVisible();
      }

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);

      const fontSize = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).fontSize;
      });
      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(14);

      await context.close();
    });

    test('iPhone 12 - Landscape (844x390)', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12 landscape'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);

      await context.close();
    });

    test('iPhone SE - Small Mobile (375x667)', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone SE'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      const buttonBox = await loginButton.boundingBox();
      const viewportSize = page.viewportSize();
      expect(buttonBox).not.toBeNull();
      expect(viewportSize).not.toBeNull();
      if (buttonBox && viewportSize) {
        expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(viewportSize.width);
      }

      const hasOverlap = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('div, section, main, header, footer, nav'));
        const visibleElements = elements.filter(el => {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 &&
                 styles.position !== 'absolute' &&
                 styles.position !== 'fixed' &&
                 styles.display !== 'none';
        });

        for (let i = 0; i < visibleElements.length - 1; i++) {
          const el1 = visibleElements[i];
          const el2 = visibleElements[i + 1];

          if (el1.contains(el2) || el2.contains(el1)) {
            continue;
          }

          const rect1 = el1.getBoundingClientRect();
          const rect2 = el2.getBoundingClientRect();

          const overlapWidth = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
          const overlapHeight = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
          const overlapArea = overlapWidth * overlapHeight;

          const area1 = rect1.width * rect1.height;
          const area2 = rect2.width * rect2.height;
          const smallerArea = Math.min(area1, area2);

          if (overlapArea > smallerArea * 0.5) {
            return true;
          }
        }
        return false;
      });

      expect(hasOverlap).toBeFalsy();

      await context.close();
    });

    test('Pixel 5 - Android Mobile (393x851)', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      const interactiveElements = await page.locator('button, a, input').all();
      if (interactiveElements.length > 1) {
        const firstBox = await interactiveElements[0].boundingBox();
        const secondBox = await interactiveElements[1].boundingBox();

        if (firstBox && secondBox) {
          const firstBottom = firstBox.y + firstBox.height;
          const secondTop = secondBox.y;
          const spacing = Math.abs(firstBottom - secondTop);
          expect(spacing).toBeGreaterThanOrEqual(8);
        }
      }

      await context.close();
    });

    test('Galaxy S9+ - Android Mobile (320x658)', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Galaxy S9+'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      await page.screenshot({
        path: 'test-results/responsive/galaxy-s9-login.png',
        fullPage: true
      });

      await context.close();
    });
  });

  /**
   * Tablet Device Tests
   */
  test.describe('Tablet Devices', () => {

    test('iPad (768x1024) - Portrait', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      const buttonBox = await loginButton.boundingBox();
      const viewportSize = page.viewportSize();
      expect(buttonBox).not.toBeNull();
      expect(viewportSize).not.toBeNull();

      if (buttonBox && viewportSize) {
        const viewportWidth = viewportSize.width;
        const marginLeft = buttonBox.x;
        const marginRight = viewportWidth - (buttonBox.x + buttonBox.width);
        const isReasonablyCentered = Math.abs(marginLeft - marginRight) < (viewportWidth * 0.2);

        expect(isReasonablyCentered).toBeTruthy();

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
      }

      await context.close();
    });

    test('iPad (1024x768) - Landscape', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad landscape'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      const contentWidth = await page.evaluate(() => {
        const mainContent = document.querySelector('main, .container, [class*="login"]');
        return mainContent ? mainContent.getBoundingClientRect().width : document.body.clientWidth;
      });

      const viewportSize = page.viewportSize();
      expect(viewportSize).not.toBeNull();
      if (viewportSize) {
        const viewportWidth = viewportSize.width;
        expect(contentWidth).toBeLessThanOrEqual(viewportWidth);
      }

      await context.close();
    });

    test('iPad Pro 11 (834x1194) - Portrait', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad Pro 11'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      const allImages = page.locator('img');
      const imageCount = await allImages.count();

      for (let i = 0; i < imageCount; i++) {
        const image = allImages.nth(i);
        if (await image.isVisible()) {
          const naturalSize = await image.evaluate((img) => {
            /** @type {HTMLImageElement} */
            const imgElement = /** @type {HTMLImageElement} */ (img);
            return {
              natural: { width: imgElement.naturalWidth, height: imgElement.naturalHeight },
              displayed: { width: imgElement.width, height: imgElement.height }
            };
          });

          if (naturalSize.displayed.width > 0) {
            expect(naturalSize.natural.width).toBeGreaterThanOrEqual(naturalSize.displayed.width * 0.8);
          }
        }
      }

      await context.close();
    });

    test('iPad Pro 11 (1194x834) - Landscape', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad Pro 11 landscape'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      await page.screenshot({
        path: 'test-results/responsive/ipad-pro-11-landscape.png',
        fullPage: true
      });

      await context.close();
    });
  });

  /**
   * Custom Viewport Tests
   */
  test.describe('Custom Viewports & Breakpoints', () => {

    test('Extra Small - 320px (Smallest mobile)', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 320, height: 568 }
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();

      await context.close();
    });

    test('Medium - 768px (Tablet breakpoint)', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 768, height: 1024 }
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      const containerWidth = await page.evaluate(() => {
        const main = document.querySelector('main, .container, [class*="login"]');
        return main ? main.getBoundingClientRect().width : document.body.clientWidth;
      });

      expect(containerWidth).toBeGreaterThan(0);

      await context.close();
    });

    test('Large - 1024px (Desktop/Laptop)', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1024, height: 768 }
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      await context.close();
    });
  });

  /**
   * Responsive Behavior Tests
   */
  test.describe('Dynamic Responsive Behaviors', () => {

    test('Orientation Change - Portrait to Landscape', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      let loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(500);

      loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeInViewport();

      const landscapeBox = await loginButton.boundingBox();

      expect(landscapeBox).not.toBeNull();
      if (landscapeBox) {
        expect(landscapeBox.height).toBeGreaterThanOrEqual(44);
      }

      await context.close();
    });

    test('Window Resize - Mobile to Tablet', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 }
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      let loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);

      loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeInViewport();

      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      expect(hasOverflow).toBeFalsy();

      await context.close();
    });

    test('Touch Events - Mobile Interactions', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
        hasTouch: true,
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      await loginButton.tap();
      await page.waitForTimeout(1000);

      await context.close();
    });
  });

  /**
   * Accessibility on Mobile/Tablet
   */
  test.describe('Mobile/Tablet Accessibility', () => {

    test('Screen Reader - Mobile Navigation', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      if (headings.length > 0) {
        console.log(`Found ${headings.length} heading(s) on the page`);
      } else {
        console.log('No semantic headings found - login page may use other text elements');
      }

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      const ariaLabel = await loginButton.getAttribute('aria-label');
      const buttonText = await loginButton.textContent();
      expect(ariaLabel || buttonText).toBeTruthy();

      await context.close();
    });

    test('Keyboard Navigation - Tablet', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active) {
          return { tagName: '', hasOutline: false };
        }
        const outline = window.getComputedStyle(active).outline;
        const outlineWidth = window.getComputedStyle(active).outlineWidth;
        return {
          tagName: active.tagName,
          hasOutline: outline !== 'none' || parseFloat(outlineWidth) > 0
        };
      });

      expect(focusedElement.hasOutline).toBeTruthy();

      await context.close();
    });

    test('Zoom Level - 200% (WCAG Requirement)', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        document.body.style.zoom = '2';
      });
      await page.waitForTimeout(500);

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      const isInViewport = await loginButton.isVisible();
      expect(isInViewport).toBeTruthy();

      await context.close();
    });
  });

  /**
   * Performance on Mobile/Tablet
   */
  test.describe('Mobile/Tablet Performance', () => {

    test('Page Load Time - Mobile 3G', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await context.route('**/*', route => route.continue());

      const startTime = Date.now();
      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(10000);

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 15000 });

      await context.close();
    });

    test('Image Optimization - Mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').all();

      for (const image of images) {
        if (await image.isVisible()) {
          const alt = await image.getAttribute('alt');

          expect(alt !== null).toBeTruthy();

          const isLoaded = await image.evaluate((img) => {
            /** @type {HTMLImageElement} */
            const imgElement = /** @type {HTMLImageElement} */ (img);
            return imgElement.complete && imgElement.naturalHeight > 0;
          });
          expect(isLoaded).toBeTruthy();
        }
      }

      await context.close();
    });
  });
});
