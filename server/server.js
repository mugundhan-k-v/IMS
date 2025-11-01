const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const productsRouter = require('./routes/products');
const suppliersRouter = require('./routes/suppliers');
const authRouter = require('./routes/auth');
const notificationsRouter = require('./routes/notifications');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'ims-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationsRouter);

// lowstock route - kept at /api/lowstock for compat with spec
app.get('/api/lowstock', async (req, res) => {
  try {
    const pool = require('./db');
    const user = req.session && req.session.user;
    if (user && user.role === 'supplier') {
      const [rows] = await pool.query('SELECT p.*, s.name AS supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.quantity < p.min_stock AND p.supplier_id = ?', [user.supplier_id]);
      return res.json(rows);
    }
    const [rows] = await pool.query('SELECT p.*, s.name AS supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.quantity < p.min_stock');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`IMS backend running on port ${PORT}`);
});
