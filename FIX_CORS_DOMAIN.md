# Fix CORS and Multi-Domain Support

This guide fixes the CORS errors when accessing the application via `alhuda.i-masjid.my`.

## Changes Made

1. **Backend CORS Configuration** (`backend/src/main.ts`):
   - Added `https://masjid.taskinsight.my` and `https://alhuda.i-masjid.my` to allowed origins
   - Improved CORS configuration with proper method and header handling

2. **Frontend API Configuration** (`frontend/src/lib/api.ts`):
   - Updated to use relative URLs (`/api`) in production
   - Automatically works with both domains via Nginx proxy
   - Falls back to localhost for development

## Deployment Steps on VPS

### Step 1: Pull Latest Changes

```bash
cd ~/projects/masjid
git pull origin main  # or your branch name
```

### Step 2: Rebuild Backend

```bash
cd backend
npm install  # In case there are new dependencies
npm run build
```

### Step 3: Rebuild Frontend

```bash
cd ../frontend
npm install  # In case there are new dependencies
npm run build
```

### Step 4: Restart PM2 Processes

```bash
cd ~/projects/masjid
pm2 restart ecosystem.config.js
# or restart individually:
pm2 restart mkcs-backend
pm2 restart mkcs-frontend
```

### Step 5: Verify

1. **Check PM2 status:**
   ```bash
   pm2 list
   pm2 logs --lines 50
   ```

2. **Test both domains:**
   - Visit `https://masjid.taskinsight.my` - should work
   - Visit `https://alhuda.i-masjid.my` - should work
   - Try logging in on both domains

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Check Console tab - should see no CORS errors
   - Check Network tab - API calls should go to `/api` (relative URL)

## How It Works

### Frontend API Detection
- **Development**: Uses `http://localhost:3001/api` (or `NEXT_PUBLIC_API_URL` if set)
- **Production**: Uses relative URL `/api` which works with both domains:
  - `https://masjid.taskinsight.my/api` → Nginx proxies to `http://localhost:4008`
  - `https://alhuda.i-masjid.my/api` → Nginx proxies to `http://localhost:4008`

### Backend CORS
- Allows requests from both production domains
- Allows credentials (cookies, authorization headers)
- Supports all HTTP methods needed by the API

## Troubleshooting

### Still Getting CORS Errors?

1. **Check backend is running:**
   ```bash
   pm2 logs mkcs-backend
   ```

2. **Verify backend CORS config:**
   - Check `backend/src/main.ts` includes both domains
   - Ensure backend was rebuilt: `cd backend && npm run build`

3. **Check Nginx configuration:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear cache and reload

### API Calls Going to Wrong Domain?

1. **Check frontend build:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Verify environment variables:**
   - Make sure `NEXT_PUBLIC_API_URL` is NOT set in production (or set to `/api`)
   - The code will auto-detect and use relative URLs

3. **Check browser console:**
   - Look at Network tab to see what URL is being called
   - Should be `/api/...` (relative) not `https://masjid.taskinsight.my/api/...`

## Quick Commands

```bash
# Full rebuild and restart
cd ~/projects/masjid
git pull
cd backend && npm install && npm run build && cd ..
cd frontend && npm install && npm run build && cd ..
pm2 restart ecosystem.config.js
pm2 save

# Check status
pm2 list
pm2 logs --lines 20
```

---

**Note:** After deploying, both domains will work seamlessly. The frontend automatically uses the correct API endpoint based on the current domain.
