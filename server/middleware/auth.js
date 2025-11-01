function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: 'authentication required' });
}

function requireOwner(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'owner') return next();
  return res.status(403).json({ error: 'owner role required' });
}

// check product ownership: allow if owner OR supplier owns the product
async function requireOwnerOrOwnsProduct(req, res, next) {
  try {
    const user = req.session && req.session.user;
    if (!user) return res.status(401).json({ error: 'authentication required' });
    if (user.role === 'owner') return next();
    // supplier
    const pool = require('../db');
    const productId = parseInt(req.params.id, 10);
    const [rows] = await pool.query('SELECT supplier_id FROM products WHERE id = ?', [productId]);
    const prod = rows[0];
    if (!prod) return res.status(404).json({ error: 'product not found' });
    if (prod.supplier_id === user.supplier_id) return next();
    return res.status(403).json({ error: 'not allowed to modify this product' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
}

module.exports = { requireLogin, requireOwner, requireOwnerOrOwnsProduct };
