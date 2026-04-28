const svc = require('../services/reportsService');
const { isValidDate, isValidDateRange } = require('../utils/validate');
const { safePagination } = require('../utils/dbSafe');

function parseDateRange(query) {
  const { from, to } = query;

  if (from && !isValidDate(from)) {
    return { error: 'Invalid "from" date. Use YYYY-MM-DD format.' };
  }
  if (to && !isValidDate(to)) {
    return { error: 'Invalid "to" date. Use YYYY-MM-DD format.' };
  }
  if (from && to && !isValidDateRange(from, to)) {
    return { error: '"from" date must be before "to" date.' };
  }

  return { from: from || null, to: to || null };
}

async function keywords(req, res, next) {
  try {
    const dates = parseDateRange(req.query);
    if (dates.error) return res.status(400).json({ error: dates.error });

    const { limit, offset } = safePagination(req.query);
    const data = await svc.keywordReport({
      from:   dates.from,
      to:     dates.to,
      limit,
      offset,
    });

    res.json({
      meta: {
        from:   dates.from,
        to:     dates.to,
        limit,
        offset,
        count:  data.length,
      },
      data,
    });
  } catch (err) { next(err); }
}

async function campaigns(req, res, next) {
  try {
    const dates = parseDateRange(req.query);
    if (dates.error) return res.status(400).json({ error: dates.error });

    const { limit, offset } = safePagination(req.query);
    const data = await svc.campaignReport({
      from:   dates.from,
      to:     dates.to,
      limit,
      offset,
    });

    res.json({
      meta: {
        from:   dates.from,
        to:     dates.to,
        limit,
        offset,
        count:  data.length,
      },
      data,
    });
  } catch (err) { next(err); }
}

module.exports = { keywords, campaigns };