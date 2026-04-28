const { verifyToken, COOKIE_NAME } = require('../services/authService');

// Protect API routes — return 401 if not logged in
function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME] ||
                req.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.user = decoded;
  next();
}

// Protect HTML pages — redirect to login if not logged in
function requireAuthPage(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.redirect('/login');
  }

  req.user = decoded;
  next();
}

// If already logged in redirect away from login page
function redirectIfLoggedIn(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token && verifyToken(token)) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { requireAuth, requireAuthPage, redirectIfLoggedIn };