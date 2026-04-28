const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/login',  ctrl.login);
router.get('/logout',  ctrl.logout);
router.get('/me',      requireAuth, ctrl.me);

module.exports = router;