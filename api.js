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
 * @requires cors - Cross-origin resource sharing (localhost only)
 * @requires google-spreadsheet - Google Sheets integration
 *
 * Environment Variables:
 * - PORT: Server port (default: 5000)
 * - GOOGLE_SHEET_ID: Google Sheet document ID
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email for Sheets API
 * - GOOGLE_PRIVATE_KEY: Private key for Sheets API authentication
 *
 * API Endpoints:
 * - GET /api/participants - Get current tournament participants
 * - GET /api/alltimeparticipants - Get all-time participants across editions
 * - GET /api/editions - Get available tournament editions
 * - GET /api/games - Get tournament matches/games
 * - GET /api/results - Get match results and predictions
 * - GET /api/prono - Get prediction data
 * - GET /api/totals - Get participant totals/scores
 * - GET /api/scores - Get chart data for scores
 * - GET /api/chartData - Alias for /api/scores
 * - GET /api/topChartData - Get top 3 performers
 * - GET /api/lowestChartData - Get bottom 3 performers
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
import { getIronSession } from 'iron-session';
import path from 'path';
import cors from 'cors';
import crypto from 'crypto';
import helmet from 'helmet';

import { fileURLToPath } from 'url';

const requiredEnvVars = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_SPREADSHEET',
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

const isProduction = process.env.NODE_ENV === 'production';
const allowMockAuth = process.env.ALLOW_MOCK_AUTH?.trim().toLowerCase() === 'true';
const googleHostedDomain = process.env.GOOGLE_OAUTH_HOSTED_DOMAIN?.trim().toLowerCase() || '';
const allowedGoogleIssuers = new Set(['accounts.google.com', 'https://accounts.google.com']);

if (isProduction && allowMockAuth) {
  console.error('Backend startup aborted because mock auth cannot be enabled in production.');
  process.exit(1);
}

const contentSecurityPolicyDirectives = {
  defaultSrc: ["'self'"],
  baseUri: ["'self'"],
  connectSrc: ["'self'"],
  fontSrc: ["'self'", 'data:'],
  frameAncestors: ["'none'"],
  imgSrc: ["'self'", 'data:', 'blob:'],
  objectSrc: ["'none'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
};

if (isProduction) {
  contentSecurityPolicyDirectives.upgradeInsecureRequests = [];
}

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: contentSecurityPolicyDirectives,
  },
  hsts: isProduction
    ? {
        maxAge: 15552000,
        includeSubDomains: true,
        preload: false,
      }
    : false,
  referrerPolicy: {
    policy: 'same-origin',
  },
}));

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

// Session middleware using encrypted cookie sessions.
// Session payload is encrypted and stored in the cookie.
//
// Cookie naming strategy:
//   Production  – "__Host-session": the __Host- prefix mandates Secure + Path=/ +
//                 no Domain, which locks the cookie to the exact host. This is the
//                 most secure option but requires HTTPS (Secure flag).
//   Development – "session": the __Host- prefix requires the Secure attribute per
//                 RFC 6265bis. Browsers silently drop __Host- cookies that lack
//                 Secure, so a plain name is used in dev to keep the session
//                 working over plain HTTP on localhost.
const mockUserEmail = process.env.MOCK_USER_EMAIL?.trim().toLowerCase() || '';
const mockUserPictureId = process.env.MOCK_USER_PICTURE_ID?.trim() || 'DXX';
const mockAuthEnabled = !isProduction && allowMockAuth && !!mockUserEmail;
const sessionTtlSeconds = 30 * 24 * 60 * 60;

if (allowMockAuth && !mockUserEmail) {
  console.warn('Mock auth was requested, but MOCK_USER_EMAIL is missing. Mock auth is disabled.');
}

if (mockAuthEnabled) {
  console.warn('Mock auth is enabled for localhost requests only.');
}
const sessionOptions = {
  cookieName: isProduction ? '__Host-session' : 'session',
  password: process.env.SESSION_SECRET,
  ttl: sessionTtlSeconds,
  cookieOptions: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  },
};

