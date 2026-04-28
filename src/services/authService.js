const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const USERNAME      = process.env.ADMIN_USERNAME      || 'admin';
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const JWT_SECRET    = process.env.JWT_SECRET          || 'changeme';
const JWT_EXPIRES   = process.env.JWT_EXPIRES_IN      || '7d';
const COOKIE_NAME   = process.env.COOKIE_NAME         || 'tracker_session';

async function verifyCredentials(username, password) {
  if (username !== USERNAME) return false;
  return bcrypt.compare(password, PASSWORD_HASH);
}

function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { verifyCredentials, generateToken, verifyToken, COOKIE_NAME };