const db = require('../models/db');
const { isValidDate, isValidDateRange } = require('../utils/validate');

async function googleAdsCsvData({ from, to } = {}) {
  const conditions = ['ck.gclid IS NOT NULL'];
  const params     = [];

  if (from) {
    params.push(from);
    conditions.push(`cv.created_at >= $${params.length}::date`);
  }
  if (to) {
    params.push(to);
    conditions.push(`cv.created_at < ($${params.length}::date + INTERVAL '1 day')`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows } = await db.query(`
    SELECT
      ck.gclid                                          AS "Google Click ID",
      'Purchase'                                        AS "Conversion Name",
      TO_CHAR(cv.created_at AT TIME ZONE 'UTC',
              'YYYY-MM-DD HH24:MI:SS')                 AS "Conversion Time",
      cv.payout                                         AS "Conversion Value",
      'USD'                                             AS "Currency"
    FROM conversions cv
    JOIN clicks ck ON cv.click_id = ck.click_id
    ${where}
    ORDER BY cv.created_at DESC
  `, params);

  return rows;
}

function rowsToCsv(rows) {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);

  const escape = (val) => {
    const str = val === null || val === undefined ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const headerLine = headers.map(escape).join(',');
  const dataLines  = rows.map(row =>
    headers.map(h => escape(row[h])).join(',')
  );

  return [headerLine, ...dataLines].join('\r\n');
}

module.exports = { googleAdsCsvData, rowsToCsv };