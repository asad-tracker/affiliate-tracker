const db = require('../models/db');

async function getAll() {
  const { rows } = await db.query(`
    SELECT c.*, ts.name AS traffic_source_name
    FROM campaigns c
    LEFT JOIN traffic_sources ts ON c.traffic_source_id = ts.id
    ORDER BY c.created_at DESC
  `);
  return rows;
}

async function getById(id) {
  const { rows } = await db.query(`
    SELECT c.*, ts.name AS traffic_source_name
    FROM campaigns c
    LEFT JOIN traffic_sources ts ON c.traffic_source_id = ts.id
    WHERE c.id = $1
  `, [id]);
  return rows[0] || null;
}

async function create({ name, traffic_source_id, country }) {
  const { rows } = await db.query(
    `INSERT INTO campaigns (name, traffic_source_id, country)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, traffic_source_id || null, country || null]
  );
  return rows[0];
}

async function update(id, { name, traffic_source_id, country }) {
  const { rows } = await db.query(
    `UPDATE campaigns
     SET name              = COALESCE($1, name),
         traffic_source_id = COALESCE($2, traffic_source_id),
         country           = COALESCE($3, country)
     WHERE id = $4 RETURNING *`,
    [name, traffic_source_id, country, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await db.query(
    'DELETE FROM campaigns WHERE id = $1', [id]
  );
  return rowCount > 0;
}

module.exports = { getAll, getById, create, update, remove };