import 'dotenv/config';
import fs from 'fs';

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT_CODE = 'ONEVIEW';
const QASE_API_URL = 'https://api.qase.io/v1';

async function fetchTestCaseById(testId) {
  try {
    const response = await fetch(
      `${QASE_API_URL}/case/${QASE_PROJECT_CODE}/${testId}`,
      {
        headers: {
          'Token': QASE_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.log(`⚠️  Test case ${testId} not found`);
      return null;
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.log(`⚠️  Error fetching test case ${testId}: ${error.message}`);
    return null;
  }
}

async function fetchMedicationFillHistoryTestCases() {
  try {
    console.log('🔍 Fetching Medication Fill History test cases from Qase...\n');

    // Medication Fill History test case IDs - specifically from the user's list
    const medicationFillHistoryTestIds = [94, 95, 97, 98, 99, 106, 108, 109, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122];
    
    console.log(`📋 Fetching ${medicationFillHistoryTestIds.length} test cases:\n`);
    
    const medicationFillHistoryCases = [];
    
    // Fetch each test case individually
    for (const testId of medicationFillHistoryTestIds) {
      const testCase = await fetchTestCaseById(testId);
      if (testCase) {
        medicationFillHistoryCases.push(testCase);
        console.log(`   ✅ ONEVIEW-${testId}: ${testCase.title}`);
      } else {
        console.log(`   ❌ ONEVIEW-${testId}: Not found`);
      }
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Successfully fetched ${medicationFillHistoryCases.length} Medication Fill History test cases\n`);

    // Sort by ID for better organization
    medicationFillHistoryCases.sort((a, b) => a.id - b.id);

    console.log('📝 Test Case Summary:');
    medicationFillHistoryCases.forEach(tc => {
      console.log(`   - ONEVIEW-${tc.id}: ${tc.title}`);
    });

    // Save to file
    const outputData = {
      suite: 'Medication Fill History on Dashboard',
      totalCases: medicationFillHistoryCases.length,
      regressionCases: medicationFillHistoryCases,
      fetchedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      'qase-medicationfillhistory-cases.json',
      JSON.stringify(outputData, null, 2)
    );

    console.log('\n✅ Saved to qase-medicationfillhistory-cases.json');

  } catch (error) {
    console.error('❌ Error fetching test cases:', error.message);
    process.exit(1);
  }
}

fetchMedicationFillHistoryTestCases();
