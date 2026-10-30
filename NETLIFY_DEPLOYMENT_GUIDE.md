# 🚀 Netlify Unified Fullstack Deployment Guide
### AP Smart Crime Analysis & Predictive Insights Platform
**Department of CSE (Data Science) • Geethanjali Institute of Science & Technology**

---

## ⚡ Unified Simultaneous Deployment (Frontend + Netlify Serverless Functions)

Both the **Frontend (React 18 + Vite + TailwindCSS + Leaflet)** and the **Backend (Express + REST API + MongoDB)** are configured to build and deploy **simultaneously under a single Netlify site**.

### Architecture Overview:
1. **Frontend SPA**: Static files are built into `dist/` and served with high-performance edge caching and client-side SPA routing (`/* -> /index.html 200`).
2. **Backend Serverless API**: The Express application runs seamlessly as a Netlify Serverless Function (`netlify/functions/api.js`), handling all `/api/*` requests on the exact same domain.
3. **No Cross-Origin Issues**: Because both the UI and API are hosted under the same Netlify domain (e.g., `https://<your-site>.netlify.app`), all browser requests to `/api/...` are local (same-origin), avoiding mixed-content and CORS blocking while retaining dynamic headers.
4. **Dynamic Resilient Fallbacks**: If MongoDB Atlas connectivity is ever unreachable or pending DNS propagation, the API automatically operates in **Cloud Resilient Mode** with built-in Andhra Pradesh crime telemetry and hotspot models.

---

## 📋 Step-by-Step Netlify Deployment Instructions

### Step 1: Connect Repository to Netlify
1. Log in to [Netlify Dashboard](https://app.netlify.com/).
2. Click **"Add new site"** → **"Import an existing project"**.
3. Select **GitHub** and authorize access.
4. Choose the repository: **`smart-crime-mapping-netlify`** (or your new GitHub repo).

### Step 2: Configure Build Settings
Netlify will automatically detect configuration from [`netlify.toml`](./netlify.toml):
* **Base directory**: `.` (leave empty or set to root `/`)
* **Build command**: `npm run build`
* **Publish directory**: `dist`
* **Functions directory**: `netlify/functions`

### Step 3: Configure Environment Variables (Optional / Recommended)
In Netlify **Site configuration → Environment variables** (or under Site Settings):

| Variable Name | Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Node production environment |
| `MONGODB_URI` | `mongodb://jagendherananthsingh_db_user:...` | MongoDB Atlas direct connection string |
| `JWT_SECRET` | `smart_crime_mapping_super_secure_jwt_secret_key_2026` | Token signing secret |
| `JWT_EXPIRES_IN`| `7d` | User session token expiry duration |
| `CLIENT_URL` | Auto-detected from `process.env.URL` | Frontend origin for CORS |

*(Note: Pre-configured defaults exist in `.env`, so the deployment works immediately out of the box even before custom environment variables are added!)*

### Step 4: Click "Deploy Site"
Netlify will execute:
1. Backend TypeScript build (`tsc`)
2. Backend function packaging into `netlify/functions/backend/dist`
3. Frontend Vite production build
4. Edge redirects (`dist/_redirects`) generation

Your unified application will be live at:
* **Web UI**: `https://<your-app>.netlify.app/`
* **Health Check**: `https://<your-app>.netlify.app/api/health`
* **Crimes API**: `https://<your-app>.netlify.app/api/crimes`
* **Auth Endpoint**: `https://<your-app>.netlify.app/api/auth/login`

---

## 🛠️ Local Development & Testing with Netlify CLI

To run the exact Netlify production environment locally:
```bash
# Install Netlify CLI globally (if not already installed)
npm install -g netlify-cli

# Start Netlify Dev environment
ntl dev
```
Netlify Dev will boot both the Vite frontend server and Netlify Functions proxy together on `http://localhost:8888`.
