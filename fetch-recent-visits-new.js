import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const QASE_API_KEY = process.env.QASE_API_TOKEN;
const QASE_PROJECT_CODE = process.env.QASE_PROJECT || 'ONEVIEW';
const CASE_IDS = [430, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447];

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
  console.log(`Fetching ${CASE_IDS.length} Recent Visits test cases from Qase...`);
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

  fs.writeFileSync('recent-visits-cases.json', JSON.stringify(cases, null, 2));
  console.log(`\n✓ Fetched ${cases.length}/${CASE_IDS.length} cases → recent-visits-cases.json`);
}

fetchCases().catch(console.error);
