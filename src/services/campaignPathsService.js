const db = require('../models/db');
const { cacheGet, cacheSet, cacheDel } = require('../models/redis');

async function getPathsByCampaign(campaign_id) {
  const cacheKey = `paths:${campaign_id}`;

  const cached = await cacheGet(cacheKey);
  if (cached) {
    console.log(`[cache hit] paths:${campaign_id}`);
    return cached;
  }

  const { rows } = await db.query(`
    SELECT
      cp.*,
      l.url  AS lander_url,
      l.name AS lander_name,
      o.name AS offer_name,
      o.base_url AS offer_base_url,
      an.click_id_param
    FROM campaign_paths cp
    LEFT JOIN landers  l  ON cp.lander_id = l.id
    LEFT JOIN offers   o  ON cp.offer_id  = o.id
    LEFT JOIN affiliate_networks an ON o.affiliate_network_id = an.id
    WHERE cp.campaign_id = $1
    ORDER BY cp.weight DESC
  `, [campaign_id]);

  if (rows.length > 0) await cacheSet(cacheKey, rows);

  return rows;
}

async function getById(id) {
  const { rows } = await db.query(
    'SELECT * FROM campaign_paths WHERE id = $1', [id]
  );
  return rows[0] || null;
}

async function create({ campaign_id, lander_id, offer_id, weight }) {
  const { rows } = await db.query(
    `INSERT INTO campaign_paths (campaign_id, lander_id, offer_id, weight)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [campaign_id, lander_id || null, offer_id, weight ?? 100]
  );
  await cacheDel(`paths:${campaign_id}`);
  return rows[0];
}

async function update(id, { lander_id, offer_id, weight }) {
  const { rows } = await db.query(
    `UPDATE campaign_paths
     SET lander_id = COALESCE($1, lander_id),
         offer_id  = COALESCE($2, offer_id),
         weight    = COALESCE($3, weight)
     WHERE id = $4 RETURNING *`,
    [lander_id, offer_id, weight, id]
  );
  if (rows[0]) await cacheDel(`paths:${rows[0].campaign_id}`);
  return rows[0] || null;
}

async function remove(id) {
  // Fetch campaign_id before delete for cache bust
  const { rows: existing } = await db.query(
    'SELECT campaign_id FROM campaign_paths WHERE id = $1', [id]
  );
  const { rowCount } = await db.query(
    'DELETE FROM campaign_paths WHERE id = $1', [id]
  );
  if (rowCount > 0 && existing[0]) {
    await cacheDel(`paths:${existing[0].campaign_id}`);
  }
  return rowCount > 0;
}

// ---------------------------------------------------
// Weighted random path picker
// e.g. paths with weights [100, 50, 50] → 50% / 25% / 25%
// ---------------------------------------------------
function pickWeightedPath(paths) {
  if (!paths || paths.length === 0) return null;

  const totalWeight = paths.reduce((sum, p) => sum + (p.weight || 100), 0);
  let random = Math.random() * totalWeight;

  for (const path of paths) {
    random -= (path.weight || 100);
    if (random <= 0) return path;
  }

  return paths[paths.length - 1];
}

async function selectPathForCampaign(campaign_id) {
  const paths = await getPathsByCampaign(campaign_id);
  return pickWeightedPath(paths);
}

module.exports = {
  getPathsByCampaign,
  getById,
  create,
  update,
  remove,
  pickWeightedPath,
  selectPathForCampaign,
};