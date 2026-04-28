const db = require('../models/db');

// Check if this IP already clicked this tracking link recently
// Default window: 30 seconds
async function isDuplicateClick(tracking_link_id, ip, windowSeconds = 30) {
  const { rows } = await db.query(`
    SELECT id FROM clicks
    WHERE tracking_link_id = $1
      AND ip = $2
      AND created_at > NOW() - INTERVAL '${parseInt(windowSeconds)} seconds'
    LIMIT 1
  `, [tracking_link_id, ip]);

  return rows.length > 0;
}

module.exports = { isDuplicateClick };