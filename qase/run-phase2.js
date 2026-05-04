/**
 * Qase Integration Runner — Phase-2 Full Run
 * ============================================
 * Runs ALL Phase-2 test cases as one combined Qase test run:
 *   1. Smoke tests first  (tests/smokePhase-2/, --project=smoke)
 *   2. Regression tests second (tests/regressionPhase-2/, --project=chromium)
 *
 * Workflow:
 *   1. Scan both Phase-2 directories for ONEVIEW IDs → resolve actual QASE case IDs
 *   2. Reset all 149 cases → "to-be-automated" (automation: 1)
 *   3. Create ONE combined Qase run titled "Phase-2 Full Run – YYYY-MM-DD"
 *   4. Run smoke spec files one-by-one (project=smoke, QASE_MODE=off)
 *   5. Run regression spec files one-by-one (project=chromium, QASE_MODE=off)
 *   6. Post all results to the single run
 *   7. Complete the run
 *   8. Update automation statuses AFTER completion (Qase resets on complete):
 *        - Manual (automation: 0): case 811 + DragAndDrop cases 853–857
 *        - Automated (automation: 2): everything else
 *   9. Generate combined Allure HTML report
 *
 * Usage:
 *   node qase/run-phase2.js
 *   npm run test:phase2
 *
 * NOTE: QASE_MODE=off is set for all Playwright child processes to prevent
 * playwright-qase-reporter from creating duplicate runs or extra suite folders.
 *
 * NOTE: QASE auto-assigned sequential IDs to new cases — they do not match the
 * ONEVIEW numbers in test titles. The ID_MAP below translates ONEVIEW numbers
 * (read from spec file qaseId annotations) to actual QASE case IDs.
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, rmSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { generateXlsxReport, saveResultsCache } from './generate-xlsx-report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// ── Config ────────────────────────────────────────────────────────────────────

const QASE_API_TOKEN = process.env.QASE_API_TOKEN;
const QASE_PROJECT   = process.env.QASE_PROJECT || 'ONEVIEW';
const QASE_API_BASE  = 'https://api.qase.io/v1';
const RESULTS_FILE   = resolve(__dirname, 'test-results.json');
const SMOKE_DIR      = resolve(__dirname, '../tests/smokePhase-2');
const REGRESSION_DIR = resolve(__dirname, '../tests/regressionPhase-2');
const BLOB_DIR       = resolve(__dirname, '../blob-report');

// ── Automation status codes ───────────────────────────────────────────────────
// 0 = not-automated (Manual)
// 1 = to-be-automated
// 2 = automated

// ── Cases that cannot be automated → set to Manual (automation: 0) ───────────
// QASE ID 811: ONEVIEW-811 (re-login persistence — requires new browser session)
// QASE IDs 853–857: DragAndDrop stubs (React DnD not compatible with Playwright)
const MANUAL_CASE_IDS = new Set([811, 853, 854, 855, 856, 857]);

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

// ── QASE case ID resolution ───────────────────────────────────────────────────
// All QASE case IDs for cases whose spec qaseId annotation matches the actual
// QASE ID. For original Phase-2 regression cases (708–837 minus 738, 785)
// and smoke PreferredLayout (805–812) the QASE ID equals the ONEVIEW number.
//
// For new cases created by playwright-qase-reporter (which QASE auto-numbered),
// the spec file qaseId annotations have already been updated to the correct
// QASE IDs, so no remapping is needed — we read them directly from the JSON.

// ── Step 1: Scan spec directories and extract ONEVIEW case IDs ────────────────

function extractCaseIds(dir) {
  const specCaseMap = {};
  const files = readdirSync(dir).filter(f => f.endsWith('.spec.js')).sort();

  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf8');
    // Read the qaseId annotation values (actual QASE IDs in spec files)
    const matches = [...content.matchAll(/description:\s*['"](\d+)['"]/g)];
    const ids = [...new Set(matches.map(m => parseInt(m[1], 10)))].sort((a, b) => a - b);
    if (ids.length > 0) specCaseMap[file] = ids;
  }

  return specCaseMap;
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
  console.log(`✅ Reset complete — ${ok} case(s) reset${fail > 0 ? `, ${fail} skipped` : ''}`);
}

// ── Step 3: Create Qase test run ──────────────────────────────────────────────

async function createTestRun(caseIds) {
  const date  = new Date().toISOString().slice(0, 10);
  const title = `Phase-2 Full Run – ${date}`;
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

// ── Step 4/5: Run Playwright tests ───────────────────────────────────────────

function runPlaywrightTests(testPath, project, extraFlags = '') {
  console.log(`\n🧪 Running: ${testPath}  [--project=${project}]`);

  // blob: accumulates per-file results for merge-reports at the end
  // json: provides QASE result data for this runner
  const cmd = `npx playwright test "${testPath}" --project=${project} --reporter=blob,json${extraFlags ? ' ' + extraFlags : ''}`;

  try {
    execSync(cmd, {
      cwd: resolve(__dirname, '..'),
      encoding: 'utf8',
      env: {
        ...process.env,
        PLAYWRIGHT_JSON_OUTPUT_NAME: RESULTS_FILE,
        QASE_MODE: 'off',   // disable playwright-qase-reporter — this runner handles Qase
      },
      stdio: 'inherit',
      timeout: 1_800_000,
    });
    console.log('  ✅ Passed.');
  } catch (err) {
    if (existsSync(RESULTS_FILE)) {
      console.log('  ⚠️  Some tests failed. Continuing to report results...');
    } else {
      throw new Error('Playwright did not produce JSON output. Check test setup.');
    }
  }
}

// ── Parse results from JSON output ───────────────────────────────────────────

function parseResults() {
  const raw    = readFileSync(RESULTS_FILE, 'utf8');
  const report = JSON.parse(raw);
  const results = [];

  function walkSuites(suites, filePath = '') {
    for (const suite of suites) {
      // Top-level suite title is the file path; carry it down through nested describes
      const currentFile = filePath || suite.title || '';
      if (suite.specs) {
        for (const spec of suite.specs) {
          const tests     = spec.tests || [];
          const last      = tests[tests.length - 1];
          if (!last) continue;

          const annotations = last.annotations || [];
          const qaseAnn     = annotations.find(a => a.type === 'qaseId');
          if (!qaseAnn) continue;

          const caseId     = parseInt(qaseAnn.description, 10);
          const resultArr  = last.results || [];
          const lastResult = resultArr[resultArr.length - 1];
          const rawStatus  = lastResult?.status || 'skipped';

          const qaseStatus =
            rawStatus === 'passed'   ? 'passed'  :
            rawStatus === 'failed'   ? 'failed'  :
            rawStatus === 'timedOut' ? 'failed'  :
            'skipped';

          // Derive a short suite label from the file path
          const suite = currentFile
            .replace(/\\/g, '/')
            .replace(/^.*tests\//, '')
            .replace(/\.spec\.js$/, '');

          results.push({
            caseId,
            status: qaseStatus,
            duration: lastResult?.duration || 0,
            title: spec.title,
            suite,
          });
        }
      }
      if (suite.suites) walkSuites(suite.suites, currentFile);
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

// ── Step 7: Complete the run ──────────────────────────────────────────────────

async function completeRun(runId) {
  console.log(`\n🏁 Completing Qase run ${runId}...`);
  await qaseRequest('POST', `/run/${QASE_PROJECT}/${runId}/complete`);
  console.log('✅ Run completed.');
  console.log(`🔗 https://app.qase.io/run/${QASE_PROJECT}/dashboard/${runId}`);
}

// ── Step 8: Update automation statuses ───────────────────────────────────────

async function updateAutomationStatuses(allCaseIds) {
  const manual    = allCaseIds.filter(id => MANUAL_CASE_IDS.has(id));
  const automated = allCaseIds.filter(id => !MANUAL_CASE_IDS.has(id));

  console.log('\n🔄 Updating automation statuses...');
  console.log(`   Automated (2): ${automated.length} case(s)`);
  console.log(`   Manual    (0): ${manual.length} case(s) → [${manual.join(', ')}]`);

  for (const id of automated) {
    try {
      await qaseRequest('PATCH', `/case/${QASE_PROJECT}/${id}`, { automation: 2 });
      process.stdout.write(`\r  Automated: ${automated.indexOf(id) + 1}/${automated.length}`);
      await delay(150);
    } catch (err) {
      console.warn(`\n  ⚠️  Could not update case ${id}: ${err.message}`);
    }
  }
  process.stdout.write('\n');

  for (const id of manual) {
    try {
      await qaseRequest('PATCH', `/case/${QASE_PROJECT}/${id}`, { automation: 0 });
      console.log(`  📋 Case ${id} → Manual`);
      await delay(200);
    } catch (err) {
      console.warn(`  ⚠️  Could not update case ${id}: ${err.message}`);
    }
  }

  console.log('✅ Automation statuses updated.');
}

// ── Step 9: Generate combined HTML report ────────────────────────────────────

function generateCustomHtmlReport(allResults) {
  const ROOT       = resolve(__dirname, '..');
  const OUTPUT     = resolve(ROOT, 'Phase2-TestReport.html');

  // De-duplicate: keep last result per test title
  const byTitle = new Map();
  for (const r of allResults) {
    const key = r.caseId || r.title;
    byTitle.set(key, r);
  }
  const tests = [...byTitle.values()].sort((a, b) =>
    (a.suite || '').localeCompare(b.suite || '') || (a.title || '').localeCompare(b.title || '')
  );

  const passed  = tests.filter(t => t.status === 'passed').length;
  const failed  = tests.filter(t => t.status === 'failed').length;
  const skipped = tests.filter(t => t.status === 'skipped').length;
  const total   = tests.length;
  const totalMs = tests.reduce((s, t) => s + (t.duration || 0), 0);
  const totalMin = Math.floor(totalMs / 60000);
  const totalSec = Math.round((totalMs % 60000) / 1000);
  const passPercent = total > 0 ? Math.round((passed / total) * 100) : 0;

  // Group by suite
  const suiteMap = new Map();
  for (const t of tests) {
    const s = t.suite || 'Other';
    if (!suiteMap.has(s)) suiteMap.set(s, []);
    suiteMap.get(s).push(t);
  }

  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmtDur = ms => !ms ? '–' : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  const badge = st => {
    const m = { passed: ['#16a34a','PASSED'], failed: ['#dc2626','FAILED'], skipped: ['#6b7280','SKIPPED'] };
    const [c, l] = m[st] || ['#6b7280', st.toUpperCase()];
    return `<span class="badge" style="background:${c}">${l}</span>`;
  };

  let suiteRows = '';
  for (const [suite, items] of suiteMap) {
    const sp = items.filter(t => t.status === 'passed').length;
    const sf = items.filter(t => t.status === 'failed').length;
    const ss = items.filter(t => t.status === 'skipped').length;
    const sid = esc(suite).replace(/[^a-zA-Z0-9]/g, '_');
    suiteRows += `
  <tr class="suite-header" onclick="toggle('${sid}')">
    <td colspan="3">
      <span class="chev" id="chev-${sid}">▶</span>
      <strong>${esc(suite)}</strong>
      <span class="ss"><span style="color:#16a34a">✓ ${sp}</span>${sf ? ` <span style="color:#dc2626">✗ ${sf}</span>` : ''}${ss ? ` <span style="color:#6b7280">⊘ ${ss}</span>` : ''}</span>
    </td>
    <td style="text-align:right;color:#6b7280">${items.length} tests</td>
  </tr>`;
    for (const t of items) {
      suiteRows += `
  <tr class="test-row s-${sid} st-${t.status}" style="display:none">
    <td class="tn">${esc(t.title)}</td>
    <td>${badge(t.status)}</td>
    <td style="color:#6b7280;text-align:right">${fmtDur(t.duration)}</td>
    <td></td>
  </tr>`;
    }
  }

  const runDate = new Date().toLocaleString('en-US', { month:'long', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Phase-2 Test Report</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;font-size:14px}
header{background:#1e293b;color:#fff;padding:24px 32px}
header h1{font-size:22px;font-weight:700;margin-bottom:4px}
header p{color:#94a3b8;font-size:13px}
.summary{display:flex;gap:16px;padding:20px 32px;flex-wrap:wrap}
.card{background:#fff;border-radius:10px;border:1px solid #e2e8f0;padding:16px 24px;min-width:140px;flex:1;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.card .value{font-size:32px;font-weight:700;line-height:1;margin-bottom:4px}
.card .label{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b}
.card.passed .value{color:#16a34a}.card.failed .value{color:#dc2626}.card.skipped .value{color:#6b7280}.card.total .value{color:#1e293b}
.pb{margin:0 32px 16px;height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden}
.pf{height:100%;background:linear-gradient(90deg,#16a34a,#22c55e);width:${passPercent}%}
.fb{padding:0 32px 12px;display:flex;gap:8px;align-items:center}
.fb button{border:1px solid #e2e8f0;background:#fff;color:#475569;padding:5px 14px;border-radius:6px;cursor:pointer;font-size:13px}
.fb button:hover,.fb button.active{background:#1e293b;color:#fff;border-color:#1e293b}
.fb .srch{margin-left:auto}.fb .srch input{border:1px solid #e2e8f0;border-radius:6px;padding:5px 12px;font-size:13px;width:240px;outline:none}
.fb .srch input:focus{border-color:#6366f1}
table{width:calc(100% - 64px);border-collapse:collapse;background:#fff;margin:0 32px 32px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)}
th{background:#f1f5f9;text-align:left;padding:10px 16px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:1px solid #e2e8f0}
td{padding:10px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top}
tr:last-child td{border-bottom:none}
.suite-header{background:#f8fafc;cursor:pointer;user-select:none}.suite-header:hover{background:#f1f5f9}.suite-header td{font-size:13px;color:#374151}
.ss{margin-left:12px;font-size:12px}.ss span{margin-right:8px}
.chev{margin-right:8px;font-size:11px;display:inline-block;transition:transform .2s}
.tn{max-width:620px;line-height:1.4}
.badge{display:inline-block;padding:2px 10px;border-radius:99px;color:#fff;font-size:11px;font-weight:600;letter-spacing:.04em}
</style></head><body>
<header><h1>Phase-2 Test Report — Alera ONEView</h1><p>Generated ${runDate} &nbsp;|&nbsp; ${totalMin}m ${totalSec}s total duration</p></header>
<div class="summary">
  <div class="card total"><div class="value">${total}</div><div class="label">Total</div></div>
  <div class="card passed"><div class="value">${passed}</div><div class="label">Passed</div></div>
  <div class="card failed"><div class="value">${failed}</div><div class="label">Failed</div></div>
  <div class="card skipped"><div class="value">${skipped}</div><div class="label">Skipped (Manual)</div></div>
</div>
<div class="pb"><div class="pf"></div></div>
<div class="fb">
  <button class="active" onclick="filt('all',this)">All ${total}</button>
  <button onclick="filt('passed',this)">Passed ${passed}</button>
  <button onclick="filt('failed',this)">Failed ${failed}</button>
  <button onclick="filt('skipped',this)">Skipped ${skipped}</button>
  <div class="srch"><input id="sb" type="text" placeholder="Search test name…" oninput="srch(this.value)"></div>
</div>
<table id="tbl"><thead><tr><th>Test Name</th><th>Status</th><th style="text-align:right">Duration</th><th></th></tr></thead>
<tbody>${suiteRows}</tbody></table>
<script>
var open={},cf='all',cs='';
function toggle(id){open[id]=!open[id];var c=document.getElementById('chev-'+id);if(c)c.style.transform=open[id]?'rotate(90deg)':'';render()}
function filt(s,btn){cf=s;document.querySelectorAll('.fb button').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');render()}
function srch(v){cs=v.toLowerCase();render()}
function render(){document.querySelectorAll('#tbl tbody tr').forEach(function(row){
  if(row.classList.contains('suite-header'))return;
  var cls=row.className,sid=(cls.match(/s-([^ ]+)/)||[])[1]||'',st=(cls.match(/st-([^ ]+)/)||[])[1]||'';
  var nm=(row.querySelector('.tn')||{}).innerText||'';
  var sok=cf==='all'||st===cf,qok=!cs||nm.toLowerCase().includes(cs);
  row.style.display=(open[sid]&&sok&&qok)?'':'none'
})}
window.onload=function(){document.querySelectorAll('.suite-header').forEach(function(r){var c=r.querySelector('.chev');if(c){var id=c.id.replace('chev-','');open[id]=true;c.style.transform='rotate(90deg)'}});render()};
</script></body></html>`;

  writeFileSync(OUTPUT, html, 'utf8');
  const sizeMB = (html.length / 1024 / 1024).toFixed(2);
  console.log(`\n✅ HTML report generated → Phase2-TestReport.html (${sizeMB} MB)`);
  console.log(`   ${total} tests — ${passed} passed | ${failed} failed | ${skipped} skipped`);
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

  // Scan both Phase-2 directories
  const smokeCaseMap      = extractCaseIds(SMOKE_DIR);
  const regressionCaseMap = extractCaseIds(REGRESSION_DIR);

  const smokeFiles      = Object.keys(smokeCaseMap);
  const regressionFiles = Object.keys(regressionCaseMap);

  const allSmokeIds      = [...new Set(Object.values(smokeCaseMap).flat())].sort((a, b) => a - b);
  const allRegressionIds = [...new Set(Object.values(regressionCaseMap).flat())].sort((a, b) => a - b);
  const allCaseIds       = [...new Set([...allSmokeIds, ...allRegressionIds])].sort((a, b) => a - b);

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Qase Integration: Phase-2 Full Run');
  console.log(`  Project: ${QASE_PROJECT}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\n📂 Smoke files (${smokeFiles.length}):`);
  for (const [file, ids] of Object.entries(smokeCaseMap)) {
    console.log(`   ${file.padEnd(35)} ${ids.length} case(s)`);
  }
  console.log(`\n📂 Regression files (${regressionFiles.length}):`);
  for (const [file, ids] of Object.entries(regressionCaseMap)) {
    console.log(`   ${file.padEnd(35)} ${ids.length} case(s)`);
  }
  console.log(`\n📋 Total unique QASE case IDs: ${allCaseIds.length}`);

  // Clean any previous blob reports so we start fresh
  if (existsSync(BLOB_DIR)) {
    rmSync(BLOB_DIR, { recursive: true, force: true });
    console.log('🧹 Cleaned previous blob-report/');
  }

  let runId;
  const allResults = [];

  try {
    // 1. Reset all cases to "to-be-automated"
    await resetToBeAutomated(allCaseIds);

    // 2. Create ONE combined test run
    runId = await createTestRun(allCaseIds);

    // 3. Run SMOKE tests file-by-file
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PHASE 1: Smoke Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const file of smokeFiles) {
      runPlaywrightTests(`tests/smokePhase-2/${file}`, 'smoke', '--retries=1');
      const fileResults = parseResults();
      console.log(`  📊 ${file}: ${fileResults.length} result(s)`);
      allResults.push(...fileResults);
      cleanup();
    }

    // 4. Run REGRESSION tests file-by-file
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PHASE 2: Regression Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const file of regressionFiles) {
      runPlaywrightTests(`tests/regressionPhase-2/${file}`, 'chromium', '--workers=1 --retries=1');
      const fileResults = parseResults();
      console.log(`  📊 ${file}: ${fileResults.length} result(s)`);
      allResults.push(...fileResults);
      cleanup();
    }

    const passedCount  = allResults.filter(r => r.status === 'passed').length;
    const failedCount  = allResults.filter(r => r.status === 'failed').length;
    const skippedCount = allResults.filter(r => r.status === 'skipped').length;

    console.log(`\n📊 Total: ${allResults.length} result(s) — ✅ ${passedCount} passed | ❌ ${failedCount} failed | ⏭️  ${skippedCount} skipped`);

    // 5. Post all results
    await postResults(runId, allResults);

    // 6. Complete run BEFORE updating automation statuses
    await completeRun(runId);

    // 7. Update automation statuses (after run close — Qase resets on complete)
    await updateAutomationStatuses(allCaseIds);

    // 8. Generate combined HTML report + XLSX report
    generateCustomHtmlReport(allResults);
    saveResultsCache(allResults);
    await generateXlsxReport(allResults);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✨ Phase-2 Full Run Complete!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📋 Qase run: https://app.qase.io/run/${QASE_PROJECT}/dashboard/${runId}`);
    console.log('\n📊 HTML Report:');
    console.log('   View: npm run report:html');
    console.log('');

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
