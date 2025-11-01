# Inventory Management System (IMS) — Project Report

Date: 2025-10-31

This document summarizes the Inventory Management System (IMS) project: context and problem statement, architecture, features, libraries, major files, API surface, database highlights, UI behavior, known limitations, setup/run instructions, and recommended next steps.

---

## Problem statement
Provide a small role-based Inventory Management System where an inventory owner and suppliers can manage products and suppliers, receive low-stock alerts, and view reports. Key requirements addressed:

- Product and supplier CRUD with role-based restrictions (owner vs supplier).
- Owner-controlled supplier onboarding (no public supplier self-registration).
- Low-stock alerts created in the database and surfaced to users.
- Reports (charts + low-stock table) and ability to export stock data as CSV (low-stock items first).
- Responsive, presentation-ready frontend UI and a notification indicator for unread alerts.

Success criteria include: role-based access works, DB triggers create notifications for low-stock products, Reports page shows charts and CSV export works, and a visual notification indicator appears when unread notifications exist.

---

## High-level architecture

- Frontend: React (Vite), React Router, Bootstrap + custom CSS, Chart.js (react-chartjs-2), Axios for API calls.
- Backend: Node.js + Express, MySQL using `mysql2` promise pool.
- Sessions: `express-session` (demo, in-memory store).
- Database: MySQL with tables `users`, `suppliers`, `products`, `notifications`. Triggers create notifications on product insert/update when low-stock.

Client communicates with server over JSON HTTP and uses session cookie for authentication (axios is configured withCredentials).

---

## Major features

- Role-based authentication: owner and supplier roles that determine allowed actions.
- Owner-only supplier creation: owners can create suppliers and optionally create linked supplier accounts (transactional on server).
- Products CRUD:
  - Suppliers manage only their products.
  - Owners manage all products.
- Low-stock notifications:
  - Database triggers insert rows into `notifications` for new/updated products where quantity <= min_stock.
  - Notifications endpoints let users fetch and mark-as-read.
  - Client shows a small red dot on the bell when there are unread notifications, updated by polling and event dispatch.
- Reports:
  - Category distribution (pie) and stock-per-product (bar) charts.
  - Low-stock table styled with a polished, responsive design and mobile stacking.
  - Export CSV button: builds a CSV in the browser with low-stock items first and triggers a download `stock_report_YYYY-MM-DD.csv`.
- UI polish and responsive layout: theme tokens, cards, rounded table rows, mobile stacking via `data-label` attributes.

---

## Libraries and tooling

Client (see `client/package.json` for exact versions):
- react, react-dom, react-router-dom
- vite (dev & build)
- axios (HTTP)
- bootstrap (layout & utilities)
- chart.js + react-chartjs-2 (charts)
- Inter font (UI)

Server (see `server/package.json`):
- express
- mysql2 (promise pool)
- express-session
- dotenv
- cors

Other:
- MySQL (server-side DB)
- (Optional) nodemon for dev server restarts

---

## Important files (overview)

Frontend (`client/`):
- `src/api.js` — axios client and API helper functions (getProducts, createProduct, updateProduct, getNotifications, markNotificationRead, etc.)
- `src/App.jsx` — main app, navbar, notification handling and routing
- `src/index.css` & `src/App.css` — theme tokens, layouts, table and card styles
- `src/pages/` — `Dashboard.jsx`, `Products.jsx`, `Suppliers.jsx`, `Reports.jsx`, `Notifications.jsx`, `Login.jsx`

Backend (`server/`):
- `server.js` — Express app and route mounting
- `db.js` — MySQL connection pool
- `controllers/` — `productsController.js`, `suppliersController.js`, `authController.js`, `notificationsController.js`
- `routes/` — `products.js`, `suppliers.js`, `auth.js`, `notifications.js`
- `middleware/auth.js` — `requireLogin`, `requireOwner`, `requireOwnerOrOwnsProduct`
- `schema.sql` — DB schema, triggers, seeded data

---

## API surface (selected endpoints)

- POST `/api/auth/login` — login, creates session
- GET `/api/products` — list products (suppliers see only their own)
- POST `/api/products` — create product (supplier forced to their supplier_id)
- GET `/api/products/:id` — fetch product details
- PUT `/api/products/:id` — update product (owner or owning supplier)
- DELETE `/api/products/:id` — delete product
- GET `/api/lowstock` — quick low-stock report
- GET `/api/suppliers` — list suppliers
- POST `/api/suppliers` — owner creates supplier (+ optional supplier user)
- GET `/api/notifications` — user's notifications
- PUT `/api/notifications/:id/read` — mark notification read

