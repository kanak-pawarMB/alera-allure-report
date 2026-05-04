/**
 * Generates a standalone HTML test report from allure-results JSON files.
 * Output: Phase2-TestReport.html (self-contained, no server needed)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = resolve(__dirname, '../allure-results');
const OUTPUT_FILE = resolve(__dirname, '../Phase2-TestReport.html');

// ── Read and de-duplicate results ─────────────────────────────────────────────

const files = readdirSync(RESULTS_DIR).filter(f => f.endsWith('-result.json'));
const byName = new Map();

for (const file of files) {
  try {
    const raw  = readFileSync(resolve(RESULTS_DIR, file), 'utf8');
    const data = JSON.parse(raw);
    if (!data.name) continue;

    // For retried tests keep the last result (highest stop time)
    const existing = byName.get(data.name);
    if (!existing || data.stop > existing.stop) {
      byName.set(data.name, data);
    }
  } catch (_) { /* skip malformed files */ }
}

const allTests = [...byName.values()].sort((a, b) => {
  const suiteA = a.labels?.find(l => l.name === 'suite')?.value || '';
  const suiteB = b.labels?.find(l => l.name === 'suite')?.value || '';
  return suiteA.localeCompare(suiteB) || a.name.localeCompare(b.name);
});

// ── Stats ─────────────────────────────────────────────────────────────────────

const passed  = allTests.filter(t => t.status === 'passed').length;
const failed  = allTests.filter(t => t.status === 'failed').length;
const skipped = allTests.filter(t => t.status === 'skipped').length;
const broken  = allTests.filter(t => t.status === 'broken').length;
const total   = allTests.length;

const totalDurationMs = allTests.reduce((s, t) => s + ((t.stop || 0) - (t.start || 0)), 0);
const totalMin = Math.floor(totalDurationMs / 60000);
const totalSec = Math.round((totalDurationMs % 60000) / 1000);

// ── Group by suite ────────────────────────────────────────────────────────────

