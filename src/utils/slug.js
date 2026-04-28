const { v4: uuidv4 } = require('uuid');

function generateSlug() {
  return uuidv4().replace(/-/g, '').slice(0, 12);
}

function generateClickId() {
  return uuidv4().replace(/-/g, '');
}

module.exports = { generateSlug, generateClickId };