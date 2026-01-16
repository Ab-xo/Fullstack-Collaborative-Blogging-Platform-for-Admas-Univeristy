# Render Deployment Fix

## Problem

Build failed with error:

```
npm error notarget No matching version found for fast-check@^3.24.3
```

## Root Cause

Render was using Node.js 25.3.0 (too new), which doesn't have compatible versions for some packages.

## Solution Applied ✅

Updated `backend/package.json`:

- Changed Node.js version from `>=18.0.0` to `20.x` (LTS version)
- Updated fast-check from `^3.24.3` to `^3.22.0` (stable version)

## Next Steps

### 1. Redeploy on Render

Since the code is now pushed to GitHub, Render will automatically redeploy:

**Option A: Automatic (if auto-deploy is enabled)**

- Wait 2-3 minutes
- Render will detect the new commit and redeploy automatically

**Option B: Manual Trigger**

1. Go to Render Dashboard
2. Click on your service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait 5-10 minutes for build

### 2. Verify Build Success

Check the Render logs for:

```
✅ Using Node.js version 20.x.x
✅ npm install completed successfully
✅ Build succeeded
✅ Service is live
```

### 3. If Still Failing

**Check Root Directory Setting:**

- Make sure "Root Directory" is set to: `backend`
- NOT `admas-blog/backend`

**Verify Build Command:**

- Build Command: `npm install`
- Start Command: `npm start`

**Check Environment Variables:**
Make sure these are set in Render:

- `NODE_ENV=production`
- `PORT=10000`
- `MONGO_URI=<your-mongodb-uri>`
- `JWT_SECRET=<your-secret>`
- `JWT_REFRESH_SECRET=<your-secret>`
- `CLIENT_URL=<your-netlify-url>`

## Alternative: Use render.yaml

If you want Render to auto-detect settings, make sure your `render.yaml` is in the repository root (not in backend folder).

Current location: `backend/render.yaml` ✅ (This is correct)

## Common Render Issues & Fixes

### Issue 1: "Root directory not found"

**Fix:** Set Root Directory to `backend` (not `admas-blog/backend`)

### Issue 2: "Module not found"

**Fix:** Make sure `package.json` is in the root directory you specified

### Issue 3: "Build succeeds but app crashes"

**Fix:** Check environment variables are set correctly

### Issue 4: "Port already in use"

**Fix:** Make sure `PORT` environment variable is set to `10000`

## Deployment Checklist

- [x] Node.js version fixed to 20.x
- [x] Package versions updated
- [x] Code pushed to GitHub
- [ ] Render redeployed
- [ ] Build succeeded
- [ ] Environment variables set
- [ ] Service is live
- [ ] Health check passes: `https://your-backend.onrender.com/api/health`

## Support

If you still have issues:

1. Check Render logs for specific error messages
2. Verify all environment variables are set
3. Make sure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
4. Test MongoDB connection string locally first

---

**Status:** ✅ Fix Applied - Ready to Redeploy
**Last Updated:** January 16, 2026
