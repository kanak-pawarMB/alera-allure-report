/**
 * Qase Integration Runner for ADT Alerts Regression Tests
 * =========================================================
 * Workflow:
 *   1. Reset all ADT Alert case statuses → "to-be-automated" (1)
 *   2. Create a Qase test run with all ADT case IDs
 *   3. Run Playwright tests for ADTAlerts.spec.js (JSON output to file)
 *   4. Parse results and map test titles → Qase case IDs
 *   5. Post results to the Qase run
 *   6. Update automation status: passed → 2 (Automated), failed → 0 (Manual)
 *   7. Complete the Qase run
 *
 * Usage:
 *   node qase/run-adt-alerts.js
 *   npm run test:adt-qase
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// ── Config ────────────────────────────────────────────────────────────────────

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT   = process.env.QASE_PROJECT || 'ONEVIEW';
const QASE_API_BASE  = 'https://api.qase.io/v1';

/** All Qase test case IDs covered by ADTAlerts.spec.js */
const ADT_CASE_IDS = [266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281];

const RESULTS_FILE = resolve(__dirname, 'adt-results.json');

// ── Automation status codes ───────────────────────────────────────────────────
// 0 = not-automated (Manual)
// 1 = to-be-automated
// 2 = automated

// ── Helpers ───────────────────────────────────────────────────────────────────

async function qaseRequest(method, path, body) {
  const url = `${QASE_API_BASE}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      'Token': QASE_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Qase API error [${method} ${path}]: ${data.errorMessage || JSON.stringify(data)}`);
  }

  return data;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Step 1: Reset all cases to "to-be-automated" (1) ─────────────────────────

async function resetToBeAutomated(caseIds) {
  console.log(`\n🔄 Resetting ${caseIds.length} case(s) to "to-be-automated" (automation=1)...`);

  let successCount = 0;
  let failCount = 0;

  for (const id of caseIds) {
    try {
      await qaseRequest('PATCH', `/case/${QASE_PROJECT}/${id}`, { automation: 1 });
      successCount++;
      process.stdout.write(`\r  Progress: ${successCount + failCount}/${caseIds.length} (${successCount} ok, ${failCount} failed)`);
      await delay(150);
    } catch (err) {
      failCount++;
      process.stdout.write(`\n  ⚠️  Could not reset case ${id}: ${err.message}\n`);
    }
  }

  process.stdout.write('\n');
  console.log(`✅ Reset complete — ${successCount} cases set to "to-be-automated"${failCount > 0 ? `, ${failCount} skipped` : ''}`);
}

// ── Step 2: Create Qase test run ──────────────────────────────────────────────

async function createTestRun(caseIds) {
  const title = `ADT Alerts Automated Run – ${new Date().toISOString().slice(0, 10)}`;
  console.log(`\n🚀 Creating Qase test run: "${title}" with ${caseIds.length} case(s)...`);

  const data = await qaseRequest('POST', `/run/${QASE_PROJECT}`, {
    title,
    cases: caseIds,
    is_autotest: true,
  });

  const runId = data.result.id;
  console.log(`✅ Test run created — ID: ${runId}`);
  return runId;
}

// ── Step 3: Run Playwright tests ──────────────────────────────────────────────

function runPlaywrightTests() {
  console.log('\n🧪 Running Playwright tests for ADTAlerts.spec.js...');

  const cmd = `npx playwright test tests/regression/ADTAlerts.spec.js --reporter=json --project=chromium`;

  try {
    execSync(cmd, {
      cwd: resolve(__dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: RESULTS_FILE },
      stdio: 'inherit',
      timeout: 300_000, // 5 min max
    });
    console.log('✅ All tests passed. Results saved to qase/adt-results.json');
  } catch (err) {
    if (existsSync(RESULTS_FILE)) {
      console.log('⚠️  Some tests failed (expected). Results saved to qase/adt-results.json');
    } else {
      console.error('❌ Playwright did not produce JSON output file. Check test setup.');
      throw new Error('Playwright execution failed without producing JSON output.');
    }
  }
}

// ── Step 4: Parse results ─────────────────────────────────────────────────────

