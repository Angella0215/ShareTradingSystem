## Vercel deployment (new)

This edition includes `vercel.json`, `api/index.js` and a root `package.json` to deploy the existing React site and Express API in **one Vercel project** using Neon PostgreSQL. Read **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** before deploying, especially the warning about non-persistent KYC/payment documents on Vercel Functions. The original SML styling and local start scripts have not changed.

---

# Original SML design restored — 23 November 2026

**This edition restores the original blue SML HTML interface supplied in `share_trading_system.zip`, using React components.** It retains the November Express/Neon backend and the migrated database. It deliberately uses the original CSS design tokens (`frontend/src/original.css`) rather than deriving styling, navigation or forms from database values.

## Update an existing working installation (recommended)

This ZIP unpacks into the **same `SML_Trading_React_Neon` folder name** as the previous release, so you can overwrite application files without changing URLs, API routes, database credentials, or existing uploaded documents.

Run PowerShell from Downloads, **after downloading this restoration ZIP**:

```powershell
cd "$HOME\Downloads"
# Optional: keep a backup of your currently working project
Copy-Item -Path ".\SML_Trading_React_Neon" -Destination ".\SML_Trading_React_Neon_before_UI_update" -Recurse
Expand-Archive -Path ".\SML_Trading_Original_UI_Neon.zip" -DestinationPath "." -Force
cd ".\SML_Trading_React_Neon"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\start.ps1"
```

Open <http://localhost:5173>. **Do not re-run `setup.ps1` or database import** if your Neon-connected system is already working. The ZIP intentionally contains **no `backend/.env` and no `backend/uploads/*`**. Existing `.env` credentials and uploaded investor identity documents remain untouched by extraction. Keep your previous installation/backup for records and uploaded files. Only the React UI was deliberately changed in this edition; the API remains the same.

- Original route `/` is the original login page, not the redesigned promotional landing page.
- Original top bar, ticker, main navigation, form layout, footer, navy sidebar, blue buttons and light-blue cards have been restored.
- Investor account sections A–H and original menu labels are used; additional working features (transactions, PDF statements and order history) remain accessible in the same sidebar.
- Dashboard, broker and administration home screens now use the original three-stat summary layout and quick links.
- Application forms keep the new API fields required by the Express backend. Page appearance and workflow structure are defined in React, while the database stores and retrieves the submitted records.
- If you want the optional Google login button, configure matching `VITE_GOOGLE_CLIENT_ID` in `frontend/.env.local` and `GOOGLE_CLIENT_ID` in `backend/.env` (not included or set in the ZIP).

**Safety:** This is a prototype; share prices are recorded rather than a live MSE feed. Verify contact and banking details with the institution independently before real money transfers; this project must not be used to handle real orders without a production security/financial compliance review.

---

# SML Share Trading System — React + Express + Neon PostgreSQL

A rebuild of the uploaded **Stockbrokers Malawi Limited** trading portal. This is a university **prototype**, not a live stock-exchange execution system.

## What's included

- `frontend/` — React 18, Vite 6, React Router, responsive interface with investor, broker and admin workspaces.
- `backend/` — Express API adapted from the original system for PostgreSQL via the `pg` package, JWT authentication, private KYC/document uploads, PDF statements, dividend management and order approvals.
- `database/schema.sql` — PostgreSQL table definitions, identities, relationships and indexes. The original export's 10 tables are kept, and the missing operational tables (`audit_log`, `dividends`, `dividend_payouts`) are added.
- `database/original-data.json` — migration snapshot from the previous release; intentionally **not included in this Vercel-ready replacement ZIP** to avoid accidentally publishing private investor records. Existing copies remain untouched when extracting over your working project. The import script still works with a retained local copy.
- `backend/uploads/` — original uploads, served only via authenticated access-control checks. **Private investor files: do not upload this folder to a public repository.**
- `setup.ps1` and `start.ps1` for Windows PowerShell, plus `setup.sh` and `start.sh` for Linux/macOS.

## System prerequisites

