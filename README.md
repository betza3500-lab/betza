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

Create a `.env` file in the root directory:

```env
# ── Google Sheets API (service account for read access) ────────────────────
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_SPREADSHEET="your-google-sheet-id-here"

# ── Google OAuth2 (for user login) ─────────────────────────────────────────
GOOGLE_OAUTH_CLIENT_ID="your-oauth-client-id.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="your-oauth-client-secret"
# For local development use localhost; change to your production URL when deploying.
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5000/api/auth/callback"

# ── Session cookie ──────────────────────────────────────────────────────────
# A long random secret (at least 32 characters). Generate with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
SESSION_SECRET="your-long-random-secret-here"

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

### 4a. Google OAuth2 Setup (for user login)

The app uses Google Sign-In so that each registered participant can log in
with their own Google account.

1. In [Google Cloud Console](https://console.cloud.google.com/) open the same project.
2. Go to "APIs & Services" > "Credentials".
3. Click "Create Credentials" > **OAuth 2.0 Client ID**.
4. Choose **Web application**.
5. Add the following **Authorised redirect URIs**:
   - `http://localhost:5000/api/auth/callback` (development)
   - `https://your-app.onrender.com/api/auth/callback` (production)
6. Copy the **Client ID** and **Client secret** into `.env` as
   `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`.

> **Note**: This is a *different* credential from the service account used for
> Google Sheets. One project can have both at the same time.

### 5. Google Sheet Structure

Your Google Sheet must contain the following worksheets:

- `deelnemers` – Participant information (see schema below)
- `wedstrijden` – Match/game data
- `prono` – Prediction data
- `resultaten` – Results and scores
- Additional sheets as needed for your tournament

#### `deelnemers` sheet schema

| Column | Required | Description |
|--------|----------|-------------|
| `naam` | ✅ | Display name. Must match the column headers in the `prono` sheet exactly. |
| `participant_id` | ✅ | Stable, immutable identifier (e.g. `D01`). Never reuse a value. |
| `PictureID` | ✅ | Filename stem for the participant avatar (e.g. `brambo` → `brambo.jpg`). |
| `kleur` | ✅ | CSS colour used in charts (e.g. `#ff5733`). |
| `email` | ✅ | Google account email address used for login. Case-insensitive. |
| `is_active` | optional | `true` (default) or `false`. Set to `false` to block access without deleting the row. |
| `role` | optional | `participant` (default) or `admin` — for future role-based features. |
| *Edition columns* | optional | One column per edition (e.g. `WK2022`, `EK2024`). Used for Hall of Fame / Shame. |

> **Note**: All columns before the first edition column (`naam`, `participant_id`,
> `PictureID`, `kleur`, `email`, `is_active`, `role`) are treated as metadata
> and are automatically excluded from the edition list.

#### Onboarding a new participant

1. Add a new row to `deelnemers` with all required fields filled in.
2. Set `is_active` to `true`.
3. Add the participant's nickname as a new column header in the `prono` sheet.
4. Communicate to the participant which Google account email they must use.

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

All data endpoints require a valid session (see Authentication below).

## Authentication

The app uses **Google Sign-In** (OAuth 2.0 / OIDC). Only participants whose
Google account email is registered in the `deelnemers` sheet can log in.

### Login flow

```
User browser ──GET /api/auth/login──► Express BFF
                                           │
                               redirects to Google OAuth2
                                           │
                Google callback ──GET /api/auth/callback──► Express BFF
                                           │
                              validates state (CSRF), exchanges code,
                              verifies ID token, checks email allow-list
                                           │
                              creates HttpOnly session cookie
                              redirects browser to /
```

### Auth API endpoints (no session required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/login` | Redirects to Google consent screen |
| `GET` | `/api/auth/callback` | Handles Google OAuth2 callback |
| `GET` | `/api/auth/session` | Returns `{user}` or `401` |
| `POST` | `/api/auth/logout` | Destroys session |
| `GET` | `/api/me` | Returns participant profile (requires session) |

### Access control

- Only emails listed in the `deelnemers` sheet (`email` column) are allowed.
- Setting `is_active` to `false` immediately blocks that account.
- Denied login attempts are logged server-side with the domain part of the email.

## CORS Configuration

CORS is enabled for `localhost` origins only (development). In production the
BFF pattern serves the frontend and API from the same origin, so no CORS
headers are needed.

## Deployment

### Backend Deployment (Render)

The backend is configured for deployment on Render:

1. Connect your GitHub repository to Render.
2. Set all environment variables in the Render dashboard (see `.env` template above).
   - For `GOOGLE_OAUTH_REDIRECT_URI` use your production URL, e.g.
     `https://your-app.onrender.com/api/auth/callback`.
   - Add the same production URL as an Authorised redirect URI in Google Cloud Console.
3. Set `NODE_ENV=production` so the session cookie is sent only over HTTPS.
4. Deploy.

### Frontend Deployment

For production frontend deployment:

```bash
cd frontend
npm run build
```

Deploy the `dist` folder to your hosting provider

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

4. **CORS errors**:
   - Check that your frontend is running on an allowed origin
   - For development, use `http://localhost:5173`

5. **Port conflicts**:
   - Backend runs on port 5000 by default
   - Frontend runs on port 5173 by default
   - Change ports using environment variables if needed

### Development Tips

- Use `npm run dev -- --host` to expose the frontend on your network
- The backend includes detailed JSDoc documentation in `api.js`
- Check browser console and server logs for debugging
- Use tools like Postman to test API endpoints directly

## Hosting

Currently hosted on Render for the backend API.

## Libraries

- **node-google-spreadsheet**: https://theoephraim.github.io/node-google-spreadsheet/#/
- **Express.js**: Web framework for the API
- **Vue.js**: Frontend framework
- **Vite**: Build tool and development server
- **Bootstrap**: UI components
