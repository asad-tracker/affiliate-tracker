const { processPostback }      = require('../services/conversionsService');
const { isValidPayout, sanitize } = require('../utils/validate');

async function handlePostback(req, res, next) {
  try {
    const click_id = sanitize(req.query.click_id || req.body?.click_id, 64);
    const payout   = req.query.payout || req.body?.payout || 0;

    // Validate click_id exists
    if (!click_id) {
      return res.status(400).send('missing click_id');
    }

    // Validate click_id length — must be 32 chars (our generated format)
    if (click_id.length !== 32) {
      return res.status(400).send('invalid click_id');
    }

    // Validate payout
    if (!isValidPayout(payout)) {
      return res.status(400).send('invalid payout');
    }

    const result = await processPostback({ click_id, payout });

    if (!result.ok) {
      if (result.reason === 'click_not_found') {
        return res.status(404).send('click_not_found');
      }
      if (result.reason === 'duplicate') {
        return res.status(200).send('OK');
      }
    }

    return res.status(200).send('OK');

  } catch (err) {
    next(err);
  }
}

module.exports = { handlePostback };