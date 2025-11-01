const pool = require('../db');

async function login({ username, password }) {
  const [rows] = await pool.query('SELECT id, username, display_name, role, supplier_id FROM users WHERE username = ? AND password = ?', [username, password]);
  return rows[0];
}

async function registerSupplier({ username, password, display_name, supplier_id }) {
  const [res] = await pool.query('INSERT INTO users (username, password, display_name, role, supplier_id) VALUES (?, ?, ?, ?, ?)', [username, password, display_name, 'supplier', supplier_id || null]);
  return res.insertId;
}

module.exports = { login, registerSupplier };
