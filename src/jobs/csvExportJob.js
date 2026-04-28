const cron = require('node-cron');
const fs   = require('fs');
const path = require('path');
const { googleAdsCsvData, rowsToCsv } = require('../services/exportService');

const EXPORT_DIR = path.join(__dirname, '../../exports');

function ensureExportDir() {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
}

async function runExport() {
  try {
    ensureExportDir();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);

    const rows = await googleAdsCsvData({ from: dateStr, to: dateStr });

    if (rows.length === 0) {
      console.log(`[CSV Export] No conversions for ${dateStr} — skipping file.`);
      return;
    }

    const csv      = rowsToCsv(rows);
    const filename = `google-ads-${dateStr}.csv`;
    const filepath = path.join(EXPORT_DIR, filename);

    fs.writeFileSync(filepath, csv, 'utf8');
    console.log(`[CSV Export] Saved ${rows.length} rows to ${filepath}`);

  } catch (err) {
    console.error('[CSV Export] Job failed:', err.message);
  }
}

function startCsvExportJob() {
  cron.schedule('5 0 * * *', () => {
    console.log('[CSV Export] Running scheduled export...');
    runExport();
  });

  console.log('[CSV Export] Scheduler started — runs daily at 00:05 AM');
}

module.exports = { startCsvExportJob, runExport };