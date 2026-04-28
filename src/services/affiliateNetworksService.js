const db = require('../models/db');

async function getAll() {
  const { rows } = await db.query(
    'SELECT * FROM affiliate_networks ORDER BY created_at DESC'
  );
  return rows;
}

async function getById(id) {
  const { rows } = await db.query(
    'SELECT * FROM affiliate_networks WHERE id = $1', [id]
  );
  return rows[0] || null;
}

async function create({ name, postback_url_template, click_id_param, payout_param }) {
  const { rows } = await db.query(
    `INSERT INTO affiliate_networks
       (name, postback_url_template, click_id_param, payout_param)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, postback_url_template, click_id_param || 'click_id', payout_param || 'payout']
  );
  return rows[0];
}

async function update(id, { name, postback_url_template, click_id_param, payout_param }) {
  const { rows } = await db.query(
    `UPDATE affiliate_networks
     SET name = COALESCE($1, name),
         postback_url_template = COALESCE($2, postback_url_template),
         click_id_param = COALESCE($3, click_id_param),
         payout_param   = COALESCE($4, payout_param)
     WHERE id = $5 RETURNING *`,
    [name, postback_url_template, click_id_param, payout_param, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await db.query(
    'DELETE FROM affiliate_networks WHERE id = $1', [id]
  );
  return rowCount > 0;
}

module.exports = { getAll, getById, create, update, remove };