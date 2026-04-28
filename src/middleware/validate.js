const { sanitize, isValidUuid } = require('../utils/validate');

function sanitizeBody(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      clean[key] = sanitize(val);
    } else if (typeof val === 'number') {
      clean[key] = val;
    } else if (typeof val === 'object') {
      clean[key] = sanitizeBody(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

function sanitizeRequest(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    req.body = sanitizeBody(req.body);
  }
  next();
}

function validateUuidParam(req, res, next) {
  for (const [key, val] of Object.entries(req.params)) {
    if (key === 'id' || key.endsWith('_id')) {
      if (val && !isValidUuid(val)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
    }
  }
  next();
}

function validateId(req, res, next) {
  const id = req.params.id;
  if (id && !isValidUuid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
}

module.exports = { sanitizeRequest, validateUuidParam, validateId };