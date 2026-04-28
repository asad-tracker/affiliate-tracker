const express      = require('express');
const helmet       = require('helmet');
const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { geoIp }    = require('./middleware/geoIp');
const { securityHeaders }   = require('./middleware/securityHeaders');
const { sanitizeRequest }   = require('./middleware/validate');
const { clickRateLimiter, postbackRateLimiter } = require('./middleware/rateLimiter');

const trafficSourcesRouter    = require('./routes/trafficSources');
const affiliateNetworksRouter = require('./routes/affiliateNetworks');
const landersRouter           = require('./routes/landers');
const offersRouter            = require('./routes/offers');
const campaignsRouter         = require('./routes/campaigns');
const campaignPathsRouter     = require('./routes/campaignPaths');
const trackingLinksRouter     = require('./routes/trackingLinks');
const clicksRouter            = require('./routes/clicks');
const postbackRouter          = require('./routes/postback');
const reportsRouter           = require('./routes/reports');
const exportRouter            = require('./routes/export');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:              ["'self'"],
      scriptSrc:               ["'self'"],
      objectSrc:               ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge:            31536000,
    includeSubDomains: true,
    preload:           true,
  },
}));

app.use(logger);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(geoIp);
app.use(securityHeaders);
app.use(sanitizeRequest);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use('/api/traffic-sources',    trafficSourcesRouter);
app.use('/api/affiliate-networks', affiliateNetworksRouter);
app.use('/api/landers',            landersRouter);
app.use('/api/offers',             offersRouter);
app.use('/api/campaigns',          campaignsRouter);
app.use('/api/campaign-paths',     campaignPathsRouter);
app.use('/api/tracking-links',     trackingLinksRouter);

app.use('/click',    clickRateLimiter,    clicksRouter);
app.use('/postback', postbackRateLimiter, postbackRouter);

app.use('/reports', reportsRouter);
app.use('/export',  exportRouter);

app.use(errorHandler);

module.exports = app;