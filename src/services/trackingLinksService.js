const db   = require('../models/db');
const { generateSlug } = require('../utils/slug');
const { cacheGet, cacheSet, cacheDel } = require('../models/redis');

async function getAll() {
  const { rows } = await db.query(`
    SELECT tl.*, c.name AS campaign_name
    FROM tracking_links tl
    LEFT JOIN campaigns c ON tl.campaign_id = c.id
    ORDER BY tl.created_at DESC
  `);
  return rows;
}

async function getById(id) {
  const { rows } = await db.query(
    'SELECT * FROM tracking_links WHERE id = $1', [id]
  );
  return rows[0] || null;
}

// Replace the existing getBySlug function with this:
async function getBySlug(slug) {
  const cacheKey = `slug:${slug}`;

  // 1. Try cache first
  const cached = await cacheGet(cacheKey);
  if (cached) {
    console.log(`[cache hit] slug:${slug}`);
    return cached;
  }

  // 2. Miss — hit DB
  const { rows } = await db.query(
    'SELECT * FROM tracking_links WHERE slug = $1', [slug]
  );
  const link = rows[0] || null;

  // 3. Store in cache for next request
  if (link) await cacheSet(cacheKey, link);

  return link;
}
async function create(campaign_id) {
  const slug = generateSlug();
  const { rows } = await db.query(
    `INSERT INTO tracking_links (campaign_id, slug)
     VALUES ($1, $2) RETURNING *`,
    [campaign_id, slug]
  );
  return rows[0];
}

async function remove(id) {
  // Get the slug before deleting so we can bust the cache
  const { rows: existing } = await db.query(
    'SELECT slug FROM tracking_links WHERE id = $1', [id]
  );

  const { rowCount } = await db.query(
    'DELETE FROM tracking_links WHERE id = $1', [id]
  );

  if (rowCount > 0 && existing[0]) {
    await cacheDel(`slug:${existing[0].slug}`);
  }

  return rowCount > 0;
}
// Build the full clickable tracking URL
function buildTrackingUrl(slug) {
  const base = process.env.BASE_DOMAIN || 'http://localhost:3000';
  return `${base}/click/${slug}`;
}

module.exports = { getAll, getById, getBySlug, create, remove, buildTrackingUrl };