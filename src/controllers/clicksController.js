const { resolveClick } = require('../services/clicksService');

// Fallback URLs for different error types
// In production point these to a real page
const FALLBACK_URL = process.env.FALLBACK_URL || 'https://example.com';

async function handleClick(req, res, next) {
  try {
    const { slug } = req.params;
    const ip        = req.clientIp  || 'unknown';
    const userAgent = req.clientUa  || '';

    const result = await resolveClick(slug, req.query, ip, userAgent);

    // Handle all error cases
    if (result.error) {
      switch (result.error) {
        case 'invalid_slug':
          return res.status(400).send('Invalid tracking link.');

        case 'bot_detected':
          // Don't reveal bot detection — just redirect to fallback
          return res.redirect(302, FALLBACK_URL);

        case 'slug_not_found':
          return res.status(404).send('Tracking link not found.');

        case 'duplicate_click':
          // Silent redirect — user sees normal experience
          // but we don't double-count the click
          return res.redirect(302, FALLBACK_URL);

        case 'no_paths':
          return res.status(404).send('No offers configured for this campaign.');

        default:
          return res.status(500).send('Something went wrong.');
      }
    }

    return res.redirect(302, result.redirectUrl);

  } catch (err) {
    next(err);
  }
}

module.exports = { handleClick };