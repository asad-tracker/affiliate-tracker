const db = require('../models/db');
const { safePagination } = require('../utils/dbSafe');

async function keywordReport({ from, to, limit, offset } = {}) {
  const conditions = [];
  const params     = [];

  if (from) { params.push(from); conditions.push(`ck.created_at >= $${params.length}`); }
  if (to)   { params.push(to);   conditions.push(`ck.created_at <= $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { limit: lim, offset: off } = safePagination({ limit, offset });
  params.push(lim); const limitClause  = `$${params.length}`;
  params.push(off); const offsetClause = `$${params.length}`;

  const { rows } = await db.query(`
    SELECT
      ck.keyword_id,
      COUNT(DISTINCT ck.click_id)     AS clicks,
      COUNT(DISTINCT cv.click_id)     AS conversions,
      COALESCE(SUM(cv.payout), 0)     AS revenue
    FROM clicks ck
    LEFT JOIN conversions cv ON ck.click_id = cv.click_id
    ${where}
    GROUP BY ck.keyword_id
    ORDER BY revenue DESC, clicks DESC
    LIMIT ${limitClause} OFFSET ${offsetClause}
  `, params);

  return rows;
}

async function dailyReport({ from, to, limit, offset } = {}) {
  const conditions = [];
  const params     = [];

  if (from) { params.push(from); conditions.push(`ck.created_at >= $${params.length}::date`); }
  if (to)   { params.push(to);   conditions.push(`ck.created_at < ($${params.length}::date + INTERVAL '1 day')`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { limit: lim, offset: off } = safePagination({ limit, offset });
  params.push(lim); const limitClause  = `$${params.length}`;
  params.push(off); const offsetClause = `$${params.length}`;

  const { rows } = await db.query(`
    SELECT
      DATE(ck.created_at)                   AS day,
      COUNT(DISTINCT ck.click_id)           AS leads,
      COALESCE(SUM(cv.payout), 0)           AS your_earnings,
      COALESCE(SUM(cv.sale_value), 0)       AS sales_value,
      COUNT(DISTINCT cv.click_id)           AS sales_count
    FROM clicks ck
    LEFT JOIN conversions cv ON ck.click_id = cv.click_id
    ${where}
    GROUP BY DATE(ck.created_at)
    ORDER BY sales_count DESC, day DESC
    LIMIT ${limitClause} OFFSET ${offsetClause}
  `, params);

  return rows;
}

module.exports = { keywordReport, campaignReport };