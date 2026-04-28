const router = require('express').Router();
const { googleAdsCsv } = require('../controllers/exportController');

// GET /export/google-ads-csv?from=2026-01-01&to=2026-12-31
router.get('/google-ads-csv', googleAdsCsv);

module.exports = router;