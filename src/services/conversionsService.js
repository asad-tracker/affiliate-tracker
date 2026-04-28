const db = require('../models/db');
const { getClickById } = require('./clicksService');

async function isDuplicate(click_id) {
  const { rows } = await db.query(
    'SELECT id FROM conversions WHERE click_id = $1',
    [click_id]
  );
  return rows.length > 0;
}

async function storeConversion({ click_id, payout }) {
  const { rows } = await db.query(
    `INSERT INTO conversions (click_id, payout)
     VALUES ($1, $2) RETURNING *`,
    [click_id, parseFloat(payout) || 0]
  );
  return rows[0];
}

async function processPostback({ click_id, payout }) {
  // 1. Validate click exists
  const click = await getClickById(click_id);
  if (!click) {
    return { ok: false, reason: 'click_not_found' };
  }

  // 2. Prevent duplicate conversions
  const dup = await isDuplicate(click_id);
  if (dup) {
    return { ok: false, reason: 'duplicate' };
  }

  // 3. Store conversion
  const conversion = await storeConversion({ click_id, payout });
  return { ok: true, conversion };
}

async function getAll() {
  const { rows } = await db.query(`
    SELECT
      cv.*,
      ck.gclid,
      ck.keyword_id,
      ck.campaign_id,
      ck.device,
      ck.created_at AS click_time
    FROM conversions cv
    JOIN clicks ck ON cv.click_id = ck.click_id
    ORDER BY cv.created_at DESC
  `);
  return rows;
}

module.exports = { processPostback, storeConversion, isDuplicate, getAll };