app.use(async (req, res, next) => {
  req.session = await getIronSession(req, res, sessionOptions);
  next();
});

app.use(express.json());

function normalizeForwardedIp(value) {
  if (!value) return null;
  let ip = String(value).trim().replace(/^"|"$/g, '');
  if (!ip || ip.toLowerCase() === 'unknown') return null;
  if (ip.startsWith('[') && ip.includes(']')) {
    ip = ip.slice(1, ip.indexOf(']'));
    return ip || null;
  }
  const colonCount = (ip.match(/:/g) || []).length;
  if (colonCount === 1 && ip.includes('.')) {
    const [host] = ip.split(':');
    return host || null;
  }
  return ip;
}

function getClientIp(req) {
  const forwarded = req.get('forwarded');
  if (forwarded) {
    const match = forwarded.match(/for=([^;,"]+|"[^"]+")/i);
    const forwardedIp = normalizeForwardedIp(match?.[1]);
    if (forwardedIp) return forwardedIp;
  }

  const xForwardedFor = req.get('x-forwarded-for');
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0];
    const xffIp = normalizeForwardedIp(first);
    if (xffIp) return xffIp;
  }

  return req.ip || req.socket?.remoteAddress || '-';
}

function sanitizeLogValue(value) {
  const sanitized = String(value ?? '-')
    .replace(/[\r\n]+/g, ' ')
    .replace(/"/g, '\'')
    .trim();

  return sanitized || '-';
}

function isLocalHostname(hostname) {
  const normalized = String(hostname ?? '').trim().toLowerCase();
  return normalized === 'localhost'
    || normalized === '127.0.0.1'
    || normalized === '::1'
    || normalized === '[::1]';
}

function isMockAuthAllowedForRequest(req) {
  return mockAuthEnabled && isLocalHostname(req.hostname);
}

async function rotateSessionPayload(req, res, payload = {}) {
  await req.session.destroy();
  req.session = await getIronSession(req, res, sessionOptions);
  Object.assign(req.session, payload);
  await req.session.save();
}

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  return next();
}

function isValidGoogleIdentity(payload) {
  if (!payload || payload.email_verified !== true) {
    return false;
  }

  if (!allowedGoogleIssuers.has(payload.iss)) {
    return false;
  }

  if (googleHostedDomain && payload.hd?.trim().toLowerCase() !== googleHostedDomain) {
    return false;
  }

  return true;
}

app.use((req, res, next) => {
  res.on('finish', () => {
    const timestamp = new Date().toISOString();
    const ip = sanitizeLogValue(getClientIp(req));
    const email = sanitizeLogValue(req.session?.user?.email || '-');
    const method = sanitizeLogValue(req.method);
    const uri = sanitizeLogValue(req.originalUrl || req.url || '-');
    const httpVersion = `${req.httpVersionMajor}.${req.httpVersionMinor}`;
    const status = res.statusCode;
    const bytes = sanitizeLogValue(res.getHeader('content-length') || '-');
    const referer = sanitizeLogValue(req.get('referer') || '-');
    const userAgent = sanitizeLogValue(req.get('user-agent') || '-');

    console.log(
      `${timestamp} ${ip} - ${email} "${method} ${uri} HTTP/${httpVersion}" ${status} ${bytes} "${referer}" "${userAgent}"`,
    );
  });

  next();
});

app.use('/api', apiRateLimiter);

async function resolveParticipant(email) {
  const authUsers = await getAuthUsers();
  const row = authUsers.find((u) => u.email?.trim().toLowerCase() === email);
  if (!row) return null;
  const active = String(row.is_active ?? 'true').trim().toLowerCase();
  if (active === 'false' || active === '0') return null;
  return row;
}

async function buildSessionUser(email, fallbackName = null) {
  const participant = await resolveParticipant(email);
  if (participant) {
    return {
      email,
      name: participant.name || participant.Deelnemer || fallbackName || email,
      pictureID: participant.PictureID || mockUserPictureId,
      picture: participant.PictureID || null,
      participantId: participant.participant_id ?? null,
      role: participant.role ?? 'user',
    };
  }

  return {
    email,
    name: fallbackName || email,
    pictureID: mockUserPictureId,
    picture: null,
    participantId: null,
    role: 'user',
  };
}

