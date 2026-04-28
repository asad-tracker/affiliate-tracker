const express      = require('express');
const helmet       = require('helmet');
const path         = require('path');
const cookieParser = require('cookie-parser');
const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { geoIp }    = require('./middleware/geoIp');
const { securityHeaders }   = require('./middleware/securityHeaders');
const { sanitizeRequest }   = require('./middleware/validate');
const { clickRateLimiter, postbackRateLimiter } = require('./middleware/rateLimiter');
const { requireAuth, requireAuthPage, redirectIfLoggedIn } = require('./middleware/auth');

const authRouter              = require('./routes/auth');
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
      scriptSrc:               ["'self'", "'unsafe-inline'"],
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
app.use(cookieParser());
app.use(geoIp);
app.use(securityHeaders);
app.use(sanitizeRequest);
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Auth
app.use('/auth', authRouter);

// Pages
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/login', redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
app.get('/dashboard', requireAuthPage, (req, res) => {
  res.send(`
    <html>
      <body style="background:#0f1117;color:#e2e8f0;font-family:sans-serif;padding:40px;">
        <h1 style="color:#a78bfa">Dashboard coming soon</h1>
        <p>You are logged in. Full dashboard coming next.</p>
        <a href="/auth/logout" style="color:#a78bfa">Logout</a>
      </body>
    </html>
  `);
});

// Protected API routes
app.use('/api/traffic-sources',    requireAuth, trafficSourcesRouter);
app.use('/api/affiliate-networks', requireAuth, affiliateNetworksRouter);
app.use('/api/landers',            requireAuth, landersRouter);
app.use('/api/offers',             requireAuth, offersRouter);
app.use('/api/campaigns',          requireAuth, campaignsRouter);
app.use('/api/campaign-paths',     requireAuth, campaignPathsRouter);
app.use('/api/tracking-links',     requireAuth, trackingLinksRouter);
app.use('/reports',                requireAuth, reportsRouter);
app.use('/export',                 requireAuth, exportRouter);

// Public tracking endpoints
app.use('/click',    clickRateLimiter,    clicksRouter);
app.use('/postback', postbackRateLimiter, postbackRouter);

app.use(errorHandler);

module.exports = app;