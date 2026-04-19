# Betza

A full-stack betting/prediction application for tournament competitions. The backend serves data from Google Sheets via REST API, while the frontend provides a Vue.js interface for participants to view results, predictions, and statistics.

## Prerequisites

- **Node.js**: Version 16.x or higher (required for ES modules support)
- **npm**: Latest version
- **Google Cloud Project**: With Google Sheets API enabled
- **Service Account**: For Google Sheets API authentication

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd betza
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Set Up Environment Variables

#### Backend Environment Variables

Create a `.env` file in the root directory with your Google Sheets API credentials:

```env
# Google Sheets API Configuration
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_SPREADSHEET="your-google-sheet-id-here"

# Environment
NPM_CONFIG_PRODUCTION="false"
NPM_ENV="dev"
```

**Important**: The `.env` file is gitignored and should never be committed to version control.

#### Frontend Environment Variables

The frontend uses Vite's built-in proxy for development. No additional environment variables are required for local development.

For production builds, you can set:

```env
# frontend/.env.production
VITE_API_BASE_URL=https://your-production-api-url.com
```

### 4. Google Sheets API Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create a Service Account**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in service account details
   - Generate and download the JSON key file

4. **Share Google Sheet**:
   - Open your Google Sheet
   - Click "Share" and add the service account email as an editor
   - Copy the sheet ID from the URL (the long string between `/d/` and `/edit`)

5. **Configure Environment**:
   - Extract the `private_key` and `client_email` from the downloaded JSON
   - Add them to your `.env` file as shown above

### 5. Google Sheet Structure

Your Google Sheet should contain the following worksheets:

- `deelnemers`: Participant information
- `wedstrijden`: Match/game data
- `prono`: Prediction data
- `resultaten`: Results and scores
- Additional sheets as needed for your tournament

### 6. Start the Development Servers

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm start
```
This starts the API server on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
This starts the Vite dev server on `http://localhost:5173`

#### Option 2: Run Frontend Only (with proxy)

For development, you can run just the frontend. Vite's proxy configuration will forward API requests to the backend:

```bash
cd frontend
npm run dev -- --host
```

The frontend will be available at `http://localhost:5173` and API calls to `/api/*` will be proxied to `http://localhost:5000`.

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/*

### 8. Available Scripts

#### Backend Scripts
- `npm start`: Start the production server
- `npm test`: Run tests (currently no tests configured)

#### Frontend Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/participants` - Current tournament participants
- `GET /api/alltimeparticipants` - All-time participants across editions
- `GET /api/editions` - Available tournament editions
- `GET /api/games` - Tournament matches/games
- `GET /api/results` - Match results and predictions
- `GET /api/prono` - Prediction data
- `GET /api/totals` - Participant totals/scores
- `GET /api/scores` - Chart data for scores
- `GET /api/topChartData` - Top 3 performers
- `GET /api/lowestChartData` - Bottom 3 performers

## CORS Configuration

The API is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://192.168.10.30:5173` (LAN development access)
- `https://betza.onrender.com` (production BFF – kept for the migration window)

In production, the frontend is served by the same Express process as the API
(single origin), so browser requests are same-origin and CORS headers are not
required.  The middleware is retained only for the local dev scenario where Vite
and the API run on different ports.

## Deployment

### Architecture: Backend-for-Frontend (BFF) Single Service

Betza uses a **BFF pattern** where one Express service handles everything:

- Serves the compiled Vue.js app as static files from `frontend/dist`
- Exposes all `/api/*` endpoints from the same origin
- Returns `index.html` for any non-API route, enabling Vue Router's HTML5
  history mode to work on direct navigation and browser refresh

This eliminates the need for a separate frontend hosting service and removes
the cross-origin API dependency.

```
Browser ──► https://betza.onrender.com/
              │
              │  /                  → frontend/dist/index.html  (Vue SPA)
              │  /tussenstand       → frontend/dist/index.html  (SPA fallback)
              │  /api/totals        → Express handler           (API)
              └  /health            → Express handler           (health check)
```

### Deploy to Render

The repository includes a `render.yaml` for zero-configuration Render deployment.

1. **Connect your repository** in the [Render dashboard](https://dashboard.render.com/)
2. Render will detect `render.yaml` and create a **Web Service** automatically
3. **Set secret environment variables** in the Render dashboard (these are
   marked `sync: false` in `render.yaml` and must be provided manually):
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SPREADSHEET`
4. **Deploy** – Render runs `npm run render-build` (installs deps + Vite build)
   then starts with `npm start`

#### Manual Render setup (without render.yaml)

| Setting | Value |
|---------|-------|
| Environment | Node |
| Build Command | `npm run render-build` |
| Start Command | `npm start` |
| Root Directory | *(leave empty – repo root)* |

### Deploy to Heroku

The `heroku-postbuild` hook in `package.json` builds the frontend automatically
during `git push heroku main`.  No extra steps are required beyond setting the
same environment variables listed above.

### Health Check

A `/health` endpoint is available for platform health probes:

```
GET /health  →  { "status": "ok", "timestamp": "2026-04-19T07:00:00.000Z" }
```

## Troubleshooting

### Common Issues

1. **"Google Sheets API has not been used"**:
   - Ensure Google Sheets API is enabled in your Google Cloud project

2. **"Access denied" to Google Sheet**:
   - Verify the service account email has editor access to the sheet
   - Check that the sheet ID is correct

3. **Environment variables not loading**:
   - Ensure `.env` file is in the root directory
   - Restart the development server after adding variables
   - On startup the server logs a `WARNING` for any missing required variables

4. **CORS errors in development**:
   - Make sure the Vite dev server is running on `http://localhost:5173`
   - The API server must also be running on `http://localhost:5000`

5. **Port conflicts**:
   - Backend runs on port 5000 by default (override with `PORT` env var)
   - Vite dev server runs on port 5173 by default

6. **Direct navigation returns 404 in production**:
   - Ensure you are running the Express server – the SPA fallback (`app.get('*')`)
     returns `index.html` for all non-API, non-asset routes

### Development Tips

- Run backend with `npm start` and frontend with `cd frontend && npm run dev` in
  separate terminals
- Use `npm run dev -- --host` to expose the Vite dev server on your local network
- The backend includes JSDoc documentation in `api.js`
- Check browser console and server logs for debugging
- Use tools like Postman to test API endpoints directly

## Hosting

Hosted on [Render](https://render.com) as a single BFF service.

## Libraries

- **node-google-spreadsheet**: https://theoephraim.github.io/node-google-spreadsheet/#/
- **Express.js**: Web framework for the BFF server
- **Vue.js**: Frontend framework
- **Vite**: Build tool and development server
- **Bootstrap**: UI components
