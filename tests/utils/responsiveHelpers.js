/**
 * Responsive Testing Helper Utilities
 * Common functions for testing responsive design across devices
 */

/**
 * Check if element has adequate touch target size (WCAG 2.1 Level AAA)
 * @param {import('@playwright/test').Locator} element - The element to check
 * @param {number} minSize - Minimum size in pixels (default: 44px per Apple HIG and WCAG)
 * @returns {Promise<{width: number, height: number, meetsStandard: boolean}>}
 */
export async function checkTouchTargetSize(element, minSize = 44) {
  const box = await element.boundingBox();

  if (!box) {
    return { width: 0, height: 0, meetsStandard: false };
  }

  return {
    width: box.width,
    height: box.height,
    meetsStandard: box.width >= minSize && box.height >= minSize
  };
}

/**
 * Verify no horizontal scroll exists on the page
 * @param {import('@playwright/test').Page} page - The page object
 * @returns {Promise<{hasScroll: boolean, scrollWidth: number, viewportWidth: number}>}
 */
export async function checkHorizontalScroll(page) {
  const result = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      windowInnerWidth: window.innerWidth
    };
  });

  const maxScrollWidth = Math.max(result.scrollWidth, result.bodyScrollWidth);
  const viewportWidth = Math.min(result.clientWidth, result.windowInnerWidth);

  return {
    hasScroll: maxScrollWidth > viewportWidth,
    scrollWidth: maxScrollWidth,
    viewportWidth: viewportWidth
  };
}

/**
 * Check if text is readable (minimum font size)
 * @param {import('@playwright/test').Page} page - The page object
 * @param {number} minFontSize - Minimum font size in pixels (default: 14px)
 * @returns {Promise<{fontSize: number, isReadable: boolean}>}
 */
export async function checkTextReadability(page, minFontSize = 14) {
  const fontSize = await page.evaluate(() => {
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);
    return parseFloat(computedStyle.fontSize);
  });

  return {
    fontSize: fontSize,
    isReadable: fontSize >= minFontSize
  };
}

/**
 * Verify elements are properly spaced and not overlapping
 * @param {import('@playwright/test').Page} page - The page object
 * @returns {Promise<boolean>} - Returns true if overlap detected
 */
export async function checkElementOverlap(page) {
  return await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('body *'));

    for (let i = 0; i < elements.length; i++) {
      const el1 = elements[i];
      const style1 = window.getComputedStyle(el1);

      // Skip hidden or absolutely positioned elements
      if (style1.display === 'none' || style1.visibility === 'hidden' ||
          style1.position === 'absolute' || style1.position === 'fixed') {
        continue;
      }

      const rect1 = el1.getBoundingClientRect();

      // Skip zero-size elements
      if (rect1.width === 0 || rect1.height === 0) continue;

      for (let j = i + 1; j < elements.length; j++) {
        const el2 = elements[j];
        const style2 = window.getComputedStyle(el2);

        if (style2.display === 'none' || style2.visibility === 'hidden' ||
            style2.position === 'absolute' || style2.position === 'fixed') {
          continue;
        }

        const rect2 = el2.getBoundingClientRect();

        if (rect2.width === 0 || rect2.height === 0) continue;

        // Check if rectangles overlap
        const overlaps = !(rect1.right < rect2.left ||
                          rect1.left > rect2.right ||
                          rect1.bottom < rect2.top ||
                          rect1.top > rect2.bottom);

        // Check if it's parent-child relationship (acceptable overlap)
        const isParentChild = el1.contains(el2) || el2.contains(el1);

        if (overlaps && !isParentChild) {
          return true; // Overlap detected
        }
      }
    }
    return false; // No inappropriate overlap
  });
}

/**
 * Check if images are optimized (natural size vs displayed size)
 * @param {import('@playwright/test').Page} page - The page object
 * @returns {Promise<Array<{src: string, natural: object, displayed: object, isOptimized: boolean}>>}
 */
export async function checkImageOptimization(page) {
  return await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.map(img => {
      const rect = img.getBoundingClientRect();
      return {
        src: img.src,
        alt: img.alt,
        natural: {
          width: img.naturalWidth,
          height: img.naturalHeight
        },
        displayed: {
          width: rect.width,
          height: rect.height
        },
        // Image is optimized if natural size is not much larger than displayed (allowing 2x for retina)
        isOptimized: img.naturalWidth <= rect.width * 2 || rect.width === 0
      };
    });
  });
}

/**
 * Verify viewport meta tag exists and is properly configured
 * @param {import('@playwright/test').Page} page - The page object
 * @returns {Promise<{exists: boolean, content: string, isProperlyConfigured: boolean}>}
 */
