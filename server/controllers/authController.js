const pool = require('../db');

async function login({ username, password }) {
  const [rows] = await pool.query('SELECT id, username, display_name, role, supplier_id FROM users WHERE username = ? AND password = ?', [username, password]);
  return rows[0];
}

async function registerSupplier({ username, password, display_name, supplier_id }) {
  const [res] = await pool.query('INSERT INTO users (username, password, display_name, role, supplier_id) VALUES (?, ?, ?, ?, ?)', [username, password, display_name, 'supplier', supplier_id || null]);
  return res.insertId;
}

async function changePassword(userId, currentPassword, newPassword) {
  // verify current password matches
  const [rows] = await pool.query('SELECT id FROM users WHERE id = ? AND password = ?', [userId, currentPassword]);
  if (!rows || rows.length === 0) {
    const err = new Error('current password incorrect');
    err.code = 'INVALID_CURRENT_PASSWORD';
    throw err;
  }
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
}

module.exports = { login, registerSupplier, changePassword };
