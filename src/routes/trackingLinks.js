const router = require('express').Router();
const ctrl   = require('../controllers/trackingLinksController');
const { validateId } = require('../middleware/validate');

router.get('/',       ctrl.getAll);
router.post('/',      ctrl.create);
router.delete('/:id', validateId, ctrl.remove);

module.exports = router;