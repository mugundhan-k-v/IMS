const pool = require('../db');

async function createProduct(product) {
  const { name, category, quantity, min_stock, price, supplier_id } = product;
  const [result] = await pool.query(
    'INSERT INTO products (name, category, quantity, min_stock, price, supplier_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, quantity, min_stock, price, supplier_id || null]
  );
  return result.insertId;
}

async function getAllProducts() {
  const [rows] = await pool.query('SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.id DESC');
  return rows;
}

async function getProductsBySupplier(supplier_id) {
  const [rows] = await pool.query('SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.supplier_id = ? ORDER BY p.id DESC', [supplier_id]);
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query('SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?', [id]);
  return rows[0];
}

async function updateProduct(id, product) {
  const fields = ['name','category','quantity','min_stock','price','supplier_id'];
  // Build update with only provided fields
  const updates = [];
  const params = [];
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(product, key)) {
      updates.push(`${key} = ?`);
      params.push(product[key]);
    }
  }
  if (updates.length === 0) return;
  params.push(id);
  const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
  await pool.query(sql, params);
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
}

async function getLowStockProducts() {
  const [rows] = await pool.query('SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.quantity < p.min_stock');
  return rows;
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts
  ,getProductsBySupplier
};
