const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productsController');
const { requireLogin, requireOwnerOrOwnsProduct } = require('../middleware/auth');

// helper to get current user from session
function currentUser(req) { return req.session && req.session.user; }

router.post('/', requireLogin, async (req, res) => {
  try {
    const user = currentUser(req);
    const payload = { ...req.body };
    // If supplier, force supplier_id to their supplier
    if (user.role === 'supplier') payload.supplier_id = user.supplier_id;
    const id = await ctrl.createProduct(payload);
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/', async (req, res) => {
  try {
    const user = req.session && req.session.user;
    if (user && user.role === 'supplier') {
      const rows = await ctrl.getProductsBySupplier(user.supplier_id);
      return res.json(rows);
    }
    const rows = await ctrl.getAllProducts();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prod = await ctrl.getProductById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Not found' });
    res.json(prod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.put('/:id', requireLogin, requireOwnerOrOwnsProduct, async (req, res) => {
  try {
    // suppliers cannot change supplier_id
    const user = currentUser(req);
    const payload = { ...req.body };
    if (user.role === 'supplier') delete payload.supplier_id;
    await ctrl.updateProduct(req.params.id, payload);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', requireLogin, requireOwnerOrOwnsProduct, async (req, res) => {
  try {
    await ctrl.deleteProduct(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
