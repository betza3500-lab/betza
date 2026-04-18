/**
 * Betza API Server
 *
 * Backend-for-Frontend (BFF) server for the Betza betting/prediction application.
 * Serves tournament data from Google Sheets via REST API endpoints.
 *
 * @author Betza Team
 * @version 1.0.0
 */

import { load, getDeelnemers, getWedstrijden, getPronos, getResults, getTotals, getGrafiekData, getAllDeelnemers, getEditions } from './modules/googlesheet.js';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS configuration - whitelist allowed origins
const ALLOWLIST = ['http://localhost:5173', 'http://192.168.10.30:5173', 'https://betza.onrender.com'];

const corsOptionsDelegate = (req, callback) => {
  const corsOptions = ALLOWLIST.includes(req.header('Origin'))
    ? { origin: true }
    : { origin: false };
  callback(null, corsOptions);
};

const corsMiddleware = cors(corsOptionsDelegate);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, './frontend/dist')));

// API Routes
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

// Start server
const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Listening on port ${port}`);


