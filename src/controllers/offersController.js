const svc = require('../services/offersService');

async function getAll(req, res, next) {
  try { res.json(await svc.getAll()); }
  catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const data = await svc.getById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, base_url, affiliate_network_id } = req.body;
    if (!name || !base_url) return res.status(400).json({ error: 'name and base_url are required' });
    res.status(201).json(await svc.create({ name, base_url, affiliate_network_id }));
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

// Preview what the final offer URL will look like with a real click_id
async function previewUrl(req, res, next) {
  try {
    const offer = await svc.getById(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Not found' });
    const clickId = req.query.click_id || 'PREVIEW_ID';
    const url = svc.buildOfferUrl(offer.base_url, clickId, offer.click_id_param || 'click_id');
    res.json({ original: offer.base_url, built_url: url, click_id_used: clickId });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove, previewUrl };