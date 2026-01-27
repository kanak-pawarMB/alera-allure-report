import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT = 'ONEVIEW';

if (!QASE_API_TOKEN) {
  throw new Error('QASE_API_TOKEN environment variable not set');
}

// Test case IDs and their automation status based on test results
const TEST_CASES = {
  // Failing/Invalid tests - mark as manual
  125: { status: 'manual', title: 'ONEVIEW-125: Verify Sorting by Referral Date' }, // Timeout in beforeEach
  137: { status: 'manual', title: 'ONEVIEW-137: Validate "No Data Available" Message' }, // Failed assertion
  
  // Passing tests - mark as automated
  126: { status: 'automated', title: 'ONEVIEW-126: Verify Limit to 10 Most Recent Referrals' },
  127: { status: 'automated', title: 'ONEVIEW-127: Verify Read-only Mode' },
  128: { status: 'automated', title: 'ONEVIEW-128: Verify Status Color Coding' },
  129: { status: 'automated', title: 'ONEVIEW-129: Verify Card Title' },
  132: { status: 'automated', title: 'ONEVIEW-132: Verify Modal Structure' },
  133: { status: 'automated', title: 'ONEVIEW-133: Verify Modal Close Behavior' },
  134: { status: 'automated', title: 'ONEVIEW-134: Verify Search by Sending Facility' },
  135: { status: 'automated', title: 'ONEVIEW-135: Verify Search by Receiving Facility' },
  136: { status: 'automated', title: 'ONEVIEW-136: Verify Partial Match in Search' },
  138: { status: 'automated', title: 'ONEVIEW-138: Verify Timeline Filter Functionality' },
  139: { status: 'automated', title: 'ONEVIEW-139: Verify Filter + Search Combination' },
  140: { status: 'automated', title: 'ONEVIEW-140: Verify Filter Reset After Modal Close' },
  141: { status: 'automated', title: 'ONEVIEW-141: Verify Dropdown Direction' },
  143: { status: 'automated', title: 'ONEVIEW-143: Verify Cursor Change on "View All" Hover' },
  145: { status: 'automated', title: 'ONEVIEW-145: Verify Date Format' },
};

/**
 * Update test case automation status in Qase
 */
async function updateQaseTestCaseStatus(testCaseId, automationStatus) {
  const url = `https://api.qase.io/v1/case/${QASE_PROJECT}/${testCaseId}`;
  
  // Map automation status to Qase API values
  const statusMap = {
    'automated': 2,    // Automated (completed)
    'manual': 0,       // Manual
  };
  
  const payload = {
    is_automated: statusMap[automationStatus] !== undefined ? statusMap[automationStatus] : 0,
  };

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Token': QASE_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Failed to update ONEVIEW-${testCaseId}: ${response.status} - ${JSON.stringify(errorData)}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Updated ONEVIEW-${testCaseId} → ${automationStatus.toUpperCase()}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ONEVIEW-${testCaseId}:`, error.message);
    return false;
  }
}

/**
 * Update all test cases
 */
async function updateAllTestCases() {
  console.log(`\n🔄 Updating Qase automation status for Patient Referrals tests...`);
  console.log(`📊 Project: ${QASE_PROJECT}\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const [testCaseId, testInfo] of Object.entries(TEST_CASES)) {
    const success = await updateQaseTestCaseStatus(parseInt(testCaseId), testInfo.status);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add delay between API calls to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✨ Update Complete!`);
  console.log(`✅ Successful: ${successCount}/${Object.keys(TEST_CASES).length}`);
  console.log(`❌ Failed: ${failureCount}/${Object.keys(TEST_CASES).length}`);
  console.log(`\n📋 Summary:`);
  console.log(`   - Automated: 15 tests`);
  console.log(`   - Manual: 2 tests (ONEVIEW-125: timeout, ONEVIEW-137: failed assertion)`);
  console.log(`\n🔍 Tests requiring investigation:`);
  console.log(`   - ONEVIEW-125: Test timeout during beforeEach hook`);
  console.log(`   - ONEVIEW-137: No data or empty state found in Referrals card`);
}

// Run the update
updateAllTestCases().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
