const router = require('express').Router();
const ctrl   = require('../controllers/offersController');
const { validateId } = require('../middleware/validate');

router.get('/',            ctrl.getAll);
router.get('/:id',         validateId, ctrl.getById);
router.get('/:id/preview', validateId, ctrl.previewUrl);
router.post('/',           ctrl.create);
router.put('/:id',         validateId, ctrl.update);
router.delete('/:id',      validateId, ctrl.remove);

module.exports = router;