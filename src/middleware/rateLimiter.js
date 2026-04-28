const rateLimit = require('express-rate-limit');

const clickRateLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             120,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) => {
    res.status(429).send('Too many requests');
  },
});

const postbackRateLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             60,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) => {
    res.status(429).send('Too many requests');
  },
});

module.exports = { clickRateLimiter, postbackRateLimiter };