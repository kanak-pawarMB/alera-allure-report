// Update Qase test case automation status
// Usage: node update-qase-automation-status.js

import dotenv from 'dotenv';
dotenv.config();

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT = 'ONEVIEW';
const QASE_API_BASE = 'https://api.qase.io/v1';

// Test cases that passed - mark as "automated"
const passedTestCaseIds = [82, 83, 84, 85, 87, 88, 89, 90, 91, 92];

// Test cases that failed - mark as "manual"
const failedTestCaseIds = [86]; // Failed - Card header validation (needs investigation)

/**
 * Update test case automation status in Qase
 * @param {number} testCaseId - Qase test case ID
 * @param {number} automationStatus - 0=not-automated, 1=to-be-automated, 2=automated
 */
async function updateTestCaseAutomation(testCaseId, automationStatus) {
  const url = `${QASE_API_BASE}/case/${QASE_PROJECT}/${testCaseId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Token': QASE_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      automation: automationStatus // 2 = automated, 0 = not-automated
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log(`✅ Test case ${testCaseId}: Updated automation status to ${automationStatus === 2 ? 'automated' : 'manual'}`);
  } else {
    console.error(`❌ Test case ${testCaseId}: Failed to update - ${data.errorMessage || JSON.stringify(data)}`);
  }
  
  return data;
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n🔄 Updating Qase test case automation status for project: ${QASE_PROJECT}\n`);

  // Update passed test cases to "automated"
  console.log('📝 Marking passed test cases as AUTOMATED...\n');
  for (const id of passedTestCaseIds) {
    await updateTestCaseAutomation(id, 2); // 2 = automated
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
  }

  // Update failed test cases to "not-automated" (manual)
  if (failedTestCaseIds.length > 0) {
    console.log('\n📝 Marking failed test cases as MANUAL...\n');
    for (const id of failedTestCaseIds) {
      await updateTestCaseAutomation(id, 0); // 0 = not-automated (manual)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✨ Completed! Updated ${passedTestCaseIds.length} test cases to automated.`);
}

main().catch(console.error);
