# IMS — Inventory Management System

A small role-based Inventory Management System (IMS). It provides product and supplier management, low-stock alerts, reports with charts, and a CSV export for stock data.

This repository includes a React + Vite frontend and a Node.js + Express backend with a MySQL database.

## Key features

- Role-based users: `owner` and `supplier` with different permissions
- Product & supplier CRUD
- Owner-only supplier onboarding (no public registration)
- Database triggers create low-stock `notifications` automatically
- Notifications UI with unread indicator (red dot)
- Reports page with charts and an Export CSV button (low-stock items first)
- Responsive, presentation-ready UI with consistent table styles

## Tech stack / libraries

- Frontend: React, Vite, react-router, axios, Bootstrap, chart.js (react-chartjs-2)
- Backend: Node.js, Express, mysql2, express-session, dotenv, cors
- Database: MySQL

## Quick start (development)

1. Create & seed the MySQL database using `server/schema.sql` (or import it via your DB tool).

2. Start the server (example using PowerShell):

```powershell
cd d:/kamba-task/IMS/server
npm install
# configure .env for DB and session secret, or ensure defaults are set
node server.js
```

3. Start the client:

```powershell
cd d:/kamba-task/IMS/client
npm install
npm run dev
```

4. Open the Vite URL shown in the terminal (usually http://localhost:5173) and login with seeded accounts (or create an owner in the DB).

## Useful files

- `server/schema.sql` — database schema, triggers, and seed data
- `server/` — backend: `server.js`, `controllers/`, `routes/`, `middleware/`
- `client/src/api.js` — client API wrappers
- `client/src/pages/` — main UI pages: `Products`, `Suppliers`, `Reports`, `Notifications`, `Dashboard`, `Login`
- `client/src/index.css` — theme & table styles (includes `.table-presentable` and `.notif-dot`)
- `PROJECT_REPORT.md` — detailed project report

## Notes & recommended next steps

- Security: passwords are currently stored plaintext in this demo. Migrate to bcrypt hashing and use a persistent session store (Redis) for production.
- Notifications: currently implemented with DB triggers and client polling; consider WebSockets/SSE for realtime delivery.
- CSV export: client-side generation is fine for small datasets; for large datasets consider server-side streaming.
- Add automated tests (server + client) and CI for production readiness.

If you want, I can:
- Run the dev servers and validate UI behaviors live (notifications dot, CSV export, product update).
- Create a GitHub-ready `README.md` variant (with badges) or add Dockerfiles and a `docker-compose` for local dev.

---

Created from `PROJECT_REPORT.md`. For full details see `PROJECT_REPORT.md`.
