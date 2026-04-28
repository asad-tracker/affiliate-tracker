require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.RAILWAY_DB,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  console.log('Seeding Railway DB...');

  await pool.query(`
    INSERT INTO traffic_sources (name) VALUES
      ('Google Ads'), ('Facebook Ads'), ('TikTok Ads')
    ON CONFLICT DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO affiliate_networks
      (name, postback_url_template, click_id_param, payout_param)
    VALUES
      ('MaxBounty', 'https://maxbounty.com/postback?cid={click_id}&payout={payout}', 'cid', 'payout'),
      ('ClickBank', 'https://clickbank.com/pb?tid={click_id}&amount={payout}', 'tid', 'amount')
    ON CONFLICT DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO landers (name, url) VALUES
      ('Keto LP', 'https://mylander.com/keto'),
      ('Finance LP', 'https://mylander.com/finance')
    ON CONFLICT DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO offers (name, base_url, affiliate_network_id)
    SELECT 'Keto Offer', 'https://network.com/offer?aff_id=123', id
    FROM affiliate_networks WHERE name = 'MaxBounty' LIMIT 1
    ON CONFLICT DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO campaigns (name, traffic_source_id, country)
    SELECT 'Google Keto Campaign', id, 'US'
    FROM traffic_sources WHERE name = 'Google Ads' LIMIT 1
    ON CONFLICT DO NOTHING;
  `);

  console.log('Done.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});