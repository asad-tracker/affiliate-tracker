const svc = require('../services/campaignPathsService');

async function getForCampaign(req, res, next) {
  try {
    res.json(await svc.getPathsByCampaign(req.params.campaign_id));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { campaign_id, lander_id, offer_id, weight } = req.body;
    if (!campaign_id || !offer_id)
      return res.status(400).json({ error: 'campaign_id and offer_id are required' });
    res.status(201).json(await svc.create({ campaign_id, lander_id, offer_id, weight }));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const data = await svc.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const ok = await svc.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
}

// Debug endpoint — shows which path would be picked right now
async function previewPick(req, res, next) {
  try {
    const path = await svc.selectPathForCampaign(req.params.campaign_id);
    if (!path) return res.status(404).json({ error: 'No paths configured for this campaign' });
    res.json({
      picked_path:  path,
      has_lander:   !!path.lander_id,
      flow:         path.lander_id ? 'click → lander → offer' : 'click → offer (direct)',
    });
  } catch (err) { next(err); }
}

module.exports = { getForCampaign, create, update, remove, previewPick };