const db = require('../models/db');

async function getAll() {
  const { rows } = await db.query(
    'SELECT * FROM traffic_sources ORDER BY created_at DESC'
  );
  return rows;
}

async function getById(id) {
  const { rows } = await db.query(
    'SELECT * FROM traffic_sources WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create({ name }) {
  const { rows } = await db.query(
    'INSERT INTO traffic_sources (name) VALUES ($1) RETURNING *',
    [name]
  );
  return rows[0];
}

async function update(id, { name }) {
  const { rows } = await db.query(
    'UPDATE traffic_sources SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await db.query(
    'DELETE FROM traffic_sources WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { getAll, getById, create, update, remove };