const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suppliersController');
const { requireLogin, requireOwner } = require('../middleware/auth');

router.post('/', requireLogin, requireOwner, async (req, res) => {
  try {
    // If username/password provided, create supplier + user
    const { username, password, display_name } = req.body;
    let id;
    if (username && password) {
      id = await ctrl.createSupplierWithUser(req.body);
    } else {
      id = await ctrl.createSupplier(req.body);
    }
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

router.get('/', async (req, res) => {
  try {
    const rows = await ctrl.getAllSuppliers();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supplier = await ctrl.getSupplierById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Not found' });
    res.json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

router.put('/:id', requireLogin, requireOwner, async (req, res) => {
  try {
    await ctrl.updateSupplier(req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

router.delete('/:id', requireLogin, requireOwner, async (req, res) => {
  try {
    await ctrl.deleteSupplier(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

module.exports = router;
