const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { requireLogin } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const user = await ctrl.login({ username, password });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    // set session user
    req.session.user = user;
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

// POST /api/auth/register-supplier  (optional helper)
// registration of suppliers via API removed (no registration UI)

// PUT /api/auth/password - change current user's password
router.put('/password', requireLogin, async (req, res) => {
  try {
    const user = req.session && req.session.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword required' });
    await ctrl.changePassword(user.id, currentPassword, newPassword);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    if (err.code === 'INVALID_CURRENT_PASSWORD') return res.status(401).json({ error: 'current password incorrect' });
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;

