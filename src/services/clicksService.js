const db                        = require('../models/db');
const { generateClickId }       = require('../utils/slug');
const { buildOfferUrl }         = require('./offersService');
const { selectPathForCampaign } = require('./campaignPathsService');
const { getBySlug }             = require('./trackingLinksService');
const { isBot, isSuspiciousIp } = require('../utils/botDetector');
const { isDuplicateClick }      = require('../utils/clickDedup');
const { sanitize, isValidSlug } = require('../utils/validate');

async function storeClick({
  click_id,
  tracking_link_id,
  campaign_id,
  gclid,
  keyword_id,
  matchtype,
  device,
  adid,
  ip,
  user_agent,
  country,
}) {
  const { rows } = await db.query(
    `INSERT INTO clicks
       (click_id, tracking_link_id, campaign_id,
        gclid, keyword_id, matchtype, device, adid,
        ip, user_agent, country)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      click_id, tracking_link_id, campaign_id,
      gclid      || null,
      keyword_id || null,
      matchtype  || null,
      device     || null,
      adid       || null,
      ip,
      user_agent || null,
      country    || null,
    ]
  );
  return rows[0];
}

async function getClickById(click_id) {
  const { rows } = await db.query(
    'SELECT * FROM clicks WHERE click_id = $1',
    [click_id]
  );
  return rows[0] || null;
}

async function resolveClick(slug, queryParams, ip, userAgent) {
  // 1. Validate slug format
  if (!isValidSlug(slug)) {
    return { error: 'invalid_slug' };
  }

  // 2. Bot detection
  if (isBot(userAgent)) {
    return { error: 'bot_detected' };
  }

  // 3. Find tracking link
  const trackingLink = await getBySlug(slug);
  if (!trackingLink) {
    return { error: 'slug_not_found' };
  }

  // 4. Duplicate click check — same IP within 30 seconds
  const isDup = await isDuplicateClick(trackingLink.id, ip, 30);
  if (isDup) {
    return { error: 'duplicate_click' };
  }

  // 5. Pick weighted path
  const path = await selectPathForCampaign(trackingLink.campaign_id);
  if (!path) {
    return { error: 'no_paths' };
  }

  // 6. Generate unique click_id
  const click_id = generateClickId();

  // 7. Sanitize all query params before storing
  await storeClick({
    click_id,
    tracking_link_id: trackingLink.id,
    campaign_id:      trackingLink.campaign_id,
    gclid:      sanitize(queryParams.gclid,     100),
    keyword_id: sanitize(queryParams.kwid,      100),
    matchtype:  sanitize(queryParams.matchtype,  20),
    device:     sanitize(queryParams.device,     20),
    adid:       sanitize(queryParams.adid,      100),
    ip,
    user_agent: userAgent,
    country:    sanitize(queryParams.country,    10),
  });

  // 8. Build redirect URL
  let redirectUrl;
  if (path.lander_id && path.lander_url) {
    const sep = path.lander_url.includes('?') ? '&' : '?';
    redirectUrl = `${path.lander_url}${sep}click_id=${click_id}`;
  } else {
    redirectUrl = buildOfferUrl(
      path.offer_base_url,
      click_id,
      path.click_id_param || 'click_id'
    );
  }

  return { click_id, redirectUrl, path };
}

module.exports = { storeClick, getClickById, resolveClick };