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
 * @requires cors - Cross-origin resource sharing
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
 * Only allows requests from whitelisted origins:
 * - http://localhost:5173 (development)
 * - https://betza.onrender.com (production)
 *
 * Usage:
 * npm start - Start the server
 * Server listens on PORT environment variable or 5000 by default
 */

import { pickHighest, pickLowest } from './modules/utils.js';
import { load, getDeelnemers, getWedstrijden, getPronos, getResults, getTotals, getGrafiekData, getAllDeelnemers, getEditions } from './modules/googlesheet.js';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// https://expressjs.com/en/resources/middleware/cors.html#configuration-options
var allowlist = ['http://192.168.10.30:5173', 'https://betza.onrender.com']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}


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

// Serve static files from the React app
app.use(express.static(path.join('./frontend/dist')));

app.get('/api/participants', cors(corsOptionsDelegate), async (req, res) => {
  return res.json(await getDeelnemers());
});

app.get('/api/alltimeparticipants', cors(corsOptionsDelegate), async (req, res) => {
  return res.json(await getAllDeelnemers());
});

app.get('/api/editions', cors(corsOptionsDelegate), async (req, res) => {
  return res.json(await getEditions());
});

app.get('/api/scores', cors(corsOptionsDelegate), async (req, res) => {

  res.json(await getGrafiekData());

});

app.get('/api/chartData', cors(corsOptionsDelegate), async (req, res) => {

  res.json(await getGrafiekData());

});


app.get('/api/totals', cors(corsOptionsDelegate), async (req, res) => {
  res.json(await getTotals());

});

app.get('/api/topChartData', cors(corsOptionsDelegate), async (req, res) => {

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

app.get('/api/lowestChartData', cors(corsOptionsDelegate), async (req, res) => {

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



app.get('/api/games', cors(corsOptionsDelegate), async (req, res) => {
  return res.json(await getWedstrijden());
});


app.get('/api/results', cors(corsOptionsDelegate), async (req, res) => {

  return res.json(await getResults());

});

app.get('/api/prono', cors(corsOptionsDelegate), async (req, res) => {
  return res.json(await getPronos());
});


// The "catchall" handler: for any request that doesn't
// match one above, send back frontend index.html file.
//app.get('*', (req, res) => {
////  console.log(req.originalUrl);
////  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
////});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Listining on port ${port}`);