- Node.js **20.19+ or 22+** and npm. Node.js 22+ is recommended.
- Working internet access for `npm install` and Neon database access.
- A [Neon PostgreSQL](https://console.neon.tech/) project and its `postgresql://` connection string.
- **No XAMPP, MySQL, phpMyAdmin or local PostgreSQL installation required.**

## Windows setup — preferred

1. Extract the ZIP and open a PowerShell window **inside** the `SML_Trading_React_Neon` folder.
2. Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
```

3. Paste your **Neon connection string** when prompted. The script creates a private `.env` file, generates a JWT secret, installs npm dependencies, creates PostgreSQL tables and asks if you want to import the old records.
4. Start both applications:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start.ps1
```

5. Visit **http://localhost:5173**. Check backend connectivity at **http://localhost:5000/api/health**.

To create a known administrator password (useful if the archived login passwords are unknown):

```powershell
cd backend
npm run user:create
```

Choose the `admin` role, your name, email and strong password. The script can create a new account or update one with the same email. For testing two-broker approval, create **two different** broker accounts (from the Admin screen, or run the CLI twice with `broker` role).

## Manual Windows commands

```powershell
Copy-Item backend\.env.example backend\.env
notepad backend\.env
npm install --prefix backend
npm install --prefix frontend
npm run db:setup --prefix backend
npm run db:import --prefix backend
```

In two separate terminals:

```powershell
cd backend; npm run dev
```

```powershell
cd frontend; npm run dev
```

## Mac / Linux

Create and fill `backend/.env` using `backend/.env.example`, then:

```bash
./setup.sh
./start.sh
```

## Neon connection details

In the Neon console: create or select a project, click **Connect**, copy the connection string (`postgresql://...`), then put it under `DATABASE_URL=` in `backend/.env`. Never expose it in Vite source files, frontend `.env` variables or screenshots. Neon database passwords are not bundled.

A typical private backend `.env` is:

```dotenv
DATABASE_URL=postgresql://<your-user>:<your-password>@<your-host>/<your-database>?sslmode=require
JWT_SECRET=<randomly-generated-long-string>
PORT=5000
CLIENT_URL=http://localhost:5173
```

Optional SMTP setup (`EMAIL_USER` and `EMAIL_APP_PASSWORD`) is needed for password-reset emails. `GOOGLE_CLIENT_ID` is needed before Google login can work; the React UI uses email/password by default.

## Source data and limitations

The submitted archive includes a **valid SQL export dated 18 October 2026**, containing **119 records across 10 tables**, plus a raw XAMPP/MariaDB folder containing `.frm` and `.ibd` files. This rebuild imports the SQL snapshot; it does **not** claim to have forensically recovered more recent records from the raw database pages. The snapshot can be older than the damaged XAMPP directory.

The original SQL export has **no values for `available_shares` or `total_shares_issued`**. Available-share quantities start at zero. To process future purchases, an administrator must set the correct share availability under **Companies & prices**. Do not interpret zero as an actual current market figure. The original export also does not contain the historical audit-log or dividend records present in the raw data directory; the new tables initially start empty.

The original archived records (not bundled in this Vercel-ready update) include demo/test and personally identifying information, KYC documents, and historical password hashes. **Use a private Neon project and do not circulate the ZIP publicly.** For a clean demo, choose not to import the old data, register new investors, create users via `npm run user:create` and enter validated market data through Admin.

Historical market prices here are recorded/demo data, **not real-time exchange prices**. The system does not execute live Malawi Stock Exchange trades, collect payments, or send money to investor accounts. Proof-of-payment files are demonstration records only.

The original trade-processing code is retained for feature parity. It is **not certified for live financial use**. A production rollout would require formal security review, transactional race-condition testing, payment reconciliation, regulatory/financial compliance checks, monitoring, encryption and retention controls for KYC files, and integration with authoritative trading, settlement and price systems.

## Main functionality

**Investor** — login/registration, trading account opening with PDF KYC documents, market and price history, buy requests (payment proof), sell requests, portfolio, order status/cancellation, deal notes, PDF statements, dividend entitlements and broker messaging.

**Broker** — KYC approvals, FIFO buy/sell approval queue, separate first/final approvals, rejections, order history, dividend approvals and payment recording, and messaging.

**Administrator** — broker creation, user passwords, market-price and available-share updates, dividends declaration/payout calculation, and audit trail.

## Common troubleshooting

- **`DATABASE_URL` missing** — open `backend/.env` and paste the entire Neon connection string. Restart the API.
- **API says database unavailable** — check your Neon project status, network, SSL and credentials. Run `npm run db:setup --prefix backend` again.
- **`npm` not found** — install current LTS Node.js and restart PowerShell.
- **`EADDRINUSE`** — something already runs on port 5000 or 5173. Stop the other app before starting.
- **Wrong role or lost password** — `cd backend; npm run user:create` and create/update your user.
- **Can't buy shares** — investor must be verified and admin must enter available share quantities; default is zero because the old export omitted this field.
- **Account opening requires 3 PDFs** — files are validated on upload, each max 5 MB.
- **Password reset emails don't arrive** — configure SMTP credentials or reset a user password from the admin portal.
- **Login fails for old demo users** — use their original password (hashes were retained) or create/update credentials using the CLI.

## Developer notes

- Backend uses a small PostgreSQL adapter in `backend/config/db.js` to preserve the shape of mysql2 results used by the original controller layer, with parameterized `$1` queries and PostgreSQL-compatible date functions.
- `npm run db:setup` is non-destructive: creates missing tables and indexes. `npm run db:import` uses `ON CONFLICT DO NOTHING`, so it can be rerun without duplicating existing IDs.
- Local React requests to `/api` are proxied to Express by Vite. For separate hosting, configure `VITE_API_URL` and `CLIENT_URL` to match the deployment.
- Never commit `backend/.env`, `backend/uploads/` or `database/original-data.json` to a public repository.
#   S h a r e T r a d i n g S y s t e m  
 