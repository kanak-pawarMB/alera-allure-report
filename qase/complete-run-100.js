/**
 * Complete in-progress Qase regression run ID 100
 * Runs all regression tests and posts results to the existing run.
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT   = process.env.QASE_PROJECT || 'ONEVIEW';
const QASE_API_BASE  = 'https://api.qase.io/v1';
const RESULTS_FILE   = resolve(__dirname, 'test-results.json');
const REGRESSION_DIR = resolve(__dirname, '../tests/regression');
const RUN_ID         = 100;

async function qaseRequest(method, path, body) {
  const url = `${QASE_API_BASE}${path}`;
  const response = await fetch(url, {
    method,
    headers: { 'Token': QASE_API_TOKEN, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Qase API [${method} ${path}]: ${data.errorMessage || JSON.stringify(data)}`);
  }
  return data;
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

function runPlaywrightTests(testPath) {
  console.log(`\n🧪 Running: ${testPath}`);
  const cmd = `npx playwright test ${testPath} --project=chromium`;
  try {
    execSync(cmd, {
      cwd: resolve(__dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: RESULTS_FILE, SKIP_ALLURE_CLEAN: '1' },
      stdio: 'inherit',
      timeout: 1_800_000,
    });
    console.log('✅ All tests passed.');
  } catch {
    if (existsSync(RESULTS_FILE)) {
      console.log('⚠️  Some tests failed. Continuing to report results...');
    } else {
      throw new Error('Playwright did not produce JSON output.');
    }
  }
}

function parseResults() {
  const raw = readFileSync(RESULTS_FILE, 'utf8');
  const report = JSON.parse(raw);
  const results = [];

  function walkSuites(suites) {
    for (const suite of suites) {
      if (suite.specs) {
        for (const spec of suite.specs) {
          const match = spec.title.match(/ONEVIEW-(\d+)/i);
          if (!match) continue;
          const caseId = parseInt(match[1], 10);
          const tests = spec.tests || [];
          const last = tests[tests.length - 1];
          if (!last) continue;
          const resultArr = last.results || [];
          const lastResult = resultArr[resultArr.length - 1];
          const rawStatus = lastResult?.status || 'skipped';
          const qaseStatus =
            rawStatus === 'passed'   ? 'passed'  :
            rawStatus === 'failed'   ? 'failed'  :
            rawStatus === 'timedOut' ? 'failed'  : 'skipped';
          results.push({ caseId, status: qaseStatus, duration: lastResult?.duration || 0 });
        }
      }
      if (suite.suites) walkSuites(suite.suites);
    }
  }

  walkSuites(report.suites || []);
  return results;
}

async function postResults(results) {
  console.log(`\n📤 Posting ${results.length} result(s) to run ${RUN_ID}...`);
  let posted = 0;
  for (const r of results) {
    try {
      await qaseRequest('POST', `/result/${QASE_PROJECT}/${RUN_ID}`, {
        case_id: r.caseId,
        status:  r.status,
        time_ms: r.duration,
      });
      posted++;
      process.stdout.write(`\r  Posted: ${posted}/${results.length}`);
      await delay(200);
    } catch (err) {
      console.warn(`\n  ⚠️  Failed to post result for case ${r.caseId}: ${err.message}`);
    }
  }
  process.stdout.write('\n');
}

async function updateAutomationStatuses(results) {
  const passed  = results.filter(r => r.status === 'passed');
  const failed  = results.filter(r => r.status === 'failed');
  console.log('\n🔄 Updating automation statuses...');
  console.log(`   Passed: ${passed.length} → Automated (2)`);
  console.log(`   Failed: ${failed.length} → Manual (0)`);

  for (const r of passed) {
    try {
      await qaseRequest('PATCH', `/case/${QASE_PROJECT}/${r.caseId}`, { automation: 2 });
      console.log(`  ✅ Case ${r.caseId} → Automated`);
      await delay(300);
    } catch (err) {
      console.warn(`  ⚠️  Could not update case ${r.caseId}: ${err.message}`);
    }
  }

  for (const r of failed) {
    try {
      await qaseRequest('PATCH', `/case/${QASE_PROJECT}/${r.caseId}`, { automation: 0 });
      console.log(`  🔴 Case ${r.caseId} → Manual`);
      await delay(300);
    } catch (err) {
      console.warn(`  ⚠️  Could not update case ${r.caseId}: ${err.message}`);
    }
  }
}

async function completeRun() {
  console.log(`\n🏁 Completing Qase run ${RUN_ID}...`);
  await qaseRequest('POST', `/run/${QASE_PROJECT}/${RUN_ID}/complete`);
  console.log('✅ Run completed.');
  console.log(`🔗 View: https://app.qase.io/run/${QASE_PROJECT}/dashboard/${RUN_ID}`);
}

async function main() {
  if (!QASE_API_TOKEN) {
    console.error('❌ QASE_API_TOKEN not set. Aborting.');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Completing Qase Run #${RUN_ID} — Regression Suite – All Tests`);
  console.log(`  Project: ${QASE_PROJECT}`);
  console.log('═══════════════════════════════════════════════════════');

  const allFiles = readdirSync(REGRESSION_DIR)
    .filter(f => f.endsWith('.spec.js'))
    .sort();

  const allResults = [];

  for (const file of allFiles) {
    const content = readFileSync(join(REGRESSION_DIR, file), 'utf8');
    const hasIds = /ONEVIEW-\d+/i.test(content);
    if (!hasIds) {
      console.log(`\n⏭️  Skipping ${file} — no ONEVIEW case IDs`);
      continue;
    }

    const testPath = `tests/regression/${file}`;
    runPlaywrightTests(testPath);

    const fileResults = parseResults();
    console.log(`📊 ${file}: ${fileResults.length} result(s) parsed`);
    allResults.push(...fileResults);

    if (existsSync(RESULTS_FILE)) unlinkSync(RESULTS_FILE);
  }

  const passedCount  = allResults.filter(r => r.status === 'passed').length;
  const failedCount  = allResults.filter(r => r.status === 'failed').length;
  const skippedCount = allResults.filter(r => r.status === 'skipped').length;

  console.log(`\n📊 Total: ${allResults.length} results`);
  console.log(`   Passed: ${passedCount} | Failed: ${failedCount} | Skipped: ${skippedCount}`);

  await postResults(allResults);
  await completeRun();
  await updateAutomationStatuses(allResults);

  console.log(`\n✨ Done! Run #${RUN_ID} complete.\n`);

  if (existsSync(RESULTS_FILE)) unlinkSync(RESULTS_FILE);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
