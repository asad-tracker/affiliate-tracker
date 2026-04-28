const db = require('../models/db');

async function getAll() {
  const { rows } = await db.query('SELECT * FROM landers ORDER BY created_at DESC');
  return rows;
}

async function getById(id) {
  const { rows } = await db.query('SELECT * FROM landers WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name, url }) {
  const { rows } = await db.query(
    'INSERT INTO landers (name, url) VALUES ($1, $2) RETURNING *',
    [name, url]
  );
  return rows[0];
}

async function update(id, { name, url }) {
  const { rows } = await db.query(
    `UPDATE landers
     SET name = COALESCE($1, name),
         url  = COALESCE($2, url)
     WHERE id = $3 RETURNING *`,
    [name, url, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await db.query('DELETE FROM landers WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { getAll, getById, create, update, remove };