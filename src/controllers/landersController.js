const svc = require('../services/landersService');

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
    const { name, url } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'name and url are required' });
    res.status(201).json(await svc.create({ name, url }));
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

module.exports = { getAll, getById, create, update, remove };