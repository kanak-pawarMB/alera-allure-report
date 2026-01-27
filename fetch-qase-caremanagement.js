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

// Care Management Information test case IDs provided by user
const TEST_CASE_IDS = [164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 177, 178, 179, 180, 181, 187, 188];

/**
 * Fetch a single test case by ID
 */
async function fetchTestCaseById(testCaseId) {
  const url = `https://api.qase.io/v1/case/${QASE_PROJECT}/${testCaseId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Token': QASE_API_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch ONEVIEW-${testCaseId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`❌ Error fetching ONEVIEW-${testCaseId}:`, error.message);
    return null;
  }
}

/**
 * Fetch all specified test cases
 */
async function fetchAllTestCases() {
  console.log('🔍 Fetching Care Management Information test cases from Qase...\n');
  console.log(`📊 Test case IDs: ${TEST_CASE_IDS.join(', ')}\n`);

  const testCases = [];

  for (const testCaseId of TEST_CASE_IDS) {
    const testCase = await fetchTestCaseById(testCaseId);
    if (testCase) {
      testCases.push(testCase);
      console.log(`✅ ONEVIEW-${testCaseId}: ${testCase.title}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return testCases;
}

/**
 * Main execution
 */
async function main() {
  const testCases = await fetchAllTestCases();
  
  console.log(`\n✅ Successfully fetched ${testCases.length}/${TEST_CASE_IDS.length} test cases`);

  // Sort by ID
  testCases.sort((a, b) => a.id - b.id);

  // Save to JSON file
  const outputPath = path.join(__dirname, 'qase-caremanagement-cases.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(testCases, null, 2),
    'utf8'
  );

  console.log(`\n📁 Test cases saved to: ${outputPath}`);
  
  // Display summary
  console.log(`\n📋 Test Cases Summary:`);
  testCases.forEach(tc => {
    console.log(`   ${tc.id}: ${tc.title}`);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
