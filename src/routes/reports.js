const router = require('express').Router();
const ctrl   = require('../controllers/reportsController');

router.get('/keywords',  ctrl.keywords);
router.get('/campaigns', ctrl.campaigns);
router.get('/daily',     ctrl.daily);

module.exports = router;