import dotenv from 'dotenv';

dotenv.config();

const PROJECT_CODE = 'ONEVIEW';
const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_API_URL = 'https://api.qase.io/v1';

// Test case IDs - all passed in Run #58, so all automated
const passedTests = [229, 232, 233, 234, 235, 236, 240];
const failedTests = [];

const statusMap = {
  automated: 2,      // Automated status value
  manual: 0          // Manual status value
};

/**
 * Update test automation status in Qase
 */
async function updateTestStatus(testId, isAutomated) {
  const automationValue = isAutomated ? statusMap.automated : statusMap.manual;
  const statusLabel = isAutomated ? 'AUTOMATED' : 'MANUAL';

  const url = `${QASE_API_URL}/case/${PROJECT_CODE}/${testId}`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Token': QASE_API_TOKEN
      },
      body: JSON.stringify({
        automation: automationValue
      })
    });

    if (response.ok) {
      console.log(`✅ ONEVIEW-${testId}: ${statusLabel} (automation: ${automationValue})`);
      return true;
    } else {
      console.error(`❌ ONEVIEW-${testId}: Failed (HTTP ${response.status})`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ONEVIEW-${testId}: Error - ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('=== SDOHBarriers Automation Status Update ===\n');

  let successCount = 0;
  let errorCount = 0;

  // Update passed tests as automated
  if (passedTests.length > 0) {
    console.log('PASSED → AUTOMATED:');
    for (const testId of passedTests) {
      const success = await updateTestStatus(testId, true);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n');
  }

  // Update failed tests as manual
  console.log('FAILED → MANUAL:');
  for (const testId of failedTests) {
    const success = await updateTestStatus(testId, false);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total: ${passedTests.length + failedTests.length} | Automated: ${passedTests.length} | Manual: ${failedTests.length}`);
  console.log(`Updated: ${successCount} | Errors: ${errorCount}`);
}

main().catch(console.error);
