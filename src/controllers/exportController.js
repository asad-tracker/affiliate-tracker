const { googleAdsCsvData, rowsToCsv } = require('../services/exportService');
const { isValidDate, isValidDateRange } = require('../utils/validate');

async function googleAdsCsv(req, res, next) {
  try {
    const { from, to } = req.query;

    if (from && !isValidDate(from)) {
      return res.status(400).json({ error: 'Invalid "from" date. Use YYYY-MM-DD format.' });
    }
    if (to && !isValidDate(to)) {
      return res.status(400).json({ error: 'Invalid "to" date. Use YYYY-MM-DD format.' });
    }
    if (from && to && !isValidDateRange(from, to)) {
      return res.status(400).json({ error: '"from" date must be before "to" date.' });
    }

    const rows = await googleAdsCsvData({ from, to });

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'No conversions found for the given date range.',
      });
    }

    const csv      = rowsToCsv(rows);
    const filename = `google-ads-conversions-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    res.status(200).send(csv);

  } catch (err) { next(err); }
}

module.exports = { googleAdsCsv };