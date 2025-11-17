# Responsive Testing Guide

## Overview
This document explains how to run and maintain responsive tests for the Alera ONEView application.

## Test Coverage

The `LoginResponsive.spec.js` test suite covers:

### 📱 **Mobile Devices**
- iPhone 12 (Portrait & Landscape)
- iPhone SE (Small screens)
- Pixel 5 (Android)
- Galaxy S9+

### 📲 **Tablet Devices**
- iPad (Portrait & Landscape)
- iPad Pro 11 (Portrait & Landscape)

### 🖥️ **Custom Breakpoints**
- 320px (Extra small - smallest mobile)
- 576px (Small mobile)
- 768px (Tablet)
- 1024px (Desktop/Laptop)

## Best Practices Implemented

### ✅ **WCAG 2.1 AA Compliance**
- **Touch Target Size**: Minimum 44x44 pixels for all interactive elements
- **Text Readability**: Minimum 14px font size
- **Zoom Support**: Content readable at 200% zoom level
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

### ✅ **Mobile-First Design**
- No horizontal scrolling on any viewport
- Proper spacing between interactive elements (minimum 8px)
- Touch-friendly button sizes
- Responsive images (appropriate sizing)

### ✅ **Performance**
- Page load testing on simulated 3G networks
- Image optimization checks
- Viewport meta tag validation

### ✅ **Dynamic Behaviors**
- Orientation change testing (portrait ↔ landscape)
- Window resize handling
- Touch event simulation

## Running the Tests

### Run All Responsive Tests
```bash
npx playwright test tests/LoginResponsive.spec.js
```

### Run Specific Device Tests
```bash
# Mobile tests only
npx playwright test tests/LoginResponsive.spec.js -g "Mobile Devices"

# Tablet tests only
npx playwright test tests/LoginResponsive.spec.js -g "Tablet Devices"

# Custom viewport tests
npx playwright test tests/LoginResponsive.spec.js -g "Custom Viewports"

# Accessibility tests
npx playwright test tests/LoginResponsive.spec.js -g "Accessibility"

# Performance tests
npx playwright test tests/LoginResponsive.spec.js -g "Performance"
```

### Run Specific Device
```bash
# iPhone 12 only
npx playwright test tests/LoginResponsive.spec.js -g "iPhone 12"

# iPad tests
npx playwright test tests/LoginResponsive.spec.js -g "iPad"
```

### Run in Headed Mode (See the Browser)
```bash
npx playwright test tests/LoginResponsive.spec.js --headed
```

### Run in Debug Mode
```bash
npx playwright test tests/LoginResponsive.spec.js --debug
```

### Run with Specific Browser
```bash
npx playwright test tests/LoginResponsive.spec.js --project=chromium
npx playwright test tests/LoginResponsive.spec.js --project=webkit
```

## Test Reports & Screenshots

### View HTML Report
```bash
npx playwright show-report
```

### Screenshots Location
Responsive test screenshots are saved to:
```
test-results/responsive/
├── galaxy-s9-login.png
├── ipad-pro-11-landscape.png
└── ...
```

## Using Responsive Helper Utilities

The `utils/responsiveHelpers.js` file contains reusable functions:

```javascript
import {
  checkTouchTargetSize,
  checkHorizontalScroll,
  checkTextReadability,
  checkElementOverlap,
  checkImageOptimization,
  checkViewportMetaTag,
  RESPONSIVE_VIEWPORTS,
  BREAKPOINTS
} from '../utils/responsiveHelpers.js';

// Example usage in a test
test('Custom responsive test', async ({ page }) => {
  await page.goto('https://demooneview.z20.web.core.windows.net/login');

  // Check for horizontal scroll
  const scrollCheck = await checkHorizontalScroll(page);
  expect(scrollCheck.hasScroll).toBeFalsy();

  // Verify touch target size
  const button = page.getByRole('button');
  const touchTarget = await checkTouchTargetSize(button);
  expect(touchTarget.meetsStandard).toBeTruthy();

  // Check text readability
  const textCheck = await checkTextReadability(page);
  expect(textCheck.isReadable).toBeTruthy();
});
```

## CI/CD Integration

To run responsive tests in your CI/CD pipeline:

```yaml
# .github/workflows/playwright.yml
- name: Run Responsive Tests
  run: npx playwright test tests/LoginResponsive.spec.js --project=chromium

- name: Upload Screenshots
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: responsive-screenshots
    path: test-results/responsive/
    retention-days: 30
```

## Common Issues & Troubleshooting

### Issue: Tests failing on specific device
**Solution**: Run in headed mode to see the actual rendering:
```bash
npx playwright test tests/LoginResponsive.spec.js -g "iPhone 12" --headed
```

### Issue: Horizontal scroll detected
**Solution**: Check for:
- Fixed-width elements
- Oversized images
- Missing `max-width: 100%` on images
- Viewport meta tag configuration

### Issue: Touch targets too small
**Solution**: Ensure buttons/links have minimum 44x44px size:
```css
button, a {
  min-width: 44px;
  min-height: 44px;
}
```

### Issue: Text not readable
**Solution**: Set minimum font size:
```css
body {
  font-size: 16px; /* Recommended for mobile */
}
```

## Recommended Viewport Meta Tag

Ensure your HTML includes:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Device Emulation vs Real Devices

### Playwright Device Emulation (What we use)
- ✅ Fast and consistent
- ✅ Good for regression testing
- ✅ Covers most responsive issues
- ⚠️ May not catch browser-specific bugs

### Real Device Testing (Recommended for critical releases)
- Use BrowserStack, Sauce Labs, or LambdaTest
- Test on actual iOS/Android devices
- Verify touch gestures and native behaviors

## Extending the Tests

### Add New Device
```javascript
test('Custom Device', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    userAgent: 'Custom User Agent',
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true
  });
  const page = await context.newPage();
  // Your test code...
});
```

### Add New Breakpoint Test
```javascript
test('Custom Breakpoint - 1440px', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  // Your test code...
});
```

## Resources

- [Playwright Device Emulation](https://playwright.dev/docs/emulation)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile-First Design](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
- [Touch Target Sizes](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

## Maintenance Schedule

- **Daily**: Run on CI/CD pipeline
- **Weekly**: Review failed tests and screenshots
- **Monthly**: Update device list to match usage analytics
- **Quarterly**: Add new devices based on market trends

---

## Quick Command Reference

```bash
# Run all responsive tests
npx playwright test tests/LoginResponsive.spec.js

# Run mobile only
npx playwright test tests/LoginResponsive.spec.js -g "Mobile"

# Run tablet only
npx playwright test tests/LoginResponsive.spec.js -g "Tablet"

# Run with visual browser
npx playwright test tests/LoginResponsive.spec.js --headed

# Debug mode
npx playwright test tests/LoginResponsive.spec.js --debug

# Generate report
npx playwright show-report
```
