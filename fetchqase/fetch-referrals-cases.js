import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const QASE_API_KEY = process.env.QASE_API_TOKEN;
const QASE_PROJECT_CODE = process.env.QASE_PROJECT || 'ONEVIEW';
const CASE_IDS = [416, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.qase.io',
      path: path,
      method: 'GET',
      headers: {
        'Token': QASE_API_KEY
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).end();
  });
}

async function fetchCases() {
  console.log(`Fetching ${CASE_IDS.length} Referral test cases from Qase...`);
  const cases = [];
  for (const id of CASE_IDS) {
    try {
      const response = await makeRequest(`/v1/case/${QASE_PROJECT_CODE}/${id}`);
      if (response.result) {
        cases.push(response.result);
        console.log(`✓ Case ${id}: ${response.result.title}`);
      }
    } catch (e) {
      console.error(`✗ Failed to fetch case ${id}:`, e.message);
    }
  }

  fs.writeFileSync('referrals-cases.json', JSON.stringify(cases, null, 2));
  console.log(`\n✓ Fetched ${cases.length}/${CASE_IDS.length} cases → referrals-cases.json`);
}

fetchCases().catch(console.error);
