import dotenv from 'dotenv';
dotenv.config();

const API_TOKEN = process.env.QASE_API_TOKEN;
const PROJECT_CODE = 'ONEVIEW';
const BASE_URL = 'https://api.qase.io/v1';

const passed = [125, 126, 127, 128, 129, 132, 133, 134, 135, 136, 138, 140, 141, 143, 145];
const failed = [137, 139];

async function update(caseId, isAutomated) {
  const response = await global.fetch(`${BASE_URL}/case/${PROJECT_CODE}/${caseId}`, {
    method: 'PATCH',
    headers: { 'Token': API_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ automation: isAutomated ? 2 : 0 })
  });
  if (!response.ok) throw new Error(`Failed: ${caseId}`);
  return response.json();
}

async function main() {
  console.log('\n=== PatientReferrals Automation Status Update ===\n');
  let success = 0, errors = 0;

  console.log('PASSED → AUTOMATED:');
  for (const id of passed) {
    try {
      await update(id, true);
      console.log(`✅ ONEVIEW-${id}`);
      success++;
    } catch (e) {
      console.error(`❌ ONEVIEW-${id}: ${e.message}`);
      errors++;
    }
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\nFAILED → MANUAL:');
  for (const id of failed) {
    try {
      await update(id, false);
      console.log(`✅ ONEVIEW-${id}`);
      success++;
    } catch (e) {
      console.error(`❌ ONEVIEW-${id}: ${e.message}`);
      errors++;
    }
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n=== Summary ===\nTotal: ${passed.length + failed.length} | Automated: ${passed.length} | Manual: ${failed.length}\nUpdated: ${success} | Errors: ${errors}`);
}

main().catch(console.error);
