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

async function campaignReport({ from, to, limit, offset } = {}) {
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
      c.id                              AS campaign_id,
      c.name                            AS campaign_name,
      c.country,
      COUNT(DISTINCT ck.click_id)       AS clicks,
      COUNT(DISTINCT cv.click_id)       AS conversions,
      COALESCE(SUM(cv.payout), 0)       AS revenue,
      CASE
        WHEN COUNT(DISTINCT ck.click_id) > 0
        THEN ROUND(
          COUNT(DISTINCT cv.click_id)::numeric /
          COUNT(DISTINCT ck.click_id)::numeric * 100, 2
        )
        ELSE 0
      END                               AS cvr_percent
    FROM campaigns c
    LEFT JOIN clicks      ck ON ck.campaign_id = c.id
    LEFT JOIN conversions cv ON ck.click_id    = cv.click_id
    ${where}
    GROUP BY c.id, c.name, c.country
    ORDER BY revenue DESC, clicks DESC
    LIMIT ${limitClause} OFFSET ${offsetClause}
  `, params);

  return rows;
}

module.exports = { keywordReport, campaignReport };