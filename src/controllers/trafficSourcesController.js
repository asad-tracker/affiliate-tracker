const svc = require('../services/trafficSourcesService');

async function getAll(req, res, next) {
  try {
    const data = await svc.getAll();
    res.json(data);
  } catch (err) { next(err); }
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
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const data = await svc.create({ name });
    res.status(201).json(data);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const data = await svc.update(req.params.id, { name });
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

module.exports = { getAll, getById, create, update, remove };