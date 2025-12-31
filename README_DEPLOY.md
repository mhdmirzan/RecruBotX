# Deploying RecruBotX to Render

This project is configured for easy deployment on [Render](https://render.com).

## 1. Prerequisites
- A GitHub repository with your RecruBotX code.
- A MongoDB Atlas cluster (free tier works).
- API keys for Gemini and Deepgram.

## 2. Deployment Steps

### Option A: Using Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml`. It will now use **Docker** for the backend to handle system audio dependencies.
5. Provide the required Environment Variables when prompted.

### Option B: Manual Setup

#### Backend (Web Service)
1. **New** -> **Web Service**.
2. Connect your repository.
3. Environment/Runtime: **Docker**.
4. Root Directory: `Backend`.
5. Add Environment Variables:
   - `MONGODB_URL`: Your MongoDB connection string.
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `DEEPGRAM_API_KEY`: Your Deepgram API key.
   - `ALLOWED_ORIGINS`: `https://your-frontend-url.onrender.com`.

#### Option 1: Frontend on Render (Static Site)
1. **New** -> **Static Site**.
2. Root Directory: `Frontend`.
3. Build Command: `npm install && npm run build`.
4. Publish Directory: `build`.
5. Add Environment Variables:
   - `REACT_APP_API_URL`: `https://your-backend-url.onrender.com/api`.
6. **Crucial**: Go to **Redirects/Rewrites** and add:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

#### Option 2: Frontend on Vercel (Recommended for Speed)
1. Go to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. In **Configure Project**:
   - **Root Directory**: Select `Frontend`.
   - **Framework Preset**: `Create React App` (automatically detected).
4. Expand **Environment Variables**:
   - Add `REACT_APP_API_URL` with value `https://your-backend-url.onrender.com/api`.
5. Click **Deploy**.
6. **SPA Routing**: The `vercel.json` I created will automatically handle routing.

---

## 🚀 Environment Variables Summary

| Service | Variable | Description |
| --- | --- | --- |
| **Backend** | `MONGODB_URL` | MongoDB connection string |
| **Backend** | `GEMINI_API_KEY` | Google Gemini API Key |
| **Backend** | `DEEPGRAM_API_KEY` | Deepgram API Key |
| **Backend** | `ALLOWED_ORIGINS` | URL(s) of your frontend |
| **Frontend** | `REACT_APP_API_URL` | URL of your backend API |

## 🛠 Troubleshooting
- **CORS Errors**: Ensure `ALLOWED_ORIGINS` in the backend matches your frontend URL exactly (including `https://` and no trailing slash).
- **Voice Interview**: Ensure your browser has microfilm permissions.
- **Database**: Ensure your MongoDB Atlas IP Whitelist allows access (for testing, use `0.0.0.0/0`).
