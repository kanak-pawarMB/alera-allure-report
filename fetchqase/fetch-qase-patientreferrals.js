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

/**
 * Fetch all test cases from Qase API with pagination
 */
async function fetchAllTestCases() {
  let allCases = [];
  let offset = 0;
  const limit = 100;
  
  while (true) {
    const url = `https://api.qase.io/v1/case/${QASE_PROJECT}?limit=${limit}&offset=${offset}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Token': QASE_API_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch test cases: ${response.status}`);
      }

      const data = await response.json();
      const cases = data.result?.entities || [];
      
      if (cases.length === 0) break;
      
      allCases = allCases.concat(cases);
      console.log(`  Fetched ${allCases.length} test cases...`);
      
      if (cases.length < limit) break;
      offset += limit;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error fetching test cases:', error);
      throw error;
    }
  }
  
  return allCases;
}

/**
 * Filter test cases for Patient Referrals suite (excluding smoke tests)
 */
function filterPatientReferralsTestCases(testCases) {
  const referralTests = testCases.filter(testCase => {
    const title = testCase.title?.toLowerCase() || '';
    const suiteTitle = testCase.suite?.title?.toLowerCase() || '';
    
    // Check if test case belongs to Patient Referrals/Referral suite
    const isReferralRelated = title.includes('referral') || 
                              suiteTitle.includes('referral') ||
                              title.includes('refer ');
    
    // Exclude smoke tests
    const isNotSmoke = !title.includes('@smoke') &&
                       !title.includes('smoke') &&
                       !suiteTitle.includes('smoke');
    
    return isReferralRelated && isNotSmoke;
  });
  
  // If no referral tests found, show what's available
  if (referralTests.length === 0) {
    console.log('\n🔍 Searching for referral-related keywords in all test cases...');
    const searchTerms = testCases.filter(tc => {
      const fullText = `${tc.title} ${tc.description || ''} ${tc.suite?.title || ''}`.toLowerCase();
      return fullText.includes('refer') || fullText.includes('specialist');
    });
    
    if (searchTerms.length > 0) {
      console.log(`Found ${searchTerms.length} potentially related test cases:`);
      searchTerms.slice(0, 10).forEach(tc => {
        console.log(`  - ONEVIEW-${tc.id}: ${tc.title} (Suite: ${tc.suite?.title || 'N/A'})`);
      });
    }
  }
  
  return referralTests;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Fetching Patient Referrals test cases from Qase...\n');

  const allTestCases = await fetchAllTestCases();
  console.log(`📊 Total test cases fetched: ${allTestCases.length}`);

  const patientReferralsTests = filterPatientReferralsTestCases(allTestCases);
  console.log(`🎯 Patient Referrals functional tests (excluding smoke): ${patientReferralsTests.length}\n`);

  if (patientReferralsTests.length === 0) {
    console.log('⚠️  No Patient Referrals test cases found. Trying alternative search...\n');
    
    // Alternative: Search by suite name or specific test case IDs
    console.log('Please provide Patient Referrals test case IDs or verify suite name in Qase.');
    return;
  }

  // Sort by ID for easier reference
  patientReferralsTests.sort((a, b) => a.id - b.id);

  // Display found test cases
  console.log('📋 Found test cases:');
  patientReferralsTests.forEach(tc => {
    console.log(`  ✓ ONEVIEW-${tc.id}: ${tc.title}`);
  });

  // Save to JSON file
  const outputPath = path.join(__dirname, 'qase-patientreferrals-cases.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(patientReferralsTests, null, 2),
    'utf8'
  );

  console.log(`\n✅ Test cases saved to: ${outputPath}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
