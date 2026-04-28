const db = require('../models/db');
const { replaceTokens } = require('../utils/tokens');

async function getAll() {
  const { rows } = await db.query(`
    SELECT o.*, an.name AS network_name
    FROM offers o
    LEFT JOIN affiliate_networks an ON o.affiliate_network_id = an.id
    ORDER BY o.created_at DESC
  `);
  return rows;
}

async function getById(id) {
  const { rows } = await db.query(`
    SELECT o.*, an.name AS network_name, an.click_id_param
    FROM offers o
    LEFT JOIN affiliate_networks an ON o.affiliate_network_id = an.id
    WHERE o.id = $1
  `, [id]);
  return rows[0] || null;
}

async function create({ name, base_url, affiliate_network_id }) {
  const { rows } = await db.query(
    `INSERT INTO offers (name, base_url, affiliate_network_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, base_url, affiliate_network_id || null]
  );
  return rows[0];
}

async function update(id, { name, base_url, affiliate_network_id }) {
  const { rows } = await db.query(
    `UPDATE offers
     SET name                 = COALESCE($1, name),
         base_url             = COALESCE($2, base_url),
         affiliate_network_id = COALESCE($3, affiliate_network_id)
     WHERE id = $4 RETURNING *`,
    [name, base_url, affiliate_network_id, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await db.query('DELETE FROM offers WHERE id = $1', [id]);
  return rowCount > 0;
}

// Core utility — append click_id dynamically to the offer URL
function buildOfferUrl(baseUrl, clickId, clickIdParam = 'click_id') {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${clickIdParam}=${clickId}`;
}

module.exports = { getAll, getById, create, update, remove, buildOfferUrl };