/**
 * Betza API Server
 *
 * Backend-for-Frontend (BFF) server for the Betza betting/prediction application.
 * Serves tournament data from Google Sheets via REST API endpoints.
 *
 * @author Betza Team
 * @version 1.0.0
 *
 * @requires dotenv - Environment variable management
 * @requires express - Web framework
 * @requires express-session - Server-managed session cookies
 * @requires cors - Cross-origin resource sharing (localhost only)
 * @requires google-spreadsheet - Google Sheets integration
 *
 * Environment Variables (Google Sheets):
 * - GOOGLE_SPREADSHEET: Google Sheet document ID
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email for Sheets API
 * - GOOGLE_PRIVATE_KEY: Private key for Sheets API authentication
 *
 * Environment Variables (OAuth / Auth):
 * - GOOGLE_OAUTH_CLIENT_ID: OAuth2 web-app client ID (Google Cloud Console)
 * - GOOGLE_OAUTH_CLIENT_SECRET: OAuth2 client secret
 * - SESSION_SECRET: Long random string used to sign the session cookie
 * - MOCK_USER_EMAIL: (dev only) When set and NODE_ENV != 'production', skips
 *                   OAuth and treats this email as the signed-in user.
 *
 * API Endpoints (public – no auth required):
 * - GET  /api/auth/login    - Redirect to Google OAuth2 consent screen
 * - GET  /api/auth/callback - Handle Google OAuth2 callback
 * - GET  /api/auth/session  - Return current session user (200 or 401)
 * - POST /api/auth/logout   - Destroy session
 *
 * API Endpoints (protected – session required):
 * - GET /api/me                - Get resolved participant profile
 * - GET /api/participants      - Get current tournament participants
 * - GET /api/alltimeparticipants - Get all-time participants across editions
 * - GET /api/editions          - Get available tournament editions
 * - GET /api/games             - Get tournament matches/games
 * - GET /api/results           - Get match results and predictions
 * - GET /api/prono             - Get prediction data
 * - GET /api/totals            - Get participant totals/scores
 * - GET /api/scores            - Get chart data for scores
 * - GET /api/chartData         - Alias for /api/scores
 * - GET /api/topChartData      - Get top 3 performers
 * - GET /api/lowestChartData   - Get bottom 3 performers
 *
 * CORS Configuration:
 * Enabled for localhost origins only (development). In production the
 * BFF pattern serves frontend and API from the same origin, so CORS
 * headers are not required.
 *
 * Usage:
 * npm start - Start the server
 * Server listens on PORT environment variable or 5000 by default
 */

import { pickHighest, pickLowest } from './modules/utils.js';
import { load, getDeelnemers, getWedstrijden, getPronos, getResults, getTotals, getGrafiekData, getAllDeelnemers, getEditions, getAuthUsers } from './modules/googlesheet.js';
import { getAuthorizationUrl, verifyGoogleCode } from './modules/auth.js';
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import cors from 'cors';
import crypto from 'crypto';

import { fileURLToPath } from 'url';

const requiredEnvVars = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_SPREADSHEET',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REDIRECT_URI',
  'SESSION_SECRET',
];

function validateEnvVar(name, value) {
  if (!value) {
    return 'missing';
  }

  if (name === 'GOOGLE_SERVICE_ACCOUNT_EMAIL') {
    return value.includes('@') ? 'present' : 'invalid';
  }

  if (name === 'GOOGLE_PRIVATE_KEY') {
    return value.includes('BEGIN PRIVATE KEY') ? 'present' : 'invalid';
  }

  if (name === 'GOOGLE_SPREADSHEET') {
    return value.length >= 20 ? 'present' : 'invalid';
  }

  if (name === 'SESSION_SECRET') {
    return value.length >= 32 ? 'present' : 'invalid (must be at least 32 characters)';
  }

  return 'present';
}

function validateStartupConfig() {
  const envSummary = requiredEnvVars.map((name) => {
    const value = process.env[name]?.trim() ?? '';
    const status = validateEnvVar(name, value);
    return { name, status };
  });

  const hasConfigErrors = envSummary.some((entry) => entry.status !== 'present');
  const summaryLines = [
    'Backend configuration summary:',
    ...envSummary.map((entry) => `- ${entry.name}: ${entry.status}`),
    `- PORT: ${process.env.PORT?.trim() || 'default (5000)'}`,
  ];

  if (hasConfigErrors) {
    console.error([
      'Backend startup aborted because required configuration is incomplete.',
      ...summaryLines,
    ].join('\n'));
    process.exit(1);
  }

  console.log(summaryLines.join('\n'));
}

validateStartupConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

