import { useEffect, useState } from 'react'
import { getNotifications, markNotificationRead } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Notifications() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    try {
      const rows = await getNotifications()
      setNotes(rows)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleMark(n) {
    try {
      await markNotificationRead(n.id)
      // optimistic update
      setNotes(prev => prev.map(p => p.id === n.id ? { ...p, is_read: 1 } : p))
      // notify app to refresh unread count
  window.dispatchEvent(new Event('notifications:changed'))
    } catch (err) { console.error(err) }
  }

  return (
    <div className="page">
      <h2 className="page-title">Notifications</h2>
      {loading ? <div className="text-muted">Loading...</div> : null}
      <div className="list-group">
        {notes.map(n => (
          <div key={n.id} className={`list-group-item d-flex justify-content-between align-items-start ${n.is_read ? '' : 'list-group-item-warning'}`}>
            <div>
              <div><strong>{n.product_name || 'Product'}</strong> <small className="text-muted">({n.supplier_name || 'Unknown supplier'})</small></div>
              <div className="small">{n.message}</div>
              <div className="small text-muted">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            <div>
              {!n.is_read && <button className="btn btn-sm btn-primary me-2" onClick={() => handleMark(n)}>Mark read</button>}
              <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/products/${n.product_id}`)}>View product</button>
            </div>
          </div>
        ))}
        {(!loading && notes.length === 0) && <div className="text-muted mt-3">No notifications</div>}
      </div>
    </div>
  )
}
