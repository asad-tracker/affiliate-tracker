const router   = require('express').Router();
const { handleClick } = require('../controllers/clicksController');
const db       = require('../models/db');
const { requireAuth } = require('../middleware/auth');

// Debug endpoint — get recent click_ids for testing
router.get('/debug/recent', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT click_id, gclid, keyword_id, created_at FROM clicks ORDER BY created_at DESC LIMIT 10'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public click tracking endpoint
router.get('/:slug', handleClick);

module.exports = router;