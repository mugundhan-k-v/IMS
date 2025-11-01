const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationsController');
const { requireLogin } = require('../middleware/auth');

function currentUser(req) { return req.session && req.session.user; }

router.get('/', requireLogin, async (req, res) => {
  try {
    const user = currentUser(req);
    const rows = await ctrl.getNotificationsForUser(user);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/:id/read', requireLogin, async (req, res) => {
  try {
    const user = currentUser(req);
    const ok = await ctrl.markAsRead(req.params.id, user);
    if (!ok) return res.status(404).json({ error: 'Not found or not allowed' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

module.exports = router;
