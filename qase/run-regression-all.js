/**
 * Qase Integration Runner — Regression Suite
 * ============================================
 * Supports running a single spec file OR all regression files.
 *
 * Workflow:
 *   1. Scan spec file(s) for ONEVIEW case IDs
 *   2. Reset those case statuses → "to-be-automated" (1)
 *   3. Create ONE combined Qase test run with all case IDs
 *   4. Run Playwright tests FILE-BY-FILE (--project=chromium), accumulate results
 *   5. Parse results and map test titles → Qase case IDs
 *   6. Post all results to the single Qase run
 *   7. Complete the Qase run
 *   8. Update automation status: passed → 2 (Automated), failed → 0 (Manual)
 *
 * Usage:
 *   # Run a single spec file (recommended — one at a time):
 *   node qase/run-regression-all.js BehavioralHealthDiagnoses
 *   node qase/run-regression-all.js CareManagement
 *   node qase/run-regression-all.js HealthPlan
 *
 *   # Run all regression files at once:
 *   node qase/run-regression-all.js
 *   npm run test:regression-qase
 *
 * File name matching is flexible — pass just the base name without .spec.js
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// ── Config ────────────────────────────────────────────────────────────────────

const QASE_API_TOKEN  = process.env.QASE_API_TOKEN;
const QASE_PROJECT    = process.env.QASE_PROJECT || 'ONEVIEW';
const QASE_API_BASE   = 'https://api.qase.io/v1';
const RESULTS_FILE    = resolve(__dirname, 'test-results.json');
const REGRESSION_DIR  = resolve(__dirname, '../tests/regression');

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
    throw new Error(`Qase API [${method} ${path}]: ${data.errorMessage || JSON.stringify(data)}`);
  }

  return data;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Step 1: Resolve target spec file(s) and extract ONEVIEW IDs ──────────────

function resolveTargetFiles(fileArg) {
  const allFiles = readdirSync(REGRESSION_DIR)
    .filter(f => f.endsWith('.spec.js'))
    .sort();

  if (fileArg) {
    // Normalise: allow "BehavioralHealthDiagnoses" or "BehavioralHealthDiagnoses.spec.js"
    const needle = fileArg.endsWith('.spec.js') ? fileArg : `${fileArg}.spec.js`;
    const match  = allFiles.find(f => f.toLowerCase() === needle.toLowerCase());

    if (!match) {
      console.error(`\n❌ Spec file not found: "${needle}"`);
      console.error(`   Available files:\n${allFiles.map(f => `     ${f}`).join('\n')}`);
      process.exit(1);
    }

    return [match];
  }

  return allFiles;
}

function extractCaseIds(specFiles) {
  const specCaseMap = {};
  const allIds = [];

  for (const file of specFiles) {
    const content = readFileSync(join(REGRESSION_DIR, file), 'utf8');
    const matches = [...content.matchAll(/ONEVIEW-(\d+)/gi)];
    const ids = [...new Set(matches.map(m => parseInt(m[1], 10)))].sort((a, b) => a - b);

    if (ids.length > 0) {
      specCaseMap[file] = ids;
      allIds.push(...ids);
    }
  }

  const uniqueIds = [...new Set(allIds)].sort((a, b) => a - b);
  return { specCaseMap, uniqueIds };
}

// ── Step 2: Reset all cases to "to-be-automated" (1) ─────────────────────────

async function resetToBeAutomated(caseIds) {
  console.log(`\n🔄 Resetting ${caseIds.length} case(s) to "to-be-automated" (automation=1)...`);

  let ok = 0, fail = 0;

  for (const id of caseIds) {
    try {
      await qaseRequest('PATCH', `/case/${QASE_PROJECT}/${id}`, { automation: 1 });
      ok++;
      process.stdout.write(`\r  Progress: ${ok + fail}/${caseIds.length} (${ok} ok, ${fail} failed)`);
      await delay(150);
    } catch (err) {
      fail++;
      process.stdout.write(`\n  ⚠️  Could not reset case ${id}: ${err.message}\n`);
    }
  }

  process.stdout.write('\n');
  console.log(`✅ Reset complete — ${ok} case(s) set to "to-be-automated"${fail > 0 ? `, ${fail} skipped` : ''}`);
}

// ── Step 3: Create Qase test run ──────────────────────────────────────────────

async function createTestRun(caseIds, label) {
  const date  = new Date().toISOString().slice(0, 10);
  const title = `${label} – ${date}`;
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

// ── Step 4: Run Playwright tests ──────────────────────────────────────────────

function runPlaywrightTests(testPath) {
  console.log(`\n🧪 Running Playwright tests: ${testPath}`);

  const cmd = `npx playwright test ${testPath} --project=chromium`;

  try {
    execSync(cmd, {
      cwd: resolve(__dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: RESULTS_FILE, SKIP_ALLURE_CLEAN: '1' },
      stdio: 'inherit',
      timeout: 1_800_000, // 30 min max
    });
    console.log('\n✅ All tests passed.');
  } catch (err) {
    if (existsSync(RESULTS_FILE)) {
      console.log('\n⚠️  Some tests failed (expected). Continuing to report results...');
    } else {
      throw new Error('Playwright did not produce JSON output. Check test setup.');
    }
  }
}

// ── Step 5: Parse results ─────────────────────────────────────────────────────

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

// ── Step 6: Post results to Qase run ─────────────────────────────────────────

async function postResults(runId, results) {
  console.log(`\n📤 Posting ${results.length} result(s) to Qase run ${runId}...`);
  let posted = 0;

  for (const r of results) {
    try {
      await qaseRequest('POST', `/result/${QASE_PROJECT}/${runId}`, {
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

// ── Step 7: Update automation statuses ───────────────────────────────────────

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

// ── Step 8: Complete the run ──────────────────────────────────────────────────

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

  // Optional file argument: node qase/run-regression-all.js BehavioralHealthDiagnoses
  const fileArg = process.argv[2] || null;

  const targetFiles  = resolveTargetFiles(fileArg);
  const { specCaseMap, uniqueIds } = extractCaseIds(targetFiles);

  const isSingleFile = targetFiles.length === 1;
  const label = isSingleFile
    ? targetFiles[0].replace('.spec.js', '') + ' Regression'
    : 'Regression Suite – All Tests';

  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Qase Integration: ${label}`);
  console.log(`  Project: ${QASE_PROJECT}`);
  console.log('═══════════════════════════════════════════════════════');

  if (isSingleFile) {
    const ids = specCaseMap[targetFiles[0]] || [];
    console.log(`\n📂 File: ${targetFiles[0]}`);
    console.log(`📋 Case IDs (${ids.length}): [${ids.join(', ')}]`);
  } else {
    console.log(`\n📂 Scanned ${targetFiles.length} spec file(s):`);
    for (const [file, ids] of Object.entries(specCaseMap)) {
      console.log(`   ${file.padEnd(45)} ${ids.length} case(s)  [${ids.join(', ')}]`);
    }
    console.log(`\n📋 Total unique case IDs: ${uniqueIds.length}`);
  }

  if (uniqueIds.length === 0) {
    console.warn('\n⚠️  No ONEVIEW case IDs found. Nothing to report to Qase.');
    process.exit(0);
  }

  let runId;
  const allResults = [];

  try {
    // 1. Reset all cases to "to-be-automated"
    await resetToBeAutomated(uniqueIds);

    // 2. Create ONE combined test run
    runId = await createTestRun(uniqueIds, label);

    // 3. Run Playwright tests FILE-BY-FILE and accumulate results
    //    (file-by-file ensures JSON is written after each file completes,
    //     avoiding the "no JSON output" failure when running all at once)
    for (const file of targetFiles) {
      const ids = specCaseMap[file];
      if (!ids || ids.length === 0) {
        console.log(`\n⏭️  Skipping ${file} — no ONEVIEW case IDs found`);
        continue;
      }

      const testPath = `tests/regression/${file}`;
      runPlaywrightTests(testPath);

      // Parse results for this file and merge
      const fileResults = parseResults();
      console.log(`\n📊 ${file}: ${fileResults.length} result(s) parsed`);
      allResults.push(...fileResults);

      // Clean up JSON between files so next file starts fresh
      cleanup();
    }

    const passedCount  = allResults.filter(r => r.status === 'passed').length;
    const failedCount  = allResults.filter(r => r.status === 'failed').length;
    const skippedCount = allResults.filter(r => r.status === 'skipped').length;

    console.log(`\n📊 Total results: ${allResults.length} test(s) with Qase IDs`);
    console.log(`   Passed: ${passedCount}  |  Failed: ${failedCount}  |  Skipped: ${skippedCount}`);

    // 4. Post all results to the single run
    await postResults(runId, allResults);

    // 5. Complete run BEFORE updating automation statuses
    // (Qase resets automation to "to-be-automated" on run completion,
    //  so statuses must be set AFTER the run is completed)
    await completeRun(runId);

    // 6. Update automation statuses (after run is closed so Qase doesn't override them)
    await updateAutomationStatuses(allResults);

    console.log(`\n✨ Done! ${label} Qase integration complete.\n`);

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