async function ensureMockSession(req, res) {
  if (!isMockAuthAllowedForRequest(req) || req.session?.user || req.session?.mockAuthDisabled) {
    return false;
  }

  const user = await buildSessionUser(mockUserEmail, 'Local Dev User');
  await rotateSessionPayload(req, res, {
    user,
    mockAuthDisabled: false,
  });
  return true;
}

app.get('/api/auth/login', async (req, res) => {
  if (isMockAuthAllowedForRequest(req)) {
    req.session.mockAuthDisabled = false;
    await req.session.save();
    await ensureMockSession(req, res);
    return res.redirect('/');
  }

  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  await req.session.save();
  const authorizationUrl = getAuthorizationUrl(state);
  res.redirect(authorizationUrl);
});

app.get('/api/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code.' });
    }

    if (!state || typeof state !== 'string' || state !== req.session.oauthState) {
      return res.status(400).json({ error: 'Invalid OAuth state.' });
    }

    delete req.session.oauthState;
    await req.session.save();

    const payload = await verifyGoogleCode(code);

    if (!isValidGoogleIdentity(payload)) {
      return res.status(401).json({ error: 'Google identity verification failed.' });
    }

    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      return res.status(401).json({ error: 'Google account email not available.' });
    }

    const participant = await resolveParticipant(email);
    if (!participant) {
      return res.status(403).json({ error: 'Account is not allowed to sign in.' });
    }

    await rotateSessionPayload(req, res, {
      user: {
        email,
        name: payload.name || participant.name || participant.Deelnemer || email,
        picture: payload.picture || null,
        participantId: participant.participant_id ?? null,
        role: participant.role ?? 'user',
      },
    });

    return res.redirect('/');
  } catch (error) {
    console.error('OAuth callback failed.', error);
    return res.status(401).json({ error: 'Authentication failed.' });
  }
});

app.get('/api/auth/session', (req, res) => {
  if (isMockAuthAllowedForRequest(req) && !req.session?.user && !req.session?.mockAuthDisabled) {
    return ensureMockSession(req, res)
      .then(() => res.json({ user: req.session.user }))
      .catch((error) => {
        console.error('Mock session initialization failed.', error);
        res.status(500).json({ error: 'Failed to initialize mock session.' });
      });
  }

  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  return res.json({ user: req.session.user });
});

app.post('/api/auth/logout', async (req, res) => {
  if (isMockAuthAllowedForRequest(req)) {
    await rotateSessionPayload(req, res, {
      mockAuthDisabled: true,
    });
    return res.status(204).end();
  }

  await req.session.destroy();
  return res.status(204).end();
});

app.use('/api', requireAuth);

async function calculatePronos(id) {
  await load();
  const sheet = doc.sheetsByTitle["prono"];
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;
  var data = [];
  const item = rows.find(e => e.id == id);
  console.log(item);
  data.push(item);
  
  return data;

}

// Serve static files from the frontend build
app.use(express.static(path.join('./frontend/dist')));

app.get('/api/participants', async (req, res) => {
  return res.json(await getDeelnemers());
});

app.get('/api/alltimeparticipants', async (req, res) => {
  return res.json(await getAllDeelnemers());
});

app.get('/api/editions', async (req, res) => {
  return res.json(await getEditions());
});

app.get('/api/scores', async (req, res) => {

  res.json(await getGrafiekData());

});

app.get('/api/chartData', async (req, res) => {

  res.json(await getGrafiekData());

});


app.get('/api/totals', async (req, res) => {
  res.json(await getTotals());

});

app.get('/api/topChartData', async (req, res) => {

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

app.get('/api/lowestChartData', async (req, res) => {

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



app.get('/api/games', async (req, res) => {
  return res.json(await getWedstrijden());
});


app.get('/api/results', async (req, res) => {

  return res.json(await getResults());

});

app.get('/api/prono', async (req, res) => {
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
