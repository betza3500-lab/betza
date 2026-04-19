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
import { load, getDeelnemers, getWedstrijden, getPronos, getResults, getTotals, getGrafiekData, getAllDeelnemers, getEditions } from './modules/googlesheet.js';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';

import { fileURLToPath } from 'url';

const requiredEnvVars = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_SPREADSHEET',
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
  const forwardedForHeader = req.headers['x-forwarded-for'];
  const firstForwardedIp = Array.isArray(forwardedForHeader)
    ? forwardedForHeader[0]
    : forwardedForHeader?.split(',')[0]?.trim();

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    firstForwardedIp ||
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
  bucket.count += 1;

  const remaining = Math.max(apiRateLimitMaxRequests - bucket.count, 0);
  res.setHeader('X-RateLimit-Limit', String(apiRateLimitMaxRequests));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > apiRateLimitMaxRequests) {
    const retryAfterSeconds = Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1);
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ error: 'Too many API requests. Please try again later.' });
  }

  return next();
}

const bucketCleanupInterval = 60_000;
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
  }
}));

app.use('/api', apiRateLimiter);


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