See `client/src/api.js` for client wrapper usage.

---

## Database highlights

Tables (high-level):
- `users` (id, username, password, role, supplier_id, display_name)
  - Note: passwords stored plaintext in this demo. MUST be migrated to hashed storage for production.
- `suppliers` (id, name, contact, address)
- `products` (id, name, category, quantity, min_stock, price, supplier_id)
- `notifications` (id, user_id nullable, supplier_id nullable, product_id, message, is_read, created_at)

Triggers in `schema.sql`:
- `AFTER INSERT` and `AFTER UPDATE` on `products` that insert rows into `notifications` when `quantity <= min_stock`.

---

## UI / UX notes

- Theme: teal primary, coral accent; Inter font; card-based UI with soft shadow and rounded corners.
- Tables: `.table-presentable` style applied across pages providing rounded rows, hover lift, and mobile stacked layout via `data-label` attributes.
- Reports page: two charts on top (pie & bar), low-stock card below with an Export CSV button placed at the card's top-right.
- Notifications: small red dot appears next to the bell icon when there are unread notifications; client polls every 12 seconds and also listens for `notifications:changed` events.

---

## Known limitations & security notes

- Passwords: currently plaintext in DB. Replace with bcrypt (or other modern hashing) before production.
- Session store: in-memory `express-session` not suitable for production; use Redis or a DB-backed store.
- Input validation: add request validators (Joi, zod) to prevent malformed data.
- Notification delivery: currently DB triggers + client polling; for real-time push use WebSockets or Server-Sent Events.
- CSV export: client-side generation is fine for small datasets; for large datasets, generate server-side to stream the file.
- No tests included — add unit & integration tests.

---

## How to run (development)

Prereqs: Node.js, npm, MySQL.

1. Database: create a MySQL database and import `server/schema.sql` (seeds included).

2. Server (example using PowerShell):

```powershell
cd d:/kamba-task/IMS/server
npm install
# set environment variables (.env) or edit server config for DB connection and SESSION secret
node server.js
# or for dev with automatic reload
npx nodemon server.js
```

3. Client:

```powershell
cd d:/kamba-task/IMS/client
npm install
npm run dev   # starts Vite dev server
```

4. Open the client URL shown by Vite (usually http://localhost:5173) and login with seeded accounts (or create an owner in the DB manually). See `server/schema.sql` for seeds.

---

## How to test specific behaviors

- Product update failing: check request payload in browser DevTools -> Network tab for PUT `/api/products/:id`. Ensure numeric fields are numbers (client normalizes them) and `supplier_id` is not an empty string.
- New notification appearance: update or create a product where `quantity <= min_stock`. The DB trigger inserts a notification row; the client polls and will show the red dot on the bell when unread notifications exist.
- CSV export: open Reports page, click `Export CSV` — it builds a CSV in-browser with low-stock items first and triggers download.

---

## Recommended next steps (priority)

1. Security hardening:
   - Hash passwords with bcrypt.
   - Use persistent session store (Redis).
   - Add input validation and rate limiting.
2. Testing & CI:
   - Add unit tests for server controllers and API integration tests (Jest + supertest).
   - Add basic component tests for the frontend (React Testing Library).
3. Realtime notifications:
   - Replace polling with WebSockets or SSE for immediate updates.
4. Production build & deployment:
   - Add Dockerfiles and CI/CD pipeline, configure environment-based settings and secrets.

---

## Appendix: quick file map

- `server/schema.sql` — DB schema, triggers, seed data
- `server/controllers` — business logic for products, suppliers, notifications
- `server/routes` — express routes
- `client/src/api.js` — API helpers
- `client/src/pages` — UI pages (Products, Suppliers, Reports, Notifications, Dashboard, Login)
- `client/src/index.css` — theme and global styles (including `.table-presentable` and `.notif-dot`)

---

If you want, I can:
- Commit this file into the repository (already created at the repo root as `PROJECT_REPORT.md`).
- Generate a shorter `README.md` based on this file and commit it.
- Implement any of the recommended hardening items (bcrypt, session store) and run tests.

Which follow-up would you like me to do next?