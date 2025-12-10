# ElevateX Deployment Guide

This guide will walk you through deploying the full stack ElevateX application (React Frontend + Node.js/Express Backend + MongoDB).

We will use **Render** for the Backend and **Vercel** for the Frontend. This is a robust and free-tier friendly combination.

## Phase 1: Database Setup (MongoDB Atlas)

If you haven't already set up a cloud database:

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/login.
2.  Create a new **Cluster** (Free tier M0 Sandbox is fine).
3.  In **Database Access**, create a database user with a password. **Remember this password**.
4.  In **Network Access**, allow access from anywhere (`0.0.0.0/0`) for simplicity, or whitelist Render/Vercel IPs later.
5.  Click **Connect** -> **Connect your application** -> Copy the connection string (e.g., `mongodb+srv://<username>:<password>@...`).
    *   *Note: You will need to replace `<password>` with your actual password.*

## Phase 2: Push to GitHub

Ensure your latest code is pushed to your GitHub repository.

1.  Initialize git if needed: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Ready for deploy"`
4.  Push to a new repository on GitHub.

## Phase 3: Backend Deployment (Render)

1.  Sign up/Login to [Render](https://render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
## Phase 3: Backend Deployment (Render)

1.  Sign up/Login to [Render](https://render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  **Configuration**:
    *   **Name**: `elevatex-api` (or similar)
    *   **Root Directory**: `server`
        *   **IMPORTANT**: Just type `server`. Do **not** paste the full path from your computer (e.g., `/Users/...`). It must be relative to your git repository.
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
5.  **Environment Variables (CRITICAL STEP)**:
    *   Scroll down to the **Environment Variables** section (it might be under "Advanced" or a dedicated tab depending on the view).
    *   Click **Add Environment Variable** for *each* of the following. You must manually enter the "Key" and "Value".

    | Key | Value (What to put) | Description |
    | :--- | :--- | :--- |
    | `NODE_ENV` | `production` | Tells the server it's live. |
    | `MONGO_URI` | `mongodb+srv://...` | **The Connection String from Phase 1.** Make sure you replaced `<password>` with your real password! |
    | `JWT_SECRET` | *(Any long random string)* | E.g., `mySuperSecretKey123!@#`. Used to sign login tokens. |
    | `FRONTEND_URL` | *(Leave blank for now)* | We'll fill this after deploying the frontend (Phase 5). |
    | `EMAIL_USER` | *(Optional for now)* | Your Gmail/SendGrid username. |
    | `EMAIL_PASSWORD` | *(Optional for now)* | Your Gmail App Password. |

    *   *Note: Without EMAIL variables, features like "Forgot Password" won't work, but the site will load.*

6.  Click **Create Web Service**.
7.  Wait for the deployment to finish. You will see a URL at the top like `https://elevatex-api.onrender.com`. **Copy this URL**.

## Phase 4: Frontend Deployment (Vercel)

1.  Sign up/Login to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configuration**:
    *   **Framework Preset**: `Vite` (Should be auto-detected)
    *   **Root Directory**: `./` (Default)
    *   **Build Command**: `npm run build` (or `vite build`)
    *   **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: *Paste your Render Backend URL here (e.g., `https://elevatex-api.onrender.com/api`)*.
        *   **Important**: Ensure you append `/api` if your backend routes require it (your local setup uses `/api` in `axios.js` fallback, so if your Render URL is just the domain, the code `baseURL: import.meta.env.VITE_API_URL` means you should provide the full base path.
        *   Actually, let's verify `axios.js`. It uses it as `baseURL`. If your backend routes are mapped to `/api/...`, then setting `VITE_API_URL` to `https://elevatex-api.onrender.com/api` is correct.
6.  Click **Deploy**.
7.  Wait for completion. You will get a Frontend URL (e.g., `https://elevatex.vercel.app`). **Copy this URL**.

## Phase 5: Final Connection

1.  Go back to **Render** -> **Dashboard** -> **elevatex-api**.
2.  Go to **Environment**.
3.  Add/Update the `FRONTEND_URL` variable.
    *   `FRONTEND_URL`: *Paste your Vercel Frontend URL here (e.g., `https://elevatex.vercel.app`)*.
    *   *Remove any trailing slash if present, just to be safe, though your CORS config handles it.*
4.  **Save Changes**. Render will restart the service.

## Checklist for Success

- [ ] **Database**: MongoDB allows connections (Network Access).
- [ ] **Backend**: `MONGO_URI` is correct.
- [ ] **Frontend**: `VITE_API_URL` points to the *backend*.
- [ ] **CORS**: Backend `FRONTEND_URL` points to the *frontend*.

## Troubleshooting

-   **White Screen on Frontend?** Check the browser console. If you see CORS errors, check Phase 5.
-   **Backend crashing?** Check Render logs. Usually incorrect `MONGO_URI` or missing variables.
