import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Suppliers from './pages/Suppliers'
import Login from './pages/Login'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Account from './pages/Account'
import Layout from './components/Layout'
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

  // If not logged in, show login as root and hide navbar
  if (!user) {
    return <Login onLogin={(u) => { setUser(u); navigate('/'); }} />
  }

  return (
    <Routes>
      <Route element={<Layout user={user} unread={unread} onLogout={() => { setUser(null); navigate('/'); }} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/account" element={<Account />} />
      </Route>
    </Routes>
  )
}

export default App
