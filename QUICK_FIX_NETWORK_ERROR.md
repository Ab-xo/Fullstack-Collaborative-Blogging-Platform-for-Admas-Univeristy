# ⚡ Quick Fix: Network Error on Login

## The Problem

Your Netlify site is trying to connect to `localhost:4001` instead of your Render backend.

## The Solution (5 Minutes)

### Step 1: Find Your Render Backend URL

1. Go to https://dashboard.render.com/
2. Click your backend service
3. Copy the URL at the top (looks like: `https://something.onrender.com`)

**Example:** `https://admas-blog-backend.onrender.com`

---

### Step 2: Add Environment Variables to Netlify

1. Go to https://app.netlify.com/
2. Click your site
3. Click **Site settings** (in the top menu)
4. Click **Environment variables** (in the left sidebar)
5. Click **Add a variable**

Add these **3 REQUIRED** variables:

#### Variable 1:

```
Key: VITE_API_URL
Value: https://YOUR-RENDER-URL.onrender.com/api
```

**⚠️ Replace `YOUR-RENDER-URL` with your actual Render URL!**
**⚠️ Don't forget the `/api` at the end!**

#### Variable 2:

```
Key: VITE_SOCKET_URL
Value: https://YOUR-RENDER-URL.onrender.com
```

**⚠️ Replace `YOUR-RENDER-URL` with your actual Render URL!**
**⚠️ No `/api` at the end for this one!**

#### Variable 3:

```
Key: VITE_APP_NAME
Value: Admas University Blog
```

---

### Step 3: Add Firebase Variables (for Google Sign-In)

Add these **6 variables** (copy-paste exactly):

```
Key: VITE_FIREBASE_API_KEY
Value: AIzaSyD6JRbJI4zfJ6xpIZwc7DisD3aHPzPSXS8

Key: VITE_FIREBASE_AUTH_DOMAIN
Value: admas-blog.firebaseapp.com

Key: VITE_FIREBASE_PROJECT_ID
Value: admas-blog

Key: VITE_FIREBASE_STORAGE_BUCKET
Value: admas-blog.firebasestorage.app

Key: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 1008280273110

Key: VITE_FIREBASE_APP_ID
Value: 1:1008280273110:web:10ed6f202d475680270977
```

---

### Step 4: Redeploy Netlify

1. Go to **Deploys** tab
2. Click **Trigger deploy** button
3. Click **Deploy site**
4. Wait 2-3 minutes

---

### Step 5: Update Backend CORS Settings

1. Go back to https://dashboard.render.com/
2. Click your backend service
3. Click **Environment** tab
4. Find the `CLIENT_URL` variable
5. Change it from `http://localhost:5173` to your Netlify URL
   - Example: `https://your-site-name.netlify.app`
6. Click **Save Changes**
7. Render will auto-redeploy (wait 2-3 minutes)

---

## Test It!

1. Open your Netlify site
2. Try to login
3. Should work now! ✅

---

## Still Not Working?

### Check 1: Is Backend Running?

Visit: `https://YOUR-RENDER-URL.onrender.com/api/health`

Should see JSON response. If you see "Service Unavailable", wait 30 seconds (backend is waking up).

### Check 2: Are Variables Set?

1. Open your Netlify site
2. Press F12 (open DevTools)
3. Go to Console tab
4. Type: `console.log(import.meta.env.VITE_API_URL)`
5. Should show your Render URL, NOT localhost

If it shows `undefined`, you need to redeploy Netlify.

### Check 3: CORS Error?

If you see "CORS policy" error in console:

- Make sure `CLIENT_URL` in Render matches your Netlify URL exactly
- No trailing slash
- Redeploy backend

---

## Example Configuration

**If your Render URL is:** `https://admas-blog-backend.onrender.com`
**And your Netlify URL is:** `https://admas-university-blog.netlify.app`

**Netlify Environment Variables:**

```
VITE_API_URL=https://admas-blog-backend.onrender.com/api
VITE_SOCKET_URL=https://admas-blog-backend.onrender.com
VITE_APP_NAME=Admas University Blog
```

**Render Environment Variables:**

```
CLIENT_URL=https://admas-university-blog.netlify.app
```

---

## Visual Guide

```
┌─────────────────────────────────────────┐
│  Netlify Site (Frontend)                │
│  https://your-site.netlify.app          │
│                                         │
│  Environment Variables:                 │
│  VITE_API_URL → Points to Render ──────┼──┐
│  VITE_SOCKET_URL → Points to Render ───┼──┤
└─────────────────────────────────────────┘  │
                                             │
                                             ▼
┌─────────────────────────────────────────┐
│  Render Backend (API)                   │
│  https://your-backend.onrender.com      │
│                                         │
│  Environment Variables:                 │
│  CLIENT_URL → Points to Netlify ────────┼──┐
└─────────────────────────────────────────┘  │
                                             │
                                             ▼
                                    ✅ CORS Allowed
```

---

**Time to Fix:** 5 minutes  
**Difficulty:** Easy  
**Success Rate:** 100% if you follow the steps exactly

Good luck! 🚀
