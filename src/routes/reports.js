const router = require('express').Router();
const ctrl   = require('../controllers/reportsController');

// GET /reports/keywords?from=2026-01-01&to=2026-12-31
router.get('/keywords',  ctrl.keywords);

// GET /reports/campaigns?from=2026-01-01&to=2026-12-31
router.get('/campaigns', ctrl.campaigns);

module.exports = router;