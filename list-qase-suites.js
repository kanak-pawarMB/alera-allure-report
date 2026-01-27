import 'dotenv/config';

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT = 'ONEVIEW';

async function fetchSuites() {
  const response = await fetch(`https://api.qase.io/v1/suite/${QASE_PROJECT}`, {
    headers: { 'Token': QASE_API_TOKEN }
  });
  const data = await response.json();
  
  console.log('📁 Available Test Suites in ONEVIEW:\n');
  data.result.entities.forEach(s => {
    console.log(`  - ${s.title} (ID: ${s.id})`);
  });
}

fetchSuites();