export async function checkViewportMetaTag(page) {
  const metaInfo = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    return {
      exists: !!meta,
      content: meta ? meta.getAttribute('content') : ''
    };
  });

  // Check for essential viewport settings
  const hasWidth = metaInfo.content.includes('width=device-width');
  const hasInitialScale = metaInfo.content.includes('initial-scale=1');

  return {
    ...metaInfo,
    isProperlyConfigured: metaInfo.exists && hasWidth && hasInitialScale
  };
}

/**
 * Check spacing between interactive elements (for touch-friendly UI)
 * @param {import('@playwright/test').Page} page - The page object
 * @param {number} minSpacing - Minimum spacing in pixels (default: 8px)
 * @returns {Promise<{minSpacing: number, allElementsMeetStandard: boolean}>}
 */
export async function checkInteractiveElementSpacing(page, minSpacing = 8) {
  const result = await page.evaluate((minSpace) => {
    const interactive = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
    let allMeetStandard = true;
    let minFoundSpacing = Infinity;

    for (let i = 0; i < interactive.length - 1; i++) {
      const rect1 = interactive[i].getBoundingClientRect();
      const rect2 = interactive[i + 1].getBoundingClientRect();

      // Calculate vertical spacing
      const spacing = Math.abs(rect2.top - rect1.bottom);

      if (spacing < minFoundSpacing) {
        minFoundSpacing = spacing;
      }

      if (spacing < minSpace && spacing > 0) {
        allMeetStandard = false;
      }
    }

    return {
      minFoundSpacing: minFoundSpacing === Infinity ? 0 : minFoundSpacing,
      allMeetStandard: allMeetStandard
    };
  }, minSpacing);

  return {
    ...result,
    minSpacing: minSpacing
  };
}

/**
 * Get all responsive breakpoints currently active
 * @param {import('@playwright/test').Page} page - The page object
 * @returns {Promise<{width: number, height: number, orientation: string, devicePixelRatio: number}>}
 */
export async function getViewportInfo(page) {
  return await page.evaluate(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      devicePixelRatio: window.devicePixelRatio
    };
  });
}

/**
 * Check if element is properly centered
 * @param {import('@playwright/test').Locator} element - The element to check
 * @param {import('@playwright/test').Page} page - The page object
 * @param {number} tolerance - Tolerance percentage (default: 20%)
 * @returns {Promise<{isCentered: boolean, marginLeft: number, marginRight: number}>}
 */
export async function checkElementCentering(element, page, tolerance = 0.2) {
  const box = await element.boundingBox();
  const viewport = page.viewportSize();

  if (!box || !viewport) {
    return { isCentered: false, marginLeft: 0, marginRight: 0 };
  }

  const marginLeft = box.x;
  const marginRight = viewport.width - (box.x + box.width);
  const difference = Math.abs(marginLeft - marginRight);
  const tolerancePixels = viewport.width * tolerance;

  return {
    isCentered: difference <= tolerancePixels,
    marginLeft: marginLeft,
    marginRight: marginRight
  };
}

/**
 * Common responsive viewport sizes for testing
 */
export const RESPONSIVE_VIEWPORTS = {
  mobile: {
    extraSmall: { width: 320, height: 568 },   // iPhone SE (old)
    small: { width: 375, height: 667 },        // iPhone 6/7/8
    medium: { width: 390, height: 844 },       // iPhone 12/13
    large: { width: 414, height: 896 },        // iPhone 11/XR
    android: { width: 393, height: 851 }       // Pixel 5
  },
  tablet: {
    small: { width: 768, height: 1024 },       // iPad
    medium: { width: 834, height: 1194 },      // iPad Pro 11"
    large: { width: 1024, height: 1366 }       // iPad Pro 12.9"
  },
  desktop: {
    small: { width: 1024, height: 768 },       // Small laptop
    medium: { width: 1366, height: 768 },      // Medium laptop
    large: { width: 1920, height: 1080 },      // Full HD
    extraLarge: { width: 2560, height: 1440 }  // 2K
  }
};

/**
 * Common breakpoints (matching Bootstrap, Tailwind conventions)
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

/**
 * Take responsive screenshots at multiple viewports
 * @param {import('@playwright/test').Page} page - The page object
 * @param {string} basePath - Base path for screenshots
 * @param {string} name - Name prefix for screenshots
 */
export async function takeResponsiveScreenshots(page, basePath, name) {
  const viewports = [
    { name: 'mobile', ...RESPONSIVE_VIEWPORTS.mobile.medium },
    { name: 'tablet', ...RESPONSIVE_VIEWPORTS.tablet.small },
    { name: 'desktop', ...RESPONSIVE_VIEWPORTS.desktop.medium }
  ];

  const screenshots = [];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500); // Allow reflow

    const path = `${basePath}/${name}-${viewport.name}.png`;
    await page.screenshot({ path, fullPage: true });
    screenshots.push(path);
  }

  return screenshots;
}
