/**
 * Betza API Server
 *
 * Backend-for-Frontend (BFF) server for the Betza betting/prediction application.
 * Serves the Vue.js frontend as static files and provides tournament data from
 * Google Sheets via REST API endpoints - all from a single origin.
 *
 * In production the frontend and API share the same domain, so API calls are
 * same-origin and no CORS headers are required.  The CORS middleware is kept for
 * local development where the Vite dev-server runs on a different port.
 *
 * @author Betza Team
 * @version 1.0.0
 */

import { load, getDeelnemers, getWedstrijden, getPronos, getResults, getTotals, getGrafiekData, getAllDeelnemers, getEditions } from './modules/googlesheet.js';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

dotenv.config();

// ---------------------------------------------------------------------------
// Startup environment validation
// ---------------------------------------------------------------------------
const REQUIRED_ENV_VARS = ['GOOGLE_PRIVATE_KEY', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SPREADSHEET'];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.warn(`[startup] WARNING: Missing required environment variable: ${envVar}`);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ---------------------------------------------------------------------------
// CORS – only needed for cross-origin requests during local development.
// In production the frontend is served from the same origin as the API, so
// these headers are not required for browser requests.
// ---------------------------------------------------------------------------
const CORS_ALLOWLIST = [
  'http://localhost:5173',        // Vite dev server (default)
  'http://192.168.10.30:5173',    // LAN dev access
  'https://betza.onrender.com',   // production BFF origin (kept for migration window)
];

const corsOptionsDelegate = (req, callback) => {
  const corsOptions = CORS_ALLOWLIST.includes(req.header('Origin'))
    ? { origin: true }
    : { origin: false };
  callback(null, corsOptions);
};

const corsMiddleware = cors(corsOptionsDelegate);

// ---------------------------------------------------------------------------
// Static frontend assets (production build)
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, './frontend/dist')));

// ---------------------------------------------------------------------------
// Health check – used by the hosting platform and uptime monitors
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.get('/api/participants', corsMiddleware, async (req, res) => {
  res.json(await getDeelnemers());
});

app.get('/api/alltimeparticipants', corsMiddleware, async (req, res) => {
  res.json(await getAllDeelnemers());
});

app.get('/api/editions', corsMiddleware, async (req, res) => {
  res.json(await getEditions());
});

app.get('/api/scores', corsMiddleware, async (req, res) => {
  res.json(await getGrafiekData());
});

app.get('/api/chartData', corsMiddleware, async (req, res) => {
  res.json(await getGrafiekData());
});

app.get('/api/totals', corsMiddleware, async (req, res) => {
  res.json(await getTotals());
});

app.get('/api/topChartData', corsMiddleware, async (req, res) => {
  const totals = await getTotals();
  const top3 = Object.fromEntries(totals.slice(0, 3).map(t => [t.deelnemer, t.total]));
  res.json(top3);
});

app.get('/api/lowestChartData', corsMiddleware, async (req, res) => {
  const totals = await getTotals();
  const lowest3 = Object.fromEntries(totals.slice(-3).map(t => [t.deelnemer, t.total]));
  res.json(lowest3);
});

app.get('/api/games', corsMiddleware, async (req, res) => {
  res.json(await getWedstrijden());
});

app.get('/api/results', corsMiddleware, async (req, res) => {
  res.json(await getResults());
});

app.get('/api/prono', corsMiddleware, async (req, res) => {
  res.json(await getPronos());
});

// ---------------------------------------------------------------------------
// SPA fallback – Vue Router uses HTML5 history mode.  Any non-API, non-asset
// request must return index.html so the client-side router can handle it.
// This allows direct navigation to /tussenstand, /grafiek, etc.
// A rate-limiter guards against abuse of the file-system read.
// ---------------------------------------------------------------------------
const spaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,            // allow up to 120 page navigations per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('*', spaLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/dist', 'index.html'));
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`[startup] Betza BFF listening on port ${port}`);
});


