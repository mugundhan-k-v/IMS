const pool = require('../db');

async function getNotificationsForUser(user) {
  if (!user) return [];
  if (user.role === 'owner') {
    const [rows] = await pool.query(`
      SELECT n.*, p.name AS product_name, s.name AS supplier_name
      FROM notifications n
      LEFT JOIN products p ON n.product_id = p.id
      LEFT JOIN suppliers s ON n.supplier_id = s.id
      ORDER BY n.created_at DESC
    `);
    return rows;
  }

  // supplier: only their notifications
  const [rows] = await pool.query(`
    SELECT n.*, p.name AS product_name, s.name AS supplier_name
    FROM notifications n
    LEFT JOIN products p ON n.product_id = p.id
    LEFT JOIN suppliers s ON n.supplier_id = s.id
    WHERE n.supplier_id = ?
    ORDER BY n.created_at DESC
  `, [user.supplier_id]);
  return rows;
}

async function markAsRead(id, user) {
  // owner can mark any, supplier only own
  if (user.role === 'owner') {
    const [res] = await pool.query('UPDATE notifications SET is_read=1 WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
  const [res] = await pool.query('UPDATE notifications SET is_read=1 WHERE id = ? AND supplier_id = ?', [id, user.supplier_id]);
  return res.affectedRows > 0;
}

module.exports = { getNotificationsForUser, markAsRead };
