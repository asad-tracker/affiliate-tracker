const router = require('express').Router();
const ctrl   = require('../controllers/campaignPathsController');
const { validateId } = require('../middleware/validate');

router.get('/campaign/:campaign_id',         ctrl.getForCampaign);
router.get('/campaign/:campaign_id/preview', ctrl.previewPick);
router.post('/',      ctrl.create);
router.put('/:id',    validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

module.exports = router;