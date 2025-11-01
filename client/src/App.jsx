import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Suppliers from './pages/Suppliers'
import Login from './pages/Login'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Account from './pages/Account'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { getNotifications } from './api'

function App() {
  const [user, setUser] = useState(null)
  const [unread, setUnread] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const raw = localStorage.getItem('ims_user')
    if (raw) setUser(JSON.parse(raw))
    // fetch unread notifications (if logged in)
    async function fetchUnread() {
      try {
        const rows = await getNotifications()
        const u = rows.filter(r => !r.is_read).length
        setUnread(u)
      } catch {
        // ignore
      }
    }
  fetchUnread()

    // keep unread count fresh by polling periodically (every 12s)
    const interval = setInterval(fetchUnread, 12000)

    function onChanged() { fetchUnread() }
    window.addEventListener('notifications:changed', onChanged)
    return () => { window.removeEventListener('notifications:changed', onChanged); clearInterval(interval) }
  }, [])

  function handleLogout() {
    localStorage.removeItem('ims_user')
    setUser(null)
    navigate('/')
  }

  // If not logged in, show login as root and hide navbar
  if (!user) {
    return <Login onLogin={(u) => { setUser(u); navigate('/'); }} />
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg mb-4 navbar-custom">
        <div className="container">
          <NavLink className="brand" to="/">Inventory Management</NavLink>
          <div>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row">
              <li className="nav-item mx-2">
                <NavLink className="nav-link" to="/">Dashboard</NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink className="nav-link" to="/products">Products</NavLink>
              </li>
              
              {/* Only owners manage suppliers and reports */}
              {user && user.role === 'owner' && (
                <>
                  <li className="nav-item mx-2">
                    <NavLink className="nav-link" to="/suppliers">Suppliers</NavLink>
                  </li>
                  <li className="nav-item mx-2">
                    <NavLink className="nav-link" to="/reports">Reports</NavLink>
                  </li>
                </>
              )}
              <li className="nav-item mx-2">
                <NavLink className="nav-link" to="/account">Account</NavLink>
              </li>
            </ul>
          </div>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <button className="btn btn-link position-relative me-3" onClick={() => navigate('/notifications')} aria-label={`Notifications (${unread} unread)`}>
                  🔔
                  {unread > 0 && <span className="notif-dot" aria-hidden="true"></span>}
                </button>
                <span className="me-3">{user.display_name || user.username} ({user.role})</span>
                <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
              <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
