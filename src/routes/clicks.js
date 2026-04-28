const router = require('express').Router();
const { handleClick } = require('../controllers/clicksController');

// This is the public-facing tracking endpoint
// Example: GET /click/a3f9c12b8d01?gclid=Cj0K&kwid=keto&matchtype=e&device=mobile
router.get('/:slug', handleClick);

module.exports = router;