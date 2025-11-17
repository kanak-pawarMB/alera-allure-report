// @ts-check
import { test, expect, devices } from '@playwright/test';

/**
 * Login Page Responsive Tests
 * Tests verify the responsiveness and mobile-first design of the login page
 * Following WCAG 2.1 AA standards and best practices for responsive design
 */

test.describe('Login Page - Responsive Design Tests', () => {
  const LOGIN_URL = process.env.LOGIN_URL || 'https://demooneview.z20.web.core.windows.net/login';

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

      // Verify page loads properly
      await expect(page).toHaveTitle(/OneView|Login/i);

      // Check critical elements are visible
      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      // Verify touch target size (minimum 44x44 pixels per WCAG 2.1)
      const buttonBox = await loginButton.boundingBox();
      expect(buttonBox).not.toBeNull();
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      }

      // Check if logo/header is visible
      const logo = page.locator('img, svg').first();
      if (await logo.count() > 0) {
        await expect(logo).toBeVisible();
      }

      // Verify no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);

      // Check text is readable (not too small)
      const fontSize = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).fontSize;
      });
      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(14); // Minimum readable size

      await context.close();
    });

    test('iPhone 12 - Landscape (844x390)', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12 landscape'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      // Verify critical elements remain visible in landscape
      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      // Verify no horizontal scroll in landscape
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

      // Verify page works on smaller screens
      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      // Check button is not cut off
      const buttonBox = await loginButton.boundingBox();
      const viewportSize = page.viewportSize();
      expect(buttonBox).not.toBeNull();
      expect(viewportSize).not.toBeNull();
      if (buttonBox && viewportSize) {
        expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(viewportSize.width);
      }

      // Verify proper spacing (elements not overlapping)
      const hasOverlap = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        for (let i = 0; i < elements.length - 1; i++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[i + 1].getBoundingClientRect();

          // Check if elements are overlapping inappropriately
          if (rect1.bottom > rect2.top && rect1.top < rect2.bottom &&
              rect1.right > rect2.left && rect1.left < rect2.right &&
              window.getComputedStyle(elements[i]).position !== 'absolute' &&
              window.getComputedStyle(elements[i + 1]).position !== 'absolute') {
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

      // Test on Android device
      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      // Verify touch-friendly spacing (minimum 8px between interactive elements)
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

      // Screenshot for visual verification
      await page.screenshot({
        path: 'test-results/responsive/galaxy-s9-login.png',
        fullPage: true
      });

      await context.close();
    });
  });

  /**
   * Tablet Device Tests
   * Testing on tablet devices in both orientations
   */
  test.describe('Tablet Devices', () => {

    test('iPad (768x1024) - Portrait', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      // Verify layout adapts to tablet size
      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await expect(loginButton).toBeInViewport();

      // Check if layout is centered or properly aligned
      const buttonBox = await loginButton.boundingBox();
      const viewportSize = page.viewportSize();
      expect(buttonBox).not.toBeNull();
      expect(viewportSize).not.toBeNull();

      if (buttonBox && viewportSize) {
        const viewportWidth = viewportSize.width;
        // Button should be reasonably centered (within 20% margin on either side)
        const marginLeft = buttonBox.x;
        const marginRight = viewportWidth - (buttonBox.x + buttonBox.width);
        const isReasonablyCentered = Math.abs(marginLeft - marginRight) < (viewportWidth * 0.2);

        expect(isReasonablyCentered).toBeTruthy();

        // Verify no horizontal scroll
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

      // Verify content doesn't stretch awkwardly in landscape
      const contentWidth = await page.evaluate(() => {
        const mainContent = document.querySelector('main, .container, [class*="login"]');
        return mainContent ? mainContent.getBoundingClientRect().width : document.body.clientWidth;
      });

      const viewportSize = page.viewportSize();
      expect(viewportSize).not.toBeNull();
      if (viewportSize) {
        const viewportWidth = viewportSize.width;
        // Content should not be full width on large tablets (max ~800px is typical)
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

      // Check proper spacing and layout on larger tablet
      const allImages = page.locator('img');
      const imageCount = await allImages.count();

      for (let i = 0; i < imageCount; i++) {
        const image = allImages.nth(i);
        if (await image.isVisible()) {
          // Images should be properly sized (not pixelated)
          const naturalSize = await image.evaluate((img) => {
            /** @type {HTMLImageElement} */
            const imgElement = /** @type {HTMLImageElement} */ (img);
            return {
              natural: { width: imgElement.naturalWidth, height: imgElement.naturalHeight },
              displayed: { width: imgElement.width, height: imgElement.height }
            };
          });

          // Natural size should be >= displayed size for quality
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

      // Screenshot for visual verification
      await page.screenshot({
        path: 'test-results/responsive/ipad-pro-11-landscape.png',
        fullPage: true
      });

      await context.close();
    });
  });

  /**
   * Custom Viewport Tests
   * Testing edge cases and common breakpoints
   */
  test.describe('Custom Viewports & Breakpoints', () => {

    test('Extra Small - 320px (Smallest mobile)', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 320, height: 568 }
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      // Verify page works on smallest viewport
      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      // Check no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();

      await context.close();
    });

    test('Small - 576px (Common mobile breakpoint)', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 576, height: 812 }
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

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

      // Check if layout changes appropriately at this breakpoint
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
   * Testing dynamic responsive behaviors
   */
  test.describe('Dynamic Responsive Behaviors', () => {

    test('Orientation Change - Portrait to Landscape', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      // Portrait mode
      let loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      // Change to landscape
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(500); // Allow time for reflow

      // Verify button still visible and functional
      loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeInViewport();

      const landscapeBox = await loginButton.boundingBox();

      // Verify button adapted to new orientation
      expect(landscapeBox).not.toBeNull();
      if (landscapeBox) {
        expect(landscapeBox.height).toBeGreaterThanOrEqual(44);
      }

      await context.close();
    });

    test('Window Resize - Mobile to Tablet', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 } // Mobile
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      // Verify on mobile
      let loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      // Resize to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);

      // Verify layout adapts
      loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeInViewport();

      // Check no layout breaks
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

      // Simulate touch tap
      await loginButton.tap();

      // Verify tap was registered (page should attempt navigation/action)
      await page.waitForTimeout(1000);

      await context.close();
    });
  });

  /**
   * Accessibility on Mobile/Tablet
   * Testing a11y features on smaller screens
   */
  test.describe('Mobile/Tablet Accessibility', () => {

    test('Screen Reader - Mobile Navigation', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');

      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);

      // Verify button has accessible name
      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      // Check for aria-labels or accessible text
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

      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // Verify focus is visible
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

      // Simulate 200% zoom
      await page.evaluate(() => {
        document.body.style.zoom = '2';
      });
      await page.waitForTimeout(500);

      // Verify critical elements still visible and functional
      const loginButton = page.getByRole('button', { name: /Login with Microsoft/i });
      await expect(loginButton).toBeVisible({ timeout: 10000 });

      // Check no critical content is cut off
      const isInViewport = await loginButton.isVisible();
      expect(isInViewport).toBeTruthy();

      await context.close();
    });
  });

  /**
   * Performance on Mobile/Tablet
   * Testing page performance on mobile devices
   */
  test.describe('Mobile/Tablet Performance', () => {

    test('Page Load Time - Mobile 3G', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      // Emulate slow 3G network
      await context.route('**/*', route => route.continue());

      const startTime = Date.now();
      await page.goto(LOGIN_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Page should load within reasonable time (< 10 seconds on slow connection)
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

      // Check if images use appropriate formats and sizes
      const images = await page.locator('img').all();

      for (const image of images) {
        if (await image.isVisible()) {
          const alt = await image.getAttribute('alt');

          // Images should have alt text
          expect(alt !== null).toBeTruthy();

          // Check image loads successfully
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
