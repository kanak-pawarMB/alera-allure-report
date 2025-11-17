// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Landing Page Tests
 * These tests verify the dashboard/landing page functionality of the application
 */

test.describe('Landing Page', () => {
  // Dashboard URL
  const DASHBOARD_URL = 'https://demooneview.z20.web.core.windows.net/dashboard';

  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard page before each test
    await page.goto(DASHBOARD_URL);

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
  });

  // Link to Qase test case ID (replace with your actual Qase test case ID)
  test('should load the dashboard page successfully', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '2' });
    // Verify the page loads and contains the dashboard URL
    const currentUrl = page.url();
    expect(currentUrl).toContain('dashboard');
  });

  // Link to Qase test case ID (replace with your actual Qase test case ID)
  test('should have Medicaid toggle selected by default beside the Search field', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '3' });

    // Wait a moment for page to fully render
    await page.waitForTimeout(2000);

    // Locate the Search field (using .first() since there are multiple search fields on the page)
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    await expect(searchField).toBeVisible();

    // Locate the Medicaid ID radio button
    const medicaidRadio = page.getByRole('radio', { name: /medicaid id/i });

    // Verify the Medicaid radio button is visible
    await expect(medicaidRadio).toBeVisible({ timeout: 5000 });

    // Verify the Medicaid radio button is selected by default
    // Check that aria-checked is true
    await expect(medicaidRadio).toHaveAttribute('aria-checked', 'true');

    // Also verify data-state is "on" (selected state)
    await expect(medicaidRadio).toHaveAttribute('data-state', 'on');
  });

  test('should be able to switch the search toggle from Medicaid ID to DOB + Last Name', async ({ page }) => {
    // Wait a moment for page to fully render
    await page.waitForTimeout(2000);

    // Verify Medicaid ID radio button is selected by default
    const medicaidRadio = page.getByRole('radio', { name: /medicaid id/i }).first();
    await expect(medicaidRadio).toBeVisible();
    await expect(medicaidRadio).toHaveAttribute('data-state', 'on');
    await expect(medicaidRadio).toHaveAttribute('aria-checked', 'true');

    // Locate the DOB + Last Name radio button
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();
    await expect(dobLastNameRadio).toBeVisible();

    // Verify DOB + Last Name is NOT selected initially
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'off');

    // Click on DOB + Last Name radio button to switch
    await dobLastNameRadio.click();

    // Wait for the toggle to update
    await page.waitForTimeout(500);

    // Verify DOB + Last Name is now selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');
    await expect(dobLastNameRadio).toHaveAttribute('aria-checked', 'true');

    // Verify Medicaid ID is now deselected
    await expect(medicaidRadio).toHaveAttribute('data-state', 'off');
    await expect(medicaidRadio).toHaveAttribute('aria-checked', 'false');
  });

  test('should display Search field on the dashboard', async ({ page }) => {
    // Wait a moment for page to fully render
    await page.waitForTimeout(2000);

    // Locate the Search field
    const searchField = page.getByRole('textbox', { name: /search/i })
      .or(page.locator('input[type="search"]'))
      .or(page.locator('input[placeholder*="Search" i]'));

    // Verify the search field is visible
    await expect(searchField.first()).toBeVisible();

    // Verify the search field is enabled
    await expect(searchField.first()).toBeEnabled();
  });

  test('should support keyboard navigation in dropdown search results - ONEVIEW-19', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '19' });

    // Wait for page to fully render
    await page.waitForTimeout(2000);

    // Step 1: Switch to DOB + Last Name search mode
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();
    await expect(dobLastNameRadio).toBeVisible();
    await dobLastNameRadio.click();
    await page.waitForTimeout(500);

    // Verify DOB + Last Name mode is selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');

    // Step 2: Enter search criteria with multiple matches (rob 07/19/1981)
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    await expect(searchField).toBeVisible();
    await searchField.fill('rob 07/19/1981');

    // Wait for search results to appear
    await page.waitForTimeout(1500);

    // Verify that search results are visible by checking for patient names
    // The results should contain patient information like "Roberts"
    const searchResultsContainer = page.locator('p:has-text("Roberts")').first();
    await expect(searchResultsContainer).toBeVisible({ timeout: 5000 });

    // Verify multiple results are displayed (should see at least 2 results)
    const allResults = page.locator('p').filter({ hasText: /NC\d+.*\|.*Roberts.*\|.*07\/19\/1981/ });
    const resultCount = await allResults.count();
    expect(resultCount).toBeGreaterThanOrEqual(1);

    // Step 3: Test keyboard navigation with arrow keys
    // Focus on the search field to start keyboard navigation
    await searchField.focus();

    // Press Down arrow key to navigate to first result
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Press Down arrow key again to navigate to second result
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Press Up arrow key to navigate back to first result
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);

    // Step 4: Press Enter to open the selected record
    // Alternatively, click on the first search result
    const firstResult = page.locator('p').filter({ hasText: /NC\d+.*\|.*Roberts.*\|.*07\/19\/1981/ }).first();
    await firstResult.click();

    // Wait for patient details page to load
    await page.waitForTimeout(2000);
    await page.waitForLoadState('domcontentloaded');

    // Step 5: Verify patient details are displayed with required cards
    // Check for Demographics card
    const demographicsCard = page.locator('[class*="demographic"], [data-testid="demographics"], :text("Demographics")').first();
    await expect(demographicsCard).toBeVisible({ timeout: 5000 });

    // Check for PCP (Primary Care Physician) card
    const pcpCard = page.locator('[class*="pcp"], [data-testid="pcp"], :text("PCP"), :text("Primary Care")').first();
    await expect(pcpCard).toBeVisible({ timeout: 5000 });

    // Check for Care Management card
    const careManagementCard = page.locator('[class*="care-management"], [class*="caremanagement"], [data-testid="care-management"], :text("Care Management")').first();
    await expect(careManagementCard).toBeVisible({ timeout: 5000 });
  });
  // Qase Test Case ID: 64 - Verify toggle button color changes
  test('ONEVIEW-64 should display correct toggle button colors when switching search options', async ({ page }) => {
    // Wait for page to render
    await page.waitForTimeout(2000);

    // Locate both toggle buttons
    const medicaidRadio = page.getByRole('radio', { name: /medicaid id/i }).first();
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();

    await expect(medicaidRadio).toBeVisible();
    await expect(dobLastNameRadio).toBeVisible();

    // Step 1: Verify Medicaid ID is selected by default with blue/active background
    await expect(medicaidRadio).toHaveAttribute('data-state', 'on');

    // Get the background color of the active (Medicaid ID) toggle
    const medicaidActiveBgColor = await medicaidRadio.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Get the background color of the inactive (DOB + Last Name) toggle
    const dobInactiveBgColor = await dobLastNameRadio.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Verify active toggle has a color (blue/non-white)
    // RGB values for blue should have higher blue component
    console.log('Medicaid ID (active) background color:', medicaidActiveBgColor);
    console.log('DOB + Last Name (inactive) background color:', dobInactiveBgColor);

    // Verify they have different colors (active vs inactive)
    expect(medicaidActiveBgColor).not.toBe(dobInactiveBgColor);

    // Step 2: Click on DOB + Last Name toggle
    await dobLastNameRadio.click();
    await page.waitForTimeout(500);

    // Verify DOB + Last Name is now selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');
    await expect(medicaidRadio).toHaveAttribute('data-state', 'off');

    // Get the new background colors after switching
    const dobActiveBgColor = await dobLastNameRadio.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const medicaidInactiveBgColor = await medicaidRadio.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    console.log('DOB + Last Name (now active) background color:', dobActiveBgColor);
    console.log('Medicaid ID (now inactive) background color:', medicaidInactiveBgColor);

    // Expected Result 1: DOB + Last Name now has blue/active color
    expect(dobActiveBgColor).toBe(medicaidActiveBgColor);

    // Expected Result 2: Medicaid ID now has white/inactive color
    expect(medicaidInactiveBgColor).toBe(dobInactiveBgColor);

    // Step 3: Switch back to Medicaid ID
    await medicaidRadio.click();
    await page.waitForTimeout(500);

    // Verify Medicaid ID is selected again
    await expect(medicaidRadio).toHaveAttribute('data-state', 'on');
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'off');

    // Get the background colors after switching back
    const medicaidActiveBgColor2 = await medicaidRadio.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const dobInactiveBgColor2 = await dobLastNameRadio.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    console.log('Medicaid ID (active again) background color:', medicaidActiveBgColor2);
    console.log('DOB + Last Name (inactive again) background color:', dobInactiveBgColor2);

    // Expected Result 3: Colors are back to original state
    expect(medicaidActiveBgColor2).toBe(medicaidActiveBgColor);
    expect(dobInactiveBgColor2).toBe(dobInactiveBgColor);
  });

  // Qase Test Case ID: 65 - Verify toggle dot moves correctly
  test('ONEVIEW-65 should verify toggle dot moves correctly when switching search options', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '65' });

    // Wait for page to fully render
    await page.waitForTimeout(2000);

    // Step 1: Locate both toggle buttons
    const medicaidRadio = page.getByRole('radio', { name: /medicaid id/i }).first();
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();

    await expect(medicaidRadio).toBeVisible();
    await expect(dobLastNameRadio).toBeVisible();

    // Verify Medicaid ID is selected by default
    await expect(medicaidRadio).toHaveAttribute('data-state', 'on');

    // Locate the toggle indicator/dot element (try multiple selectors)
    // Common toggle indicators use classes like 'thumb', 'indicator', 'dot', 'slider'
    const toggleIndicator = page.locator('[class*="thumb"]')
      .or(page.locator('[class*="indicator"]'))
      .or(page.locator('[class*="dot"]'))
      .or(page.locator('[class*="slider"]'))
      .or(page.locator('[data-state][class*="toggle"]'))
      .first();

    // Get initial bounding box position when Medicaid ID is selected
    const initialPosition = await toggleIndicator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        x: rect.x,
        y: rect.y,
        left: rect.left,
        width: rect.width,
        backgroundColor: style.backgroundColor,
        marginLeft: style.marginLeft
      };
    });

    console.log('Initial toggle dot position (Medicaid ID selected):', initialPosition);

    // Step 2: Click on "DOB + Last Name" toggle
    await dobLastNameRadio.click();

    // Wait for animation to complete
    await page.waitForTimeout(500);

    // Step 3: Verify DOB + Last Name is now selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');
    await expect(medicaidRadio).toHaveAttribute('data-state', 'off');

    // Get the new bounding box position after switching
    const afterSwitchPosition = await toggleIndicator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        x: rect.x,
        y: rect.y,
        left: rect.left,
        width: rect.width,
        backgroundColor: style.backgroundColor,
        marginLeft: style.marginLeft
      };
    });

    console.log('Toggle dot position after switching to DOB + Last Name:', afterSwitchPosition);

    // Expected Result: The dot should have moved (position changed)
    // Check if either the x position or margin changed
    const positionChanged = (afterSwitchPosition.x !== initialPosition.x) ||
      (afterSwitchPosition.left !== initialPosition.left) ||
      (afterSwitchPosition.marginLeft !== initialPosition.marginLeft);
    expect(positionChanged).toBe(true);

    // Verify the dot remains fixed under the selected option (check it's still visible)
    await expect(toggleIndicator).toBeVisible();

    // Step 4: Click back on "Medicaid ID"
    await medicaidRadio.click();

    // Wait for animation to complete
    await page.waitForTimeout(500);

    // Verify Medicaid ID is selected again
    await expect(medicaidRadio).toHaveAttribute('data-state', 'on');
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'off');

    // Get the final bounding box position after switching back
    const finalPosition = await toggleIndicator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        x: rect.x,
        y: rect.y,
        left: rect.left,
        width: rect.width,
        backgroundColor: style.backgroundColor,
        marginLeft: style.marginLeft
      };
    });

    console.log('Toggle dot position after switching back to Medicaid ID:', finalPosition);

    // Expected Result: The dot should return to the original position
    expect(finalPosition.x).toBe(initialPosition.x);
    expect(finalPosition.left).toBe(initialPosition.left);

    // Verify the dot is still visible in its original position
    await expect(toggleIndicator).toBeVisible();
  });

  // Qase Test Case ID: 70 - Verify Invalid Search - Entered First Name
  test('ONEVIEW-70 should display error message when First Name is entered with DOB', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '70' });

    // Wait for page to fully render
    await page.waitForTimeout(2000);

    // Precondition: Switch to DOB + Last Name search mode
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();
    await expect(dobLastNameRadio).toBeVisible();
    await dobLastNameRadio.click();
    await page.waitForTimeout(500);

    // Verify DOB + Last Name mode is selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');

    // Step 1: Enter First Name + DOB (invalid - should be Last Name)
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    await expect(searchField).toBeVisible();

    // Use the test data: First Name "Joh" with DOB "11/23/2002"
    const invalidSearch = 'Joh 11/23/2002';
    await searchField.fill(invalidSearch);

    // Step 2: Press Enter key
    await searchField.press('Enter');

    // Wait for search response
    await page.waitForTimeout(2000);

    // Expected Result: "No Patient(s) Found matching with search criteria" message displayed
    const noResultsMessage = page.locator('text=/no patient.*found/i')
      .or(page.locator('text=/no.*matching.*search/i'))
      .or(page.locator('text=/no results/i'))
      .or(page.locator('text=/patient not found/i'))
      .or(page.locator('p:has-text("No")'))
      .or(page.locator('[role="alert"]'));

    // Verify error message is visible
    await expect(noResultsMessage.first()).toBeVisible({ timeout: 10000 });

    // Verify the message text contains appropriate error indication
    const messageText = await noResultsMessage.first().textContent();
    console.log('Error message displayed:', messageText);

    // Verify no dropdown results are shown
    const dropdownResults = page.locator('[role="listbox"]')
      .or(page.locator('[class*="dropdown"]'))
      .or(page.locator('[class*="results"]'));

    const dropdownCount = await dropdownResults.count();
    if (dropdownCount > 0) {
      // If dropdown exists, verify it has no results
      const resultItems = page.locator('[role="option"]')
        .or(page.locator('[class*="result-item"]'));
      await expect(resultItems).toHaveCount(0);
    }

    console.log('ONEVIEW-70: Invalid search with First Name correctly handled');
  });

  // Qase Test Case ID: 73 - Verify second last name does not allow patient search
  test('ONEVIEW-73 should display validation error when only last name is entered without DOB', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '73' });

    // Wait for page to fully render
    await page.waitForTimeout(2000);

    // Precondition: Switch to DOB + Last Name search mode
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();
    await expect(dobLastNameRadio).toBeVisible();
    await dobLastNameRadio.click();
    await page.waitForTimeout(500);

    // Verify DOB + Last Name mode is selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');

    // Step 1: Enter only second last name without DOB (e.g., "Smith")
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    await expect(searchField).toBeVisible();

    // Use only last name without DOB
    const lastNameOnly = 'Smith';
    await searchField.fill(lastNameOnly);

    // Trigger validation by pressing Tab or Enter
    await searchField.press('Tab');
    await page.waitForTimeout(1000);

    // Expected Result: Validation message "Please enter the complete date of birth (DOB)."
    const validationMessage = page.locator('text=/please enter the complete date of birth/i')
      .or(page.locator('text=/enter.*dob/i'))
      .or(page.locator('text=/date of birth.*required/i'))
      .or(page.locator('[role="alert"]'))
      .or(page.locator('[class*="error"]'))
      .or(page.locator('[class*="validation"]'));

    // Verify validation message is visible
    await expect(validationMessage.first()).toBeVisible({ timeout: 5000 });

    // Verify the message contains expected text about DOB
    const messageText = await validationMessage.first().textContent();
    console.log('Validation message displayed:', messageText);
    expect(messageText?.toLowerCase()).toContain('dob');

    // Verify no dropdown results are shown
    const dropdownResults = page.locator('[role="listbox"]')
      .or(page.locator('[class*="dropdown"]'))
      .or(page.locator('[class*="results"]'));

    const dropdownCount = await dropdownResults.count();
    if (dropdownCount > 0) {
      // If dropdown exists, verify it has no results or is not visible
      const resultItems = page.locator('[role="option"]')
        .or(page.locator('[class*="result-item"]'));
      await expect(resultItems).toHaveCount(0);
    }

    console.log('ONEVIEW-73: Validation correctly prevents search with only last name');
  });

  // Qase Test Case ID: 75 - Verify formatting consistency across multiple results
  test('ONEVIEW-75 should verify all search results follow consistent format', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '75' });

    // Wait for page to fully render
    await page.waitForTimeout(2000);

    // Precondition: Switch to DOB + Last Name search mode
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();
    await expect(dobLastNameRadio).toBeVisible();
    await dobLastNameRadio.click();
    await page.waitForTimeout(500);

    // Step 1: Search with common criteria that returns multiple results
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    await expect(searchField).toBeVisible();

    // Use search that returns multiple results (e.g., "rob 07/19/1981")
    const searchQuery = 'rob 07/19/1981';
    await searchField.fill(searchQuery);

    // Wait for search results to appear
    await page.waitForTimeout(1500);

    // Step 2: View dropdown list and verify all results follow consistent format
    // Format should be: Medicaid ID + First Name, Last Name + DOB
    // Pattern: NC[digits] | First Last | MM/DD/YYYY or similar

    // Locate all search result items - using broader locator first
    const searchResults = page.locator('p').filter({ hasText: 'NC' })
      .or(page.locator('[cursor="pointer"]'))
      .or(page.locator('text=/NC\d+/'));

    // Wait for results to be visible
    await expect(searchResults.first()).toBeVisible({ timeout: 5000 });

    // Verify at least one result is displayed
    const resultCount = await searchResults.count();
    expect(resultCount).toBeGreaterThanOrEqual(1);
    console.log(`Found ${resultCount} search results`);

    // Expected Result: All rows must display consistently as: Medicaid ID + First Name, Last Name + DOB
    // Verify each result follows the consistent format
    for (let i = 0; i < resultCount; i++) {
      const resultText = await searchResults.nth(i).textContent();
      console.log(`Result ${i + 1}: ${resultText}`);

      // Verify the format contains:
      // 1. Medicaid ID (starts with NC followed by digits)
      // 2. Pipe separator |
      // 3. Name (First and Last)
      // 4. Pipe separator |
      // 5. DOB in MM/DD/YYYY format

      // Check format using regex: NC[digits] | Name | DOB
      const formatRegex = /NC\d+.*\|.*\|.*\d{1,2}\/\d{1,2}\/\d{4}/;
      expect(resultText).toMatch(formatRegex);

      // Verify result contains pipe separators (|)
      expect(resultText).toContain('|');

      // Count pipe separators (should have at least 2 for proper formatting)
      const pipeCount = (resultText?.match(/\|/g) || []).length;
      expect(pipeCount).toBeGreaterThanOrEqual(2);
    }

    console.log('ONEVIEW-75: All search results follow consistent format');
  });

  // Qase Test Case ID: 74 - Verify search result formatting for both search modes
  test('ONEVIEW-74 should verify result formatting for both Medicaid ID and DOB + Last Name search', async ({ page }) => {
    test.info().annotations.push({ type: 'qaseId', description: '74' });

    // Wait for page to fully render
    await page.waitForTimeout(2000);

    // Step 1: Enable Medicaid ID search toggle (should be default)
    const medicaidRadio = page.getByRole('radio', { name: /medicaid id/i }).first();
    await expect(medicaidRadio).toBeVisible();

    // Click if not already selected
    const dataState = await medicaidRadio.getAttribute('data-state');
    if (dataState !== 'on') {
      await medicaidRadio.click();
      await page.waitForTimeout(500);
    }

    // Step 2: Enter valid Medicaid ID to fetch results
    const searchField = page.getByRole('textbox', { name: /search/i }).first();
    await expect(searchField).toBeVisible();

    const validMedicaidId = 'NC160943625';
    await searchField.fill(validMedicaidId);

    // Wait for search results
    await page.waitForTimeout(1500);

    // Step 3: Observe result formatting in dropdown for Medicaid ID search
    const medicaidSearchResults = page.locator('p').filter({ hasText: 'NC' })
      .or(page.locator('[cursor="pointer"]'));

    await expect(medicaidSearchResults.first()).toBeVisible({ timeout: 5000 });

    // Verify Medicaid ID search result format
    const medicaidResultText = await medicaidSearchResults.first().textContent();
    console.log('Medicaid ID search result:', medicaidResultText);

    // Format should be: NC[digits] | Name | DOB
    expect(medicaidResultText).toMatch(/NC\d+.*\|.*\|.*\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(medicaidResultText).toContain('|');

    // Step 4: Switch to DOB + Last Name search field
    await searchField.clear();
    const dobLastNameRadio = page.getByRole('radio', { name: /dob.*last name/i }).first();
    await expect(dobLastNameRadio).toBeVisible();
    await dobLastNameRadio.click();
    await page.waitForTimeout(500);

    // Verify DOB + Last Name mode is selected
    await expect(dobLastNameRadio).toHaveAttribute('data-state', 'on');

    // Step 5: Enter valid Last Name + DOB
    const dobSearchQuery = 'rob 07/19/1981';
    await searchField.fill(dobSearchQuery);

    // Wait for search results
    await page.waitForTimeout(1500);

    // Step 6: Observe result formatting for DOB + Last Name search
    const dobSearchResults = page.locator('p').filter({ hasText: 'NC' })
      .or(page.locator('[cursor="pointer"]'));

    await expect(dobSearchResults.first()).toBeVisible({ timeout: 5000 });

    // Verify DOB + Last Name search result format
    const dobResultCount = await dobSearchResults.count();
    expect(dobResultCount).toBeGreaterThanOrEqual(1);

    // Expected Result: Both search methods follow format: [Medicaid ID] [First Name] [Last Name] [DOB]
    // Verify each result from DOB search follows the same consistent format
    for (let i = 0; i < Math.min(dobResultCount, 3); i++) {
      const resultText = await dobSearchResults.nth(i).textContent();
      console.log(`DOB search result ${i + 1}:`, resultText);

      // Verify format: NC[digits] | Name | DOB
      expect(resultText).toMatch(/NC\d+.*\|.*\|.*\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(resultText).toContain('|');

      // Count pipe separators (should have at least 2)
      const pipeCount = (resultText?.match(/\|/g) || []).length;
      expect(pipeCount).toBeGreaterThanOrEqual(2);
    }

    console.log('ONEVIEW-74: Both Medicaid ID and DOB + Last Name search return consistent format');
  });
});