const suiteMap = new Map();
for (const t of allTests) {
  const raw   = t.labels?.find(l => l.name === 'suite')?.value || 'Other';
  const suite = raw.replace(/^.*[/\\]/, '').replace('.spec.js', '');
  if (!suiteMap.has(suite)) suiteMap.set(suite, []);
  suiteMap.get(suite).push(t);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDuration(ms) {
  if (!ms) return '–';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function statusBadge(status) {
  const map = {
    passed:  ['#16a34a', 'PASSED'],
    failed:  ['#dc2626', 'FAILED'],
    broken:  ['#f97316', 'BROKEN'],
    skipped: ['#6b7280', 'SKIPPED'],
  };
  const [color, label] = map[status] || ['#6b7280', status.toUpperCase()];
  return `<span class="badge" style="background:${color}">${label}</span>`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Build HTML ────────────────────────────────────────────────────────────────

const runDate = new Date().toLocaleString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

let suiteRows = '';
for (const [suite, tests] of suiteMap) {
  const sp = tests.filter(t => t.status === 'passed').length;
  const sf = tests.filter(t => t.status === 'failed').length;
  const ss = tests.filter(t => ['skipped','broken'].includes(t.status)).length;

  suiteRows += `
  <tr class="suite-header" onclick="toggleSuite('${escapeHtml(suite)}')">
    <td colspan="3">
      <span class="chevron" id="chev-${escapeHtml(suite)}">▶</span>
      <strong>${escapeHtml(suite)}</strong>
      <span class="suite-stats">
        <span style="color:#16a34a">✓ ${sp}</span>
        ${sf > 0 ? `<span style="color:#dc2626">✗ ${sf}</span>` : ''}
        ${ss > 0 ? `<span style="color:#6b7280">⊘ ${ss}</span>` : ''}
      </span>
    </td>
    <td style="text-align:right;color:#6b7280">${tests.length} tests</td>
  </tr>`;

  for (const t of tests) {
    const dur = fmtDuration((t.stop || 0) - (t.start || 0));
    const msg = t.statusDetails?.message
      ? `<div class="fail-msg">${escapeHtml(t.statusDetails.message.split('\n')[0].slice(0, 200))}</div>`
      : '';
    suiteRows += `
  <tr class="test-row suite-${escapeHtml(suite)} status-${t.status}" style="display:none">
    <td class="test-name">${escapeHtml(t.name)}${msg}</td>
    <td>${statusBadge(t.status)}</td>
    <td style="color:#6b7280;text-align:right">${dur}</td>
    <td></td>
  </tr>`;
  }
}

const passPercent = total > 0 ? Math.round((passed / total) * 100) : 0;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Phase-2 Test Report</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
         background: #f8fafc; color: #1e293b; font-size: 14px; }
  header { background: #1e293b; color: #fff; padding: 24px 32px; }
  header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  header p  { color: #94a3b8; font-size: 13px; }
  .summary { display: flex; gap: 16px; padding: 20px 32px; flex-wrap: wrap; }
  .card { background: #fff; border-radius: 10px; border: 1px solid #e2e8f0;
          padding: 16px 24px; min-width: 140px; flex: 1; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  .card .value { font-size: 32px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
  .card .label { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; }
  .card.passed .value  { color: #16a34a; }
  .card.failed .value  { color: #dc2626; }
  .card.skipped .value { color: #6b7280; }
  .card.total .value   { color: #1e293b; }
  .progress-bar { margin: 0 32px 16px; height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg,#16a34a,#22c55e);
                   width: ${passPercent}%; transition: width .4s; }
  .filter-bar { padding: 0 32px 12px; display: flex; gap: 8px; align-items: center; }
  .filter-bar button { border: 1px solid #e2e8f0; background: #fff; color: #475569;
                       padding: 5px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .filter-bar button:hover, .filter-bar button.active { background: #1e293b; color: #fff; border-color: #1e293b; }
  .search { margin-left: auto; }
  .search input { border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 12px;
                  font-size: 13px; width: 240px; outline: none; }
  .search input:focus { border-color: #6366f1; }
  table { width: 100%; border-collapse: collapse; background: #fff;
          margin: 0 32px 32px; width: calc(100% - 64px);
          border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  th { background: #f1f5f9; text-align: left; padding: 10px 16px;
       font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #64748b;
       border-bottom: 1px solid #e2e8f0; }
  td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .suite-header { background: #f8fafc; cursor: pointer; user-select: none; }
  .suite-header:hover { background: #f1f5f9; }
  .suite-header td { font-size: 13px; color: #374151; }
  .suite-stats { margin-left: 12px; font-size: 12px; }
  .suite-stats span { margin-right: 8px; }
  .chevron { margin-right: 8px; font-size: 11px; display: inline-block;
             transition: transform .2s; }
  .test-name { max-width: 620px; line-height: 1.4; }
  .fail-msg { margin-top: 4px; font-size: 12px; color: #dc2626;
              background: #fef2f2; padding: 4px 8px; border-radius: 4px; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 99px;
           color: #fff; font-size: 11px; font-weight: 600; letter-spacing: .04em; }
  .hidden { display: none !important; }
</style>
</head>
<body>

<header>
  <h1>Phase-2 Test Report — Alera ONEView</h1>
  <p>Generated ${runDate} &nbsp;|&nbsp; ${totalMin}m ${totalSec}s total duration</p>
</header>

<div class="summary">
  <div class="card total"><div class="value">${total}</div><div class="label">Total</div></div>
  <div class="card passed"><div class="value">${passed}</div><div class="label">Passed</div></div>
  <div class="card failed"><div class="value">${failed + broken}</div><div class="label">Failed</div></div>
  <div class="card skipped"><div class="value">${skipped}</div><div class="label">Skipped (Manual)</div></div>
</div>

<div class="progress-bar"><div class="progress-fill"></div></div>

<div class="filter-bar">
  <button class="active" onclick="filterStatus('all',this)">All ${total}</button>
  <button onclick="filterStatus('passed',this)">Passed ${passed}</button>
  <button onclick="filterStatus('failed',this)">Failed ${failed + broken}</button>
  <button onclick="filterStatus('skipped',this)">Skipped ${skipped}</button>
  <div class="search"><input id="searchBox" type="text" placeholder="Search test name…" oninput="doSearch(this.value)"></div>
</div>

<table id="resultsTable">
  <thead>
    <tr>
      <th>Test Name</th>
      <th>Status</th>
      <th style="text-align:right">Duration</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
${suiteRows}
  </tbody>
</table>

<script>
var openSuites = {};
var currentFilter = 'all';
var currentSearch = '';

function toggleSuite(name) {
  openSuites[name] = !openSuites[name];
  var chev = document.getElementById('chev-' + name);
  if (chev) chev.style.transform = openSuites[name] ? 'rotate(90deg)' : '';
  applyVisibility();
}

function filterStatus(status, btn) {
  currentFilter = status;
  document.querySelectorAll('.filter-bar button').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  applyVisibility();
}

function doSearch(val) {
  currentSearch = val.toLowerCase();
  applyVisibility();
}

function applyVisibility() {
  var rows = document.querySelectorAll('#resultsTable tbody tr');
  rows.forEach(function(row) {
    if (row.classList.contains('suite-header')) return;
    var classes = row.className;
    var suiteName = (classes.match(/suite-([^ ]+)/) || [])[1] || '';
    var status    = (classes.match(/status-([^ ]+)/) || [])[1] || '';
    var testName  = (row.querySelector('.test-name') || {}).innerText || '';

    var statusOk  = currentFilter === 'all'
      || status === currentFilter
      || (currentFilter === 'failed' && status === 'broken');
    var searchOk  = !currentSearch || testName.toLowerCase().includes(currentSearch);
    var suiteOpen = openSuites[suiteName];

    row.style.display = (suiteOpen && statusOk && searchOk) ? '' : 'none';
  });
}

// Expand all suites on load so everything is visible by default
window.onload = function() {
  document.querySelectorAll('.suite-header').forEach(function(row) {
    var chev = row.querySelector('.chevron');
    var suiteName = (chev ? chev.id.replace('chev-','') : '');
    if (suiteName) {
      openSuites[suiteName] = true;
      chev.style.transform = 'rotate(90deg)';
    }
  });
  applyVisibility();
};
</script>
</body>
</html>`;

writeFileSync(OUTPUT_FILE, html, 'utf8');
const sizeMB = (html.length / 1024 / 1024).toFixed(2);
console.log(`✅ Report generated: Phase2-TestReport.html (${sizeMB} MB)`);
console.log(`   ${total} tests — ${passed} passed | ${failed + broken} failed | ${skipped} skipped`);
