const pool = require('../db');

async function createSupplier(supplier) {
  const { name, contact, address } = supplier;
  const [result] = await pool.query(
    'INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)',
    [name, contact, address]
  );
  return result.insertId;
}

async function createSupplierWithUser({ name, contact, address, username, password, display_name }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query('INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)', [name, contact, address]);
    const supplierId = res.insertId;
    if (username && password) {
      await conn.query('INSERT INTO users (username, password, display_name, role, supplier_id) VALUES (?, ?, ?, ?, ?)', [username, password, display_name || username, 'supplier', supplierId]);
    }
    await conn.commit();
    return supplierId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getAllSuppliers() {
  const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY id DESC');
  return rows;
}

async function getSupplierById(id) {
  const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
  return rows[0];
}

async function updateSupplier(id, supplier) {
  const updates = [];
  const params = [];
  for (const key of ['name','contact','address']) {
    if (supplier[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(supplier[key]);
    }
  }
  if (!updates.length) return;
  params.push(id);
  const sql = `UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`;
  await pool.query(sql, params);
}

async function deleteSupplier(id) {
  await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
}

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};
