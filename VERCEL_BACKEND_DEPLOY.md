# Deploying the Backend to Vercel

> **Heads up:** Vercel is designed for frontend apps and serverless functions.
> It *can* run an Express app, but requires a small adapter file.
> If you want zero friction, consider **Railway** or **Render** instead — you just connect the repo and they run `npm start` with no extra config.
> That said, here's the full Vercel setup.

---

## 1. Add a Vercel adapter file

Vercel needs a serverless entry point. Create this file at `backend/api/index.js`:

```js
import app from '../index.js'
export default app
```

Then update `backend/index.js` — **export the app** in addition to starting the server:

```js
// At the bottom of index.js, replace the startServer() call with:
startServer()
export default app   // ← add this line
```

---

## 2. Add `vercel.json` to the backend folder

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

---

## 3. Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables**.
All environments (Production, Preview, Development) unless noted.

| Variable | Value | Notes |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | `<random 64-char string>` | Run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` to generate |
| `JWT_REFRESH_SECRET` | `<random 64-char string>` | Must be **different** from the access secret |
| `PORT` | `3000` | Vercel ignores this but the app requires it to be set |
| `FRONTEND_URL` | `https://your-app.netlify.app` | Your frontend's deployed URL — used for CORS |
| `SPOTIFY_CLIENT_ID` | `...` | From your Spotify Developer Dashboard |
| `SPOTIFY_CLIENT_SECRET` | `...` | From your Spotify Developer Dashboard |
| `NODE_ENV` | `production` | Enables `secure` cookies and `sameSite: none` |

---

## 4. MongoDB Atlas — allow Vercel IPs

Vercel uses dynamic IPs, so you need to whitelist all IPs in Atlas:

1. Go to **Atlas → Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** → `0.0.0.0/0`
4. Confirm

---

## 5. Deploy

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# From the backend folder
cd backend
vercel
```

Follow the prompts. On subsequent deploys: `vercel --prod`

Or connect the repo in the Vercel dashboard and set the **Root Directory** to `backend`.

---

## 6. After deploying — update FRONTEND_URL

Once your backend is live (e.g. `https://sunami-api.vercel.app`), go back to your **frontend's** environment variables and update the API base URL to point to it.

---

## Cookie caveat

The refresh token cookie is already configured correctly for cross-origin:
- `sameSite: 'none'` in production ✅
- `secure: true` in production ✅
- `httpOnly: true` ✅

This works as long as `NODE_ENV=production` is set in Vercel.
