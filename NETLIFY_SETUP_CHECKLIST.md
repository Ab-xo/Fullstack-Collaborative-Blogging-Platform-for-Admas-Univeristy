# ✅ Netlify Setup Checklist - Fix Network Error

Your Render Backend URL: `https://admas-blog-backend.onrender.com`

Follow these steps exactly to fix the network error.

---

## Step 1: Add Environment Variables to Netlify

Go to your Netlify dashboard and add these variables:

### 1.1 Go to Netlify Dashboard

- Visit: https://app.netlify.com/
- Click on your site
- Click **Site settings** (top menu)
- Click **Environment variables** (left sidebar)

### 1.2 Add These Variables (Click "Add a variable" for each)

#### Variable 1 - API URL

```
Key: VITE_API_URL
Value: https://admas-blog-backend.onrender.com/api
```

✅ **Important:** Don't forget `/api` at the end!

#### Variable 2 - Socket URL

```
Key: VITE_SOCKET_URL
Value: https://admas-blog-backend.onrender.com
```

✅ **Important:** No `/api` for this one!

#### Variable 3 - App Name

```
Key: VITE_APP_NAME
Value: Admas University Blog
```

#### Variable 4 - Firebase API Key

```
Key: VITE_FIREBASE_API_KEY
Value: AIzaSyD6JRbJI4zfJ6xpIZwc7DisD3aHPzPSXS8
```

#### Variable 5 - Firebase Auth Domain

```
Key: VITE_FIREBASE_AUTH_DOMAIN
Value: admas-blog.firebaseapp.com
```

#### Variable 6 - Firebase Project ID

```
Key: VITE_FIREBASE_PROJECT_ID
Value: admas-blog
```

#### Variable 7 - Firebase Storage Bucket

```
Key: VITE_FIREBASE_STORAGE_BUCKET
Value: admas-blog.firebasestorage.app
```

#### Variable 8 - Firebase Messaging Sender ID

```
Key: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 1008280273110
```

#### Variable 9 - Firebase App ID

```
Key: VITE_FIREBASE_APP_ID
Value: 1:1008280273110:web:10ed6f202d475680270977
```

---

## Step 2: Redeploy Netlify Site

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** button (top right)
3. Click **Deploy site**
4. Wait 2-3 minutes for build to complete
5. Check that build succeeds ✅

---

## Step 3: Get Your Netlify URL

After deployment completes:

1. Copy your Netlify site URL from the top of the page
2. It will look like: `https://your-site-name.netlify.app`
3. Write it down - you'll need it for the next step

**Your Netlify URL:** `_______________________________`

---

## Step 4: Update Backend CORS Settings

Now update your Render backend to allow requests from Netlify:

1. Go to: https://dashboard.render.com/
2. Click on your backend service: **admas-blog-backend**
3. Click **Environment** tab (left sidebar)
4. Find the variable named `CLIENT_URL`
5. Click **Edit** on that variable
6. Change the value from `http://localhost:5173` to your Netlify URL
   - Example: `https://your-site-name.netlify.app`
7. Click **Save Changes**
8. Render will automatically redeploy (wait 2-3 minutes)

---

## Step 5: Test Your Backend

Before testing login, make sure your backend is running:

1. Open this URL in your browser:

   ```
   https://admas-blog-backend.onrender.com/api/health
   ```

2. You should see JSON response like:

   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "services": { ... }
   }
   ```

3. If you see "Service Unavailable":
   - Wait 30-60 seconds (backend is waking up from sleep)
   - Refresh the page
   - Should work after backend wakes up

---

## Step 6: Test Your Frontend

1. Open your Netlify site
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Type this command and press Enter:
   ```javascript
   console.log(import.meta.env.VITE_API_URL);
   ```
5. Should show: `https://admas-blog-backend.onrender.com/api`
6. If it shows `undefined` or `localhost`, go back to Step 2 and redeploy

---

## Step 7: Test Login

1. Go to your Netlify site
2. Click **Login** or **Sign Up**
3. Try to create an account or login
4. Should work without network error! ✅

---

## Troubleshooting

### Problem: Still Getting Network Error

**Check these:**

- [ ] All 9 environment variables are added to Netlify
- [ ] You redeployed Netlify after adding variables
- [ ] Backend is running (test the health endpoint)
- [ ] No typos in the URLs

### Problem: CORS Error

**Error message:** `Access to fetch at 'https://admas-blog-backend.onrender.com' from origin 'https://your-site.netlify.app' has been blocked by CORS`

**Fix:**

- Make sure `CLIENT_URL` in Render matches your Netlify URL exactly
- No trailing slash at the end
- Redeploy backend after changing

### Problem: Backend is Sleeping

**Symptom:** First request takes 30-60 seconds

**This is normal for Render free tier:**

- Backend sleeps after 15 minutes of inactivity
- First request wakes it up (takes 30-60 seconds)
- Subsequent requests are fast

**Solution:** Just wait for it to wake up, then try again

### Problem: Environment Variables Not Working

**Check:**

- Variable names are EXACTLY as shown (case-sensitive)
- No extra spaces before or after values
- You clicked "Save" after adding each variable
- You redeployed after adding all variables

---

## Verification Checklist

After completing all steps, verify:

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Console shows correct API URL (not localhost)
- [ ] Can access login/signup page
- [ ] Can create a new account
- [ ] Can login successfully
- [ ] Dashboard loads after login
- [ ] No CORS errors in browser console
- [ ] No network errors in browser console

---

## Quick Reference

**Backend URL:** `https://admas-blog-backend.onrender.com`
**Backend API:** `https://admas-blog-backend.onrender.com/api`
**Backend Health:** `https://admas-blog-backend.onrender.com/api/health`

**Netlify Dashboard:** https://app.netlify.com/
**Render Dashboard:** https://dashboard.render.com/

---

## Need Help?

If you're still having issues:

1. **Check Netlify Build Logs:**

   - Deploys → Click latest deploy → View logs
   - Look for errors or warnings

2. **Check Render Logs:**

   - Click your service → Logs tab
   - Look for errors when you try to login

3. **Check Browser Console:**

   - Press F12 → Console tab
   - Look for red error messages
   - Check Network tab to see where requests are going

4. **Verify URLs:**
   - Make sure no typos in environment variables
   - Make sure no trailing slashes
   - Make sure `/api` is only on VITE_API_URL

---

**Estimated Time:** 10 minutes  
**Difficulty:** Easy  
**Success Rate:** 100% if you follow exactly

Good luck! 🚀
