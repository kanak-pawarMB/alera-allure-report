import 'dotenv/config';
import fs from 'fs';

const QASE_TOKEN = process.env.QASE_API_TOKEN;
const PROJECT_CODE = 'ONEVIEW';
const caseIds = [398, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 411, 412, 413, 415];

async function fetchTestCase(id) {
  const response = await fetch(`https://api.qase.io/v1/case/${PROJECT_CODE}/${id}`, {
    headers: {
      Token: QASE_TOKEN,
      Accept: 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch case ${id}: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.result;
}

async function main() {
  console.log(`Fetching ${caseIds.length} test cases...`);
  const cases = [];
  for (const id of caseIds) {
    try {
      const testCase = await fetchTestCase(id);
      cases.push({
        id: testCase.id,
        title: testCase.title,
        description: testCase.description,
        steps: testCase.steps
      });
      console.log(`✓ Fetched case ${id}: ${testCase.title}`);
    } catch (error) {
      console.error(`✗ Error fetching case ${id}:`, error.message);
    }
  }
  fs.writeFileSync('modal-medication-fill-cases.json', JSON.stringify(cases, null, 2));
  console.log(`\n✓ Fetched ${cases.length}/${caseIds.length} cases`);
  console.log('✓ Saved to modal-medication-fill-cases.json');
}

main();
