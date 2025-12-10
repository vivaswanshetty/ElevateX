# ElevateX Server Configuration Guide

## 🚨 Critical Configurations

### 1. Port Configuration (Port 5001)
The server is configured to run on **Port 5001**.
**Reason:** macOS Monterey and later use Port 5000 for the AirPlay Receiver service. Attempting to use Port 5000 will result in `403 Forbidden` or `Address already in use` errors.

**How it's enforced:**
- `package.json` (Root): Explicitly sets `PORT=5001` in the `dev` script.
- `server/index.js`: Defaults to 5001 if no env var is present.
- `src/api/axios.js`: Defaults to 5001 for API calls.

### 2. Entry Point (`index.js`)
The main server file is located at `server/index.js`.
**Configuration:**
- `server/package.json` -> `"main": "index.js"`
- `server/package.json` -> `"scripts": { "dev": "nodemon index.js" }`

### 3. Migration Scripts
Database migrations run automatically on server start.
**Important:** The migration script (`server/scripts/migrateUsers.js`) is designed to **return** control to the main server process. It does NOT call `process.exit()` when running as a module, ensuring the server stays alive after migrations check out.

## 🚀 How to Start
Always use the root command to ensure all environment variables are set correctly:

```bash
npm run dev
```

This command concurrently starts:
1.  **Server:** `PORT=5001 npm run server`
2.  **Client:** `VITE_API_URL=http://localhost:5001/api npm run client`
