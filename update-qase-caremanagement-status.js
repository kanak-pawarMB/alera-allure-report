import dotenv from 'dotenv';

dotenv.config();

const API_TOKEN = process.env.QASE_API_TOKEN;
const PROJECT_CODE = 'ONEVIEW';
const BASE_URL = 'https://api.qase.io/v1';

// Test results from execution
const testResults = {
  passed: [164, 165, 166, 167, 169, 170, 171, 172, 173, 174, 177, 178, 179, 180, 181],
  failed: [168, 187, 188]
};

async function updateTestCaseAutomationStatus(caseId, isAutomated) {
  const url = `${BASE_URL}/case/${PROJECT_CODE}/${caseId}`;
  
  const response = await global.fetch(url, {
    method: 'PATCH',
    headers: {
      'Token': API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      automation: isAutomated ? 2 : 0 // 2 = automated, 0 = manual
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update case ${caseId}: ${error}`);
  }

  return await response.json();
}

async function main() {
  console.log('\n=== Updating Qase Automation Status for Care Management Tests ===\n');
  
  let successCount = 0;
  let errorCount = 0;

  // Update passed tests as automated
  console.log('Updating PASSED tests as AUTOMATED:');
  for (const caseId of testResults.passed) {
    try {
      await updateTestCaseAutomationStatus(caseId, true);
      console.log(`✅ ONEVIEW-${caseId}: Set to AUTOMATED`);
      successCount++;
    } catch (error) {
      console.error(`❌ ONEVIEW-${caseId}: ${error.message}`);
      errorCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
  }

  // Update failed tests as manual
  console.log('\nUpdating FAILED tests as MANUAL:');
  for (const caseId of testResults.failed) {
    try {
      await updateTestCaseAutomationStatus(caseId, false);
      console.log(`✅ ONEVIEW-${caseId}: Set to MANUAL`);
      successCount++;
    } catch (error) {
      console.error(`❌ ONEVIEW-${caseId}: ${error.message}`);
      errorCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total test cases: ${testResults.passed.length + testResults.failed.length}`);
  console.log(`Automated: ${testResults.passed.length}`);
  console.log(`Manual: ${testResults.failed.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

main().catch(console.error);
