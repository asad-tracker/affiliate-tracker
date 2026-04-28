require('dotenv').config();
const db = require('./db');

async function seed() {
  console.log('Seeding...');

  await db.query(`
    INSERT INTO traffic_sources (name) VALUES
      ('Google Ads'),
      ('Facebook Ads'),
      ('TikTok Ads')
    ON CONFLICT DO NOTHING;
  `);

  await db.query(`
    INSERT INTO affiliate_networks (name, postback_url_template, click_id_param, payout_param) VALUES
      ('MaxBounty',   'https://maxbounty.com/postback?cid={click_id}&payout={payout}', 'cid',      'payout'),
      ('ClickBank',   'https://clickbank.com/pb?tid={click_id}&amount={payout}',       'tid',      'amount'),
      ('CJ Affiliate','https://cj.com/track?clickid={click_id}&revenue={payout}',      'clickid',  'revenue')
    ON CONFLICT DO NOTHING;
  `);

  await db.query(`
    INSERT INTO landers (name, url) VALUES
      ('Weight Loss LP',   'https://mylander.com/weight-loss'),
      ('Finance Offer LP', 'https://mylander.com/finance'),
      ('No Lander',        'https://mylander.com/direct')
    ON CONFLICT DO NOTHING;
  `);

  await db.query(`
    INSERT INTO offers (name, base_url, affiliate_network_id)
    SELECT 'Keto Diet Offer', 'https://network.com/offer?aff_id=123', id
    FROM affiliate_networks WHERE name = 'MaxBounty'
    LIMIT 1
    ON CONFLICT DO NOTHING;
  `);

  console.log('Seed done.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});