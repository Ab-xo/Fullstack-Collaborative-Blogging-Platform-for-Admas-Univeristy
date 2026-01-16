# 🔧 Fix Netlify Network Error

## Problem

Your Netlify frontend is deployed but shows "Network Error" when trying to login because it's trying to connect to `localhost:4001` instead of your Render backend.

## Root Cause

The `.env` file in your repository is for **local development only**. Netlify doesn't use this file - it needs environment variables configured in the Netlify dashboard.

---

## Solution: Configure Netlify Environment Variables

### Step 1: Get Your Render Backend URL

First, find your Render backend URL:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service
3. Copy the URL (should look like: `https://admas-blog-backend.onrender.com` or similar)

**Important:** Make sure your backend is deployed and running on Render first!

---

### Step 2: Add Environment Variables to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** and add these:

#### Required Variables:

```env
VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api
VITE_SOCKET_URL=https://YOUR-RENDER-URL.onrender.com
VITE_APP_NAME=Admas University Blog
```

**Replace `YOUR-RENDER-URL` with your actual Render backend URL!**

#### Firebase Variables (for Google Sign-In):

```env
VITE_FIREBASE_API_KEY=AIzaSyD6JRbJI4zfJ6xpIZwc7DisD3aHPzPSXS8
VITE_FIREBASE_AUTH_DOMAIN=admas-blog.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=admas-blog
VITE_FIREBASE_STORAGE_BUCKET=admas-blog.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1008280273110
VITE_FIREBASE_APP_ID=1:1008280273110:web:10ed6f202d475680270977
```

#### Optional Cloudinary Variables (if using direct uploads):

```env
VITE_CLOUDINARY_CLOUD_NAME=ddojdiqzk
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

---

### Step 3: Redeploy Your Site

After adding the environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete (2-3 minutes)

---

### Step 4: Update Backend CLIENT_URL

Your backend also needs to know about your Netlify URL for CORS:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service
3. Go to **Environment** tab
4. Find `CLIENT_URL` variable
5. Update it to your Netlify URL: `https://YOUR-SITE-NAME.netlify.app`
6. Click **Save Changes**
7. Render will automatically redeploy

---

## Quick Copy-Paste Template

Here's a template with your Firebase config already filled in:

### For Netlify Environment Variables:

```
Variable Name: VITE_API_URL
Value: https://YOUR-RENDER-URL.onrender.com/api

Variable Name: VITE_SOCKET_URL
Value: https://YOUR-RENDER-URL.onrender.com

Variable Name: VITE_APP_NAME
Value: Admas University Blog

Variable Name: VITE_FIREBASE_API_KEY
Value: AIzaSyD6JRbJI4zfJ6xpIZwc7DisD3aHPzPSXS8

Variable Name: VITE_FIREBASE_AUTH_DOMAIN
Value: admas-blog.firebaseapp.com

Variable Name: VITE_FIREBASE_PROJECT_ID
Value: admas-blog

Variable Name: VITE_FIREBASE_STORAGE_BUCKET
Value: admas-blog.firebasestorage.app

Variable Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 1008280273110

Variable Name: VITE_FIREBASE_APP_ID
Value: 1:1008280273110:web:10ed6f202d475680270977
```

---

## Verification Steps

After redeploying both frontend and backend:

### 1. Check Backend is Running

Visit: `https://YOUR-RENDER-URL.onrender.com/api/health`

Should return:

```json
{
  "status": "ok",
  "timestamp": "...",
  "services": { ... }
}
```

### 2. Check Frontend Environment

Open your Netlify site, open browser console (F12), and type:

```javascript
console.log(import.meta.env.VITE_API_URL);
```

Should show: `https://YOUR-RENDER-URL.onrender.com/api`

If it shows `undefined` or `localhost`, the environment variables aren't set correctly.

### 3. Test Login

Try logging in with a test account. You should see:

- Network requests going to your Render URL (check Network tab in browser DevTools)
- No CORS errors
- Successful login

---

## Common Issues & Fixes

### Issue 1: Still Getting Network Error

**Check:**

- Environment variables are saved in Netlify
- You triggered a new deploy after adding variables
- Backend is running on Render (not sleeping)
- Backend URL is correct (no trailing slash)

### Issue 2: CORS Error

**Error:** `Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS`

**Fix:**

- Update `CLIENT_URL` in Render to match your Netlify URL exactly
- Make sure there's no trailing slash
- Redeploy backend after changing

### Issue 3: Backend is Sleeping

Render free tier puts services to sleep after 15 minutes of inactivity.

**Fix:**

- Visit your backend URL to wake it up
- Wait 30-60 seconds for it to start
- Try login again

### Issue 4: Environment Variables Not Working

**Check:**

- Variable names are EXACTLY as shown (case-sensitive)
- No extra spaces in values
- You redeployed after adding variables

---

## Testing Checklist

After configuration:

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Console shows correct API URL (not localhost)
- [ ] Login form submits without network error
- [ ] Can create an account
- [ ] Can login successfully
- [ ] Dashboard loads after login
- [ ] No CORS errors in console

---

## Example URLs

**Backend (Render):**

```
https://admas-blog-backend.onrender.com
https://admas-blog-backend.onrender.com/api/health
https://admas-blog-backend.onrender.com/api/auth/login
```

**Frontend (Netlify):**

```
https://admas-university-blog.netlify.app
https://your-site-name.netlify.app
```

---

## Need Help?

If you're still getting errors:

1. **Check Netlify Build Logs:**

   - Go to Deploys → Click on latest deploy → View logs
   - Look for environment variable warnings

2. **Check Render Logs:**

   - Go to your service → Logs tab
   - Look for CORS or connection errors

3. **Check Browser Console:**

   - Open DevTools (F12)
   - Look at Console tab for errors
   - Look at Network tab to see where requests are going

4. **Verify Environment Variables:**
   - Netlify: Site settings → Environment variables
   - Render: Service → Environment tab

---

## Quick Fix Command

If you need to redeploy both services:

```bash
# Trigger Netlify redeploy
# Go to Netlify Dashboard → Deploys → Trigger deploy

# Trigger Render redeploy
# Go to Render Dashboard → Manual Deploy → Deploy latest commit
```

---

**Status:** Ready to configure  
**Time Required:** 5-10 minutes  
**Difficulty:** Easy

Once configured, your app will work perfectly! 🚀
