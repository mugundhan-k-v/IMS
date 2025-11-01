# Inventory Management System - Backend

Overview

This backend implements a simple Inventory Management System (IMS). The application tracks products, suppliers, stock levels and generates low-stock alerts and analytics for reporting. It supports two user roles:

- owner: full access to products, suppliers, reports and user management.
- supplier: limited access constrained to their supplier record and products owned by that supplier.

This project is intentionally minimal and intended for development and demo purposes. Passwords are stored in plaintext and sessions are simple server-side sessions; do not use this in production without adding secure password handling and a persistent session store.

Quick start (Windows PowerShell):

1. Copy environment example and update values:

```powershell
cd server
copy .env.example .env
# Edit .env and set DB credentials
notepad .env
```

2. Create the database and tables (using MySQL CLI or a GUI like phpMyAdmin / MySQL Workbench). Example using MySQL CLI:

```powershell
# open mysql client then run the SQL in schema.sql
mysql -u root -p
SOURCE schema.sql;
```

3. Install dependencies and run in development:

```powershell
npm install
npm run dev
```

API endpoints (base: http://localhost:4000/api):


Auth (simple, no hashing/JWT):
- POST   /api/auth/login          -> { username, password } returns user object on success

Note: supplier registration endpoint has been removed from the public API – supplier accounts should be created directly in the database by the owner or via an admin process.


- This is a starting point. Add validation, authentication, and input sanitization before using in production.
