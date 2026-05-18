#!/usr/bin/env node

/**
 * Fetch Cost/Utilization test cases from Qase (IDs 283, 284, 286-296)
 */

import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const PROJECT = 'ONEVIEW';
const TEST_CASE_IDS = [283, 284, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296];

if (!QASE_API_TOKEN) {
  console.error('❌ QASE_API_TOKEN not defined in .env');
  process.exit(1);
}

async function fetchTestCase(caseId) {
  try {
    const response = await fetch(
      `https://api.qase.io/v1/case/${PROJECT}/${caseId}`,
      {
        method: 'GET',
        headers: {
          'Token': QASE_API_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`❌ Failed to fetch ONEVIEW-${caseId}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('\n🔄 Fetching Cost/Utilization test cases from Qase...\n');

  const testCases = [];

  for (const caseId of TEST_CASE_IDS) {
    console.log(`📥 Fetching ONEVIEW-${caseId}...`);
    const testCase = await fetchTestCase(caseId);
    
    if (testCase) {
      testCases.push({
        id: caseId,
        title: testCase.title,
        description: testCase.description,
        preconditions: testCase.preconditions,
        postconditions: testCase.postconditions,
        steps: testCase.steps,
      });
      console.log(`   ✅ ${testCase.title}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Save to JSON file
  fs.writeFileSync(
    'cost-utilization-cases.json',
    JSON.stringify(testCases, null, 2)
  );

  console.log(`\n✅ Fetched ${testCases.length}/${TEST_CASE_IDS.length} test cases`);
  console.log(`📄 Saved to cost-utilization-cases.json\n`);
}

main();
