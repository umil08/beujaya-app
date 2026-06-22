# BEUJAYA — server-auth (Vercel)

FB affiliate tool UI demo with **real server-side login**. Credentials live only in
environment variables — they are never in the page source.

- `index.html` posts to `/api/login`, which verifies the username/password **on the server**
  and sets a signed, HttpOnly session cookie.
- Gated pages (`dashboard`, `accounts`, `settings`) call `/api/me` on load; the cookie is
  verified server-side (HMAC) and unauthenticated visitors are redirected to login.
- `/api/logout` clears the session.

> The "post" action and account data are still **mocked** — nothing is sent to Facebook
> and no real cookies are stored. This is a UI/portfolio demo.

## Deploy to Vercel (free, no credit card)

1. Push this repo to GitHub (already done at `umil08/beujaya-app`).
2. Go to **https://vercel.com/new** → **Continue with GitHub** (free, no card).
3. **Import** `beujaya-app`.
4. Open **Environment Variables** and add:
   | Key | Value |
   |-----|-------|
   | `BEUJAYA_USER` | your username |
   | `BEUJAYA_PASS` | your password |
5. **Deploy**. In ~1 min you get a URL like `https://beujaya-app.vercel.app`.

No `vercel.json` needed — Vercel serves the static files and the `/api/*.js` serverless
functions automatically. If you forget the env vars, login returns a clear "Server not
configured" message.

## Notes
- The signing key is derived from `BEUJAYA_USER` + `BEUJAYA_PASS`, so changing the password
  invalidates existing sessions. No separate secret to manage.
- Session cookie lasts 24h.
