import 'dotenv/config';
import fs from 'fs';

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT_CODE = 'ONEVIEW';
const QASE_API_URL = 'https://api.qase.io/v1';

async function fetchHealthPlanCardTestCases() {
  try {
    console.log('🔍 Fetching Health Plan Card test cases from Qase...\n');

    const response = await fetch(
      `${QASE_API_URL}/case/${QASE_PROJECT_CODE}?limit=100`,
      {
        headers: {
          'Token': QASE_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Qase API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Health Plan Card test case IDs: 82-92 (excluding 81 which is smoke)
    const healthPlanTestIds = [82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92];
    
    // Filter for Health Plan Card suite test cases by ID
    const healthPlanCases = data.result.entities.filter(testCase => {
      return healthPlanTestIds.includes(testCase.id);
    });

    console.log(`📊 Found ${healthPlanCases.length} Health Plan Card test cases (IDs: 82-92)\n`);
    
    // Log all test cases with their IDs for analysis
    console.log('📋 All Health Plan Card test cases:');
    healthPlanCases.forEach(tc => {
      console.log(`   - ONEVIEW-${tc.id}: ${tc.title}`);
    });

    // Exclude smoke test (81) - only include functional tests 82-92
    const smokeTestIds = [81];
    
    const smokeTests = [];
    
    const regressionTests = healthPlanCases.filter(tc => 
      !smokeTestIds.includes(tc.id) &&
      healthPlanTestIds.includes(tc.id)
    );

    console.log(`\n🔥 Smoke tests (excluded): ${smokeTests.length}`);
    console.log(`🧪 Regression tests (functional, ID 82-92): ${regressionTests.length}\n`);

    // Display test case IDs
    console.log('📝 Regression Test Case IDs (functional, 82-92):');
    regressionTests.forEach(tc => {
      console.log(`   - ONEVIEW-${tc.id}: ${tc.title}`);
    });

    // Save to file
    const outputData = {
      suite: 'Health Plan Card',
      totalCases: healthPlanCases.length,
      regressionCases: regressionTests,
      smokeCases: smokeTests,
      fetchedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      'qase-healthplan-cases.json',
      JSON.stringify(outputData, null, 2)
    );

    console.log('\n✅ Saved to qase-healthplan-cases.json');

  } catch (error) {
    console.error('❌ Error fetching test cases:', error.message);
    process.exit(1);
  }
}

fetchHealthPlanCardTestCases();
