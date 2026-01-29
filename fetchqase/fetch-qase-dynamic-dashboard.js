// Fetch Dynamic Dashboard test cases from Qase API
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT = 'ONEVIEW';
const QASE_API_BASE = 'https://api.qase.io/v1';

async function fetchDynamicDashboardCases() {
  // Fetch all test cases
  const url = `${QASE_API_BASE}/case/${QASE_PROJECT}?limit=100`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Token': QASE_API_TOKEN,
      'Content-Type': 'application/json',
    }
  });

  const data = await response.json();
  
  if (response.ok && data.result) {
    console.log(`\n✅ Total test cases fetched: ${data.result.entities.length}\n`);
    
    // First, let's see all suite titles to find the right one
    const suites = new Set();
    data.result.entities.forEach(tc => {
      if (tc.suite) {
        suites.add(`ID: ${tc.suite.id}, Title: "${tc.suite.title}"`);
      }
    });
    
    console.log('Available suites:');
    Array.from(suites).forEach(s => console.log(`  ${s}`));
    
    // Look for Dynamic Dashboard test cases by checking test IDs (including user-specified ones)
    const knownDashboardIds = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 76, 77, 78, 79, 80];
    const dynamicDashboardCases = data.result.entities.filter(tc => 
      knownDashboardIds.includes(tc.id) || 
      tc.title?.toLowerCase().includes('dashboard') ||
      tc.title?.toLowerCase().includes('layout') ||
      tc.title?.toLowerCase().includes('card order') ||
      tc.title?.toLowerCase().includes('personalized')
    );

    console.log(`\n📊 Dynamic Dashboard related cases: ${dynamicDashboardCases.length}\n`);
    
    // Separate smoke vs regression
    const smokeCaseIds = [35, 38, 42]; // Known smoke test IDs
    const regressionCases = dynamicDashboardCases.filter(tc => !smokeCaseIds.includes(tc.id));
    
    console.log(`📝 Smoke tests: ${smokeCaseIds.length}`);
    console.log(`📝 Regression tests: ${regressionCases.length}\n`);
    
    // Save to file
    fs.writeFileSync(
      'qase-dynamic-dashboard-cases.json',
      JSON.stringify(regressionCases, null, 2)
    );
    
    console.log('Regression test case details:');
    regressionCases.forEach(tc => {
      console.log(`  - ID ${tc.id}: ${tc.title}`);
      console.log(`    Automation: ${tc.automation}`);
      console.log(`    Type: ${tc.type}`);
    });
    
    return regressionCases;
  } else {
    console.error('❌ Failed to fetch test cases:', data);
    return [];
  }
}

fetchDynamicDashboardCases().catch(console.error);
