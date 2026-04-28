// Extracts real IP from common proxy headers
// Works with Cloudflare, AWS ELB, Nginx, local dev
function extractIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||        // Cloudflare
    req.headers['x-real-ip'] ||               // Nginx
    req.headers['x-forwarded-for']
      ?.split(',')[0].trim() ||               // Load balancers
    req.socket.remoteAddress ||
    'unknown'
  );
}

function extractUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

// Lightweight device detection from user-agent
function detectDevice(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/.test(ua)) return 'mobile';
  return 'desktop';
}

function geoIp(req, res, next) {
  req.clientIp      = extractIp(req);
  req.clientUa      = extractUserAgent(req);
  req.clientDevice  = req.query.device || detectDevice(req.headers['user-agent'] || '');
  next();
}

module.exports = { geoIp, extractIp, extractUserAgent, detectDevice };