function parseResults() {
  const raw    = readFileSync(RESULTS_FILE, 'utf8');
  const report = JSON.parse(raw);
  const results = [];

  function walkSuites(suites) {
    for (const suite of suites) {
      if (suite.specs) {
        for (const spec of suite.specs) {
          const match = spec.title.match(/ONEVIEW-(\d+)/i);
          if (!match) continue;

          const caseId = parseInt(match[1], 10);
          const tests  = spec.tests || [];
          const last   = tests[tests.length - 1];
          if (!last) continue;

          const resultArr  = last.results || [];
          const lastResult = resultArr[resultArr.length - 1];
          const rawStatus  = lastResult?.status || 'skipped';

          const qaseStatus =
            rawStatus === 'passed'   ? 'passed'  :
            rawStatus === 'failed'   ? 'failed'  :
            rawStatus === 'timedOut' ? 'failed'  :
            'skipped';

          results.push({ caseId, status: qaseStatus, duration: lastResult?.duration || 0 });
        }
      }
      if (suite.suites) walkSuites(suite.suites);
    }
  }

  walkSuites(report.suites || []);
  return results;
}

// ── Step 5: Post results to Qase run ─────────────────────────────────────────

async function postResults(runId, results) {
  console.log(`\n📤 Posting ${results.length} result(s) to Qase run ${runId}...`);

  for (const r of results) {
    try {
      await qaseRequest('POST', `/result/${QASE_PROJECT}/${runId}`, {
        case_id: r.caseId,
        status:  r.status,
        time_ms: r.duration,
      });
      console.log(`  Case ${r.caseId}: ${r.status}`);
      await delay(200);
    } catch (err) {
      console.warn(`  ⚠️  Failed to post result for case ${r.caseId}: ${err.message}`);
    }
  }
}

// ── Step 6: Update automation status ─────────────────────────────────────────

async function updateAutomationStatuses(results) {
  const passed  = results.filter(r => r.status === 'passed');
  const failed  = results.filter(r => r.status === 'failed');
  const skipped = results.filter(r => r.status === 'skipped');

  console.log('\n🔄 Updating automation statuses...');
  console.log(`   Passed:  ${passed.length}  →  Automated (2)`);
  console.log(`   Failed:  ${failed.length}  →  Manual / not-automated (0)`);
  console.log(`   Skipped: ${skipped.length}  →  no change`);

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
      console.log(`  🔴 Case ${r.caseId} → Manual (not-automated)`);
      await delay(300);
    } catch (err) {
      console.warn(`  ⚠️  Could not update case ${r.caseId}: ${err.message}`);
    }
  }
}

// ── Step 7: Complete the run ──────────────────────────────────────────────────

async function completeRun(runId) {
  console.log(`\n🏁 Completing Qase test run ${runId}...`);
  await qaseRequest('POST', `/run/${QASE_PROJECT}/${runId}/complete`);
  console.log('✅ Run completed.');
  console.log(`🔗 View run: https://app.qase.io/run/${QASE_PROJECT}/dashboard/${runId}`);
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

function cleanup() {
  if (existsSync(RESULTS_FILE)) unlinkSync(RESULTS_FILE);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!QASE_API_TOKEN) {
    console.error('❌ QASE_API_TOKEN is not set in .env. Aborting.');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Qase Integration: ADT Alerts Regression Tests');
  console.log(`  Project: ${QASE_PROJECT}`);
  console.log('═══════════════════════════════════════════════════════');

  let runId;

  try {
    // 1. Reset all cases to "to-be-automated"
    await resetToBeAutomated(ADT_CASE_IDS);

    // 2. Create test run
    runId = await createTestRun(ADT_CASE_IDS);

    // 3. Run Playwright tests
    runPlaywrightTests();

    // 4. Parse results
    const results = parseResults();
    const passedCount  = results.filter(r => r.status === 'passed').length;
    const failedCount  = results.filter(r => r.status === 'failed').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    console.log(`\n📊 Parsed ${results.length} result(s) from Playwright output`);
    console.log(`   Passed: ${passedCount}  |  Failed: ${failedCount}  |  Skipped: ${skippedCount}`);

    // 5. Post results
    await postResults(runId, results);

    // 6. Update automation statuses
    await updateAutomationStatuses(results);

    // 7. Complete run
    await completeRun(runId);

    console.log('\n✨ Done! ADT Alerts Qase integration complete.\n');
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    if (runId) {
      try { await completeRun(runId); } catch (_) { /* best-effort */ }
    }
    process.exit(1);
  } finally {
    cleanup();
  }
}

main();
