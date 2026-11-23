# Hosting the SML React + Express app on Vercel

This package includes `vercel.json`, `api/index.js` and a root `package.json`. It keeps the original blue React interface, routes and local PowerShell workflow, and uses **one Vercel project** for the React site and Express API.

## Vercel project settings

1. Use a **private** GitHub repository. Upload the contents of the `SML_Trading_React_Neon` folder (not the outer directory) to it. The old database snapshot is deliberately excluded from this replacement ZIP. Never commit `backend/.env`, uploaded identity documents or `database/original-data.json`.
2. In Vercel, **Add New > Project** and import the repository. Set **Root Directory** to the repository root (`./`, not `frontend` or `backend`).
3. Framework Preset: **Vite**. Build Command: `npm run build`. Output Directory: `frontend/dist`. Install Command: `npm install`. The root `vercel.json` also specifies these build values.
4. Under **Settings > Environment Variables**, configure at least:

   - `DATABASE_URL` — your existing Neon PostgreSQL connection string (keep private).
   - `JWT_SECRET` — a long, securely generated secret (keep private). Keep the same as the already-working installation if existing login tokens should remain usable.
   - `CLIENT_URL` — your deployed domain, e.g. `https://your-app.vercel.app` (optional for same-origin API traffic, recommended).
   - `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `GOOGLE_CLIENT_ID` only if those features are enabled. For Google login, `VITE_GOOGLE_CLIENT_ID` must be set too, because Vite includes it in the frontend build. Never prefix database credentials or JWT secrets with `VITE_`.

5. Click **Deploy**. Then test these URLs on the same domain:

   - `/` → original SML login page
   - `/api/health` → `{ "status": "ok", "database": "connected", "result": 2 }` if Neon is reachable.

The Vercel routing config sends `/api/*` to the Express function and other frontend paths to React's `index.html`, including browser refreshes on deep links. The React frontend uses the relative `/api` URL, so **do not set `VITE_API_URL`** for this one-domain setup.

## Local operation is unchanged

You can still use the original `start.ps1` or run the backend and frontend in separate terminals. Do not run `setup.ps1` or `db:import` again if your Neon database already contains your real records. Your existing `backend/.env` file is *not included* in this ZIP and will not be overwritten when you extract it over your working project.

## Critical limitation: investor documents and payment proof uploads

**Vercel Functions have an ephemeral, mostly read-only filesystem.** The existing application saves PDF account-opening documents and payment proofs to the local `uploads/` folder; this will **not persist on Vercel**. Do **not** submit real documents through the deployed instance until private cloud storage (for example private Vercel Blob or a suitably secured object-storage bucket) is integrated into the upload and authenticated-download routes. An object store is not the same as Neon; PostgreSQL alone does not store these files. Historical local PDFs are not migrated automatically by deploying the project.

Since these include national IDs, bank statements and other sensitive documents, choose **private** storage with server-side authorization and access logs. Public Blob URLs are not appropriate.

**Do not treat this prototype as a live financial exchange or real-money trading platform without a security, compliance and correctness review.**

## If the deployment fails

- **Build fails**: Check root directory = repo root, and package installation/build logs.
- **404 on `/api/health`**: Ensure `api/index.js` and root `vercel.json` were uploaded, and no dashboard overrides conflict.
- **503 on `/api/health`**: Check `DATABASE_URL` in Vercel environment settings, Neon SSL/connectivity, and redeploy.
- **Login issue**: Check `JWT_SECRET`; to register user data, the existing Neon schema must already be present.
- **Upload/ID documents**: Expected limitation on serverless filesystems; use private object storage before enabling live uploads.
- **Browser route refresh fails**: Confirm the SPA rewrite in `vercel.json` is deployed.

Official docs: https://vercel.com/docs/frameworks/backend/express ; https://vercel.com/docs/frameworks/frontend/vite ; https://vercel.com/docs/functions/runtimes
