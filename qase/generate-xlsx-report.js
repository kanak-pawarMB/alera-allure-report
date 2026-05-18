/**
 * generate-xlsx-report.js
 * =======================
 * Generates Phase2-TestReport.xlsx from Phase-2 run results.
 *
 * Columns (matching lead's tracking format):
 *   Test Case ID | Automation Layer | Tags | Is Active | Planned Flag | Cannot Automate Flag
 *
 * Usage (standalone — reads cached results from last run):
 *   node qase/generate-xlsx-report.js
 *
 * Or imported and called directly from run-phase2.js:
 *   import { generateXlsxReport } from './generate-xlsx-report.js';
 *   await generateXlsxReport(allResults);
 */

import ExcelJS from 'exceljs';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const CACHE_FILE   = resolve(__dirname, 'last-run-results.json');
const OUTPUT_FILE  = resolve(PROJECT_ROOT, 'Phase2-TestReport.xlsx');

// ── Save results cache (called from run-phase2.js after each run) ─────────────

export function saveResultsCache(allResults) {
  writeFileSync(CACHE_FILE, JSON.stringify(allResults, null, 2), 'utf8');
}

// ── Main generator ─────────────────────────────────────────────────────────────

export async function generateXlsxReport(allResults) {
  const workbook  = new ExcelJS.Workbook();
  const sheet     = workbook.addWorksheet('Phase-2 Test Cases');

  // ── Column definitions ──────────────────────────────────────────────────────
  sheet.columns = [
    { header: 'Test Case ID',          key: 'testCaseId',          width: 22 },
    { header: 'Automation Layer',      key: 'automationLayer',     width: 20 },
    { header: 'Tags',                  key: 'tags',                width: 24 },
    { header: 'Is Active',             key: 'isActive',            width: 12 },
    { header: 'Planned Flag',          key: 'plannedFlag',         width: 15 },
    { header: 'Cannot Automate Flag',  key: 'cannotAutomateFlag',  width: 22 },
  ];

  // ── Header styling ──────────────────────────────────────────────────────────
  const headerRow = sheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F3864' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFB8CCE4' } },
    };
  });
  headerRow.height = 22;

  // ── Freeze top row & enable autoFilter ─────────────────────────────────────
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: 'F1' };

  // ── Data rows ───────────────────────────────────────────────────────────────
  const YELLOW_FILL = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' },
  };

  allResults.forEach((r, idx) => {
    const isManual      = r.status === 'skipped';
    const testCaseId    = r.title.split(':')[0].trim();   // e.g. "ONEVIEW-776"
    const cannotAutomate = isManual ? 1 : 0;
    const tags           = isManual ? 'Cannot be automated' : '';

    const row = sheet.addRow({
      testCaseId,
      automationLayer:    'FE',
      tags,
      isActive:           'Yes',
      plannedFlag:        1,
      cannotAutomateFlag: cannotAutomate,
    });

    // Align numeric columns to center, text to left
    row.getCell('testCaseId').alignment       = { horizontal: 'left' };
    row.getCell('automationLayer').alignment  = { horizontal: 'center' };
    row.getCell('tags').alignment             = { horizontal: 'left' };
    row.getCell('isActive').alignment         = { horizontal: 'center' };
    row.getCell('plannedFlag').alignment      = { horizontal: 'center' };
    row.getCell('cannotAutomateFlag').alignment = { horizontal: 'center' };

    // Highlight manual (cannot automate) rows in light yellow
    if (isManual) {
      row.eachCell(cell => { cell.fill = YELLOW_FILL; });
    }

    // Alternating light gray for non-manual rows (even rows)
    if (!isManual && idx % 2 === 1) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      });
    }

    row.height = 18;
  });

  // ── Write file ──────────────────────────────────────────────────────────────
  await workbook.xlsx.writeFile(OUTPUT_FILE);

  const sizeMb = (
    (await import('fs')).statSync(OUTPUT_FILE).size / 1024
  ).toFixed(0);

  console.log(`✅ XLSX report generated → Phase2-TestReport.xlsx (${sizeMb} KB)`);
  console.log(`   ${allResults.length} rows — ${allResults.filter(r => r.status !== 'skipped').length} automated | ${allResults.filter(r => r.status === 'skipped').length} manual`);
}

// ── Standalone CLI entry point ─────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!existsSync(CACHE_FILE)) {
    console.error('❌ No cached results found. Run npm run test:phase2 first.');
    process.exit(1);
  }
  const allResults = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  generateXlsxReport(allResults).catch(err => {
    console.error('❌ Error generating XLSX:', err.message);
    process.exit(1);
  });
}
