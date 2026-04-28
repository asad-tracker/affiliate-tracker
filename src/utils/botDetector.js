// Common bot/crawler user agent patterns
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /ia_archiver/i,
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /axios/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /headlesschrome/i,
  /phantomjs/i,
];

function isBot(userAgent) {
  if (!userAgent || userAgent === 'unknown') return true;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

// Validate that IP is real and not a loopback in production
function isSuspiciousIp(ip) {
  if (!ip || ip === 'unknown') return true;
  if (process.env.NODE_ENV === 'production') {
    if (ip === '127.0.0.1' || ip === '::1') return true;
  }
  return false;
}

module.exports = { isBot, isSuspiciousIp };