function getPositiveIntEnv(name, fallback) {
  const value = process.env[name]?.trim();
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const apiRateLimitWindowMs = getPositiveIntEnv('API_RATE_LIMIT_WINDOW_MS', 60_000);
const apiRateLimitMaxRequests = getPositiveIntEnv('API_RATE_LIMIT_MAX_REQUESTS', 120);
const apiRateLimitBuckets = new Map();

function getRateLimitKey(req) {
  return (
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown-client'
  );
}

function apiRateLimiter(req, res, next) {
  const now = Date.now();
  const key = getRateLimitKey(req);
  let bucket = apiRateLimitBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + apiRateLimitWindowMs };
    apiRateLimitBuckets.set(key, bucket);
  }

  if (bucket.count >= apiRateLimitMaxRequests) {
    const retryAfterSeconds = Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1);
    res.setHeader('X-RateLimit-Limit', String(apiRateLimitMaxRequests));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ error: 'Too many API requests. Please try again later.' });
  }

  bucket.count += 1;

  const remaining = Math.max(apiRateLimitMaxRequests - bucket.count, 0);
  res.setHeader('X-RateLimit-Limit', String(apiRateLimitMaxRequests));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  return next();
}

const bucketCleanupInterval = getPositiveIntEnv('API_RATE_LIMIT_CLEANUP_INTERVAL_MS', 60_000);
setInterval(() => {
  const now = Date.now();
  apiRateLimitBuckets.forEach((bucket, key) => {
    if (now >= bucket.resetAt) {
      apiRateLimitBuckets.delete(key);
    }
  });
}, bucketCleanupInterval).unref();

// Stricter rate limiter applied only to auth endpoints:
// max 10 requests per 5 minutes per IP.
const authRateLimitWindowMs = 5 * 60_000;
const authRateLimitMaxRequests = 10;
const authRateLimitBuckets = new Map();

function authRateLimiter(req, res, next) {
  const now = Date.now();
  const key = getRateLimitKey(req);
  let bucket = authRateLimitBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + authRateLimitWindowMs };
    authRateLimitBuckets.set(key, bucket);
  }

  if (bucket.count >= authRateLimitMaxRequests) {
    const retryAfterSeconds = Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1);
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ error: 'Too many authentication attempts. Please try again later.' });
  }

  bucket.count += 1;
  return next();
}

setInterval(() => {
  const now = Date.now();
  authRateLimitBuckets.forEach((bucket, key) => {
    if (now >= bucket.resetAt) {
      authRateLimitBuckets.delete(key);
    }
  });
}, authRateLimitWindowMs).unref();

// Enable CORS for localhost origins only (development).
// In production the BFF pattern serves frontend and API from the same
// origin, so CORS headers are not required.
app.use(cors({
  origin(origin, callback) {
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

// Session middleware. Uses an in-memory store which is suitable for this
// small-team app. Sessions are scoped to the secure, HttpOnly cookie
// "__Host-session" and expire after 30 days.
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  name: '__Host-session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
}));

app.use(express.json());

app.use('/api', apiRateLimiter);

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------

/**
 * Resolves a Google-authenticated email to a known active participant.
 * Returns null when the email is not found or the account is inactive.
 *
 * @param {string} email  Normalized (lowercase, trimmed) email address.
 * @returns {Promise<object|null>}
 */
async function resolveParticipant(email) {
  const authUsers = await getAuthUsers();
  const row = authUsers.find(
    (u) => u.email?.trim().toLowerCase() === email,
  );
  if (!row) return null;
  const active = String(row.is_active ?? 'true').trim().toLowerCase();
  if (active === 'false' || active === '0') return null;
  return row;
}

/**
 * Express middleware that requires a valid authenticated session.
 * Returns 401 when the session has no user and 403 when the user is no
 * longer in the allow-list (e.g. deactivated between sessions).
 *
 * Dev bypass: when NODE_ENV !== 'production' and MOCK_USER_EMAIL is set,
 * the session user is populated automatically from that email address.
 */
async function requireAuth(req, res, next) {
  // ------------------------------------------------------------------
  // Dev bypass: skip OAuth when MOCK_USER_EMAIL is configured locally.
  // ------------------------------------------------------------------
  if (!isProduction && process.env.MOCK_USER_EMAIL && !req.session?.user) {
    const mockEmail = process.env.MOCK_USER_EMAIL.trim().toLowerCase();
    req.session.user = {naam:"Foo Bar",pictureID:"foobar",role:"participant",participantId:"foobar", email: mockEmail };
  }

  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }
  // Re-validate that the user is still active on every request.
  try {
    const participant = await resolveParticipant(req.session.user.email);
    if (!participant) {
      req.session.destroy(() => {});
      return res.status(403).json({ error: 'Access denied. Your account is not authorized.' });
    }
    req.participant = participant;
  } catch (err) {
    console.error('Auth user lookup failed:', err.message);
    return res.status(500).json({ error: 'Authentication check failed.' });
  }
  return next();
}

// ---------------------------------------------------------------------------
// Auth routes (no requireAuth)
// ---------------------------------------------------------------------------

/**
 * GET /api/auth/login
 * Redirects the browser to the Google OAuth2 consent screen.
 * A random state nonce is stored in the session to prevent CSRF.
 */
app.get('/api/auth/login', authRateLimiter, (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  req.session.save((err) => {
    if (err) {
      console.error('Session save error before OAuth redirect:', err);
      return res.status(500).json({ error: 'Could not initiate login.' });
    }
    res.redirect(getAuthorizationUrl(state));
  });
});

