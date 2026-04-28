const router = require('express').Router();
const { handlePostback } = require('../controllers/postbackController');

// Affiliate networks fire GET postbacks
router.get('/', handlePostback);

// Some networks use POST
router.post('/', handlePostback);

module.exports = router;    