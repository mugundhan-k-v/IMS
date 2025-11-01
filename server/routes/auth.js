const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

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

module.exports = router;
