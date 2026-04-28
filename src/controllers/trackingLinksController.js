const svc         = require('../services/trackingLinksService');
const campaignSvc = require('../services/campaignsService');

async function getAll(req, res, next) {
  try { res.json(await svc.getAll()); }
  catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { campaign_id } = req.body;
    if (!campaign_id)
      return res.status(400).json({ error: 'campaign_id is required' });

    const campaign = await campaignSvc.getById(campaign_id);
    if (!campaign)
      return res.status(404).json({ error: 'Campaign not found' });

    const link = await svc.create(campaign_id);
    res.status(201).json({
      ...link,
      tracking_url: svc.buildTrackingUrl(link.slug),
    });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const ok = await svc.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
}

module.exports = { getAll, create, remove };