/**
 * GET /api/auth/callback
 * Handles the Google OAuth2 redirect. Verifies the state nonce, exchanges
 * the code for an ID token, validates the email against the allow-list,
 * and creates a session.
 */
app.get('/api/auth/callback', authRateLimiter, async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.warn('OAuth error from Google:', error);
    return res.redirect('/login?auth_error=oauth_denied');
  }

  // Validate CSRF state
  if (!state || state !== req.session.oauthState) {
    console.warn('OAuth state mismatch – possible CSRF attempt');
    return res.redirect('/login?auth_error=state_mismatch');
  }
  delete req.session.oauthState;

  try {
    const payload = await verifyGoogleCode(code);
    const email = payload.email?.trim().toLowerCase();
    if (!email) {
      return res.redirect('/login?auth_error=no_email');
    }

    const participant = await resolveParticipant(email);
    if (!participant) {
      console.warn(`Login denied for unknown or inactive email: ${email.replace(/@.+/, '@…')}`);
      return res.redirect('/login?auth_error=access_denied');
    }

    req.session.user = {
      email,
      name: payload.name,
      picture: payload.picture,
      participantId: participant.participant_id ?? participant.naam,
      naam: participant.naam,
      pictureID: participant.PictureID,
      role: participant.role ?? 'participant',
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error after login:', err);
        return res.redirect('/login?auth_error=session_error');
      }
      res.redirect('/');
    });
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.redirect('/login?auth_error=server_error');
  }
});

/**
 * GET /api/auth/session
 * Returns the current session user as JSON (200) or 401 when not logged in.
 * The frontend calls this on startup to restore auth state.
 */
app.get('/api/auth/session', (req, res) => {
  // Dev bypass: auto-populate session from MOCK_USER_EMAIL.
  if (!isProduction && process.env.MOCK_USER_EMAIL && !req.session?.user) {
    const mockEmail = process.env.MOCK_USER_EMAIL.trim().toLowerCase();
    req.session.user = { email: mockEmail, name: mockEmail, picture: null };
  }
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  res.json({ user: req.session.user });
});

/**
 * POST /api/auth/logout
 * Destroys the server session and clears the cookie.
 */
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    res.clearCookie('betza.sid');
    res.json({ ok: true });
  });
});

// ---------------------------------------------------------------------------
// Protected data routes
// ---------------------------------------------------------------------------

// Serve static files from the frontend build
app.use(express.static(path.join('./frontend/dist')));

/**
 * GET /api/me
 * Returns the resolved participant profile for the currently logged-in user.
 */
app.get('/api/me', requireAuth, (req, res) => {
  const { naam, pictureID, role, participantId } = req.session.user;
  res.json({ naam, pictureID, role, participantId });
});

app.get('/api/participants', requireAuth, async (req, res) => {
  return res.json(await getDeelnemers());
});

app.get('/api/alltimeparticipants', requireAuth, async (req, res) => {
  return res.json(await getAllDeelnemers());
});

app.get('/api/editions', requireAuth, async (req, res) => {
  return res.json(await getEditions());
});

app.get('/api/scores', requireAuth, async (req, res) => {

  res.json(await getGrafiekData());

});

app.get('/api/chartData', requireAuth, async (req, res) => {

  res.json(await getGrafiekData());

});


app.get('/api/totals', requireAuth, async (req, res) => {
  res.json(await getTotals());

});

app.get('/api/topChartData', requireAuth, async (req, res) => {

  await load();
  
  const sheet = doc.sheetsByTitle["resultaten"]; 

  const rows = await sheet.getRows();
  const labels = sheet.headerValues.slice(1,sheet.columnCount);
  var data = {};
  rows.forEach(e => {
    var scores=e._rawData.slice(1,sheet.columnCount).map(x => parseInt(x));
    data[e.Deelnemer]=scores.reduce((a, b) => a + b);
  });


  // Return them as json
  res.json(pickHighest(data, 3));

});

app.get('/api/lowestChartData', requireAuth, async (req, res) => {

  await load();
  
  const sheet = doc.sheetsByTitle["resultaten"]; 

  const rows = await sheet.getRows();
  const labels = sheet.headerValues.slice(1,sheet.columnCount);
  var data = {};
  rows.forEach(e => {
    var scores=e._rawData.slice(1,sheet.columnCount).map(x => parseInt(x));
    data[e.Deelnemer]=scores.reduce((a, b) => a + b);
  });

  // Return them as json
  res.json(pickLowest(data, 3));

});



app.get('/api/games', requireAuth, async (req, res) => {
  return res.json(await getWedstrijden());
});


app.get('/api/results', requireAuth, async (req, res) => {

  return res.json(await getResults());

});

app.get('/api/prono', requireAuth, async (req, res) => {
  return res.json(await getPronos());
});


// Return 404 for any /api/* request that wasn't matched above.
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// SPA catchall: for any non-API request that doesn't match a static
// file, send back the frontend index.html so the Vue router handles it.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Backend startup aborted because port ${port} is already in use.`);
    process.exit(1);
  }

  console.error('Backend startup aborted because the server failed to start.');
  console.error(error);
  process.exit(1);
});
