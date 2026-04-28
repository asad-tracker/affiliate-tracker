function securityHeaders(req, res, next) {
  if (req.path.startsWith('/click') || req.path.startsWith('/postback')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  res.removeHeader('X-Powered-By');
  next();
}

module.exports = { securityHeaders };