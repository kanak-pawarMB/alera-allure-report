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

// Test case IDs and their automation status
const TEST_CASES = {
  // Passing tests - mark as automated
  94: { status: 'automated', title: 'ONEVIEW-94: Verify top 10 most recent fills are displayed' },
  95: { status: 'automated', title: 'ONEVIEW-95: Verify only active prescriptions (last 6 months) are included' },
  97: { status: 'automated', title: 'ONEVIEW-97: Verify table column names and order' },
  98: { status: 'automated', title: 'ONEVIEW-98: Verify Fill Date format' },
  99: { status: 'automated', title: 'ONEVIEW-99: Verify "Medication Fill History" card title' },
  106: { status: 'automated', title: 'ONEVIEW-106: Verify sorting by Fill Date (descending)' },
  108: { status: 'manual', title: 'ONEVIEW-108: Verify empty state message' }, // Failing test
  109: { status: 'automated', title: 'ONEVIEW-109: Verify error handling for backend failure' },
  112: { status: 'automated', title: 'ONEVIEW-112: Validate message for invalid drug search' },
  113: { status: 'automated', title: 'ONEVIEW-113: Verify all available classes listed in dropdown' },
  114: { status: 'automated', title: 'ONEVIEW-114: Validate default display of all classes before filter' },
  115: { status: 'automated', title: 'ONEVIEW-115: Ensure filters reset after closing modal' },
  116: { status: 'automated', title: 'ONEVIEW-116: Verify user can select specific time value' },
  117: { status: 'automated', title: 'ONEVIEW-117: Verify scroll functionality in results list' },
  118: { status: 'automated', title: 'ONEVIEW-118: Validate modal closes on outside click' },
  119: { status: 'automated', title: 'ONEVIEW-119: Verify hover behavior on "View All" link' },
  120: { status: 'automated', title: 'ONEVIEW-120: Verify filter can be applied after search' },
  121: { status: 'automated', title: 'ONEVIEW-121: Verify dropdown opens in correct direction' },
  122: { status: 'automated', title: 'ONEVIEW-122: Verify that multiple classes cannot be selected in Select Class dropdown' },
};

/**
 * Update test case automation status in Qase
 */
async function updateQaseTestCaseStatus(testCaseId, automationStatus) {
  const url = `https://api.qase.io/v1/case/${QASE_PROJECT}/${testCaseId}`;
  
  // Map automation status to Qase API values
  const statusMap = {
    'automated': 1,    // Automated
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
  console.log(`\n🔄 Updating Qase automation status for Medication Fill History tests...`);
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
  console.log(`   - Automated: 18 tests`);
  console.log(`   - Manual: 1 test (ONEVIEW-108 - requires investigation)`);
}

// Run the update
updateAllTestCases().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
