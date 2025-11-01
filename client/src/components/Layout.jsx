import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './layout.css'

export default function Layout({ user, unread, onLogout }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    localStorage.removeItem('ims_user')
    if (onLogout) onLogout()
    navigate('/')
  }

  function toggleSidebar() {
    setMobileOpen(v => !v)
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">Inventory Management System</div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>Products</NavLink>
          {user && user.role === 'owner' && <NavLink to="/suppliers" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>Suppliers</NavLink>}
          {user && user.role === 'owner' && <NavLink to="/reports" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>Reports</NavLink>}
          {/* <NavLink to="/notifications" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>Notifications</NavLink> */}
          <NavLink to="/account" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>Account</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">{user?.display_name || user?.username}</div>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            {/* hamburger for small screens */}
            <button className="btn btn-link hamburger" onClick={toggleSidebar} aria-label="Toggle menu">☰</button>
          </div>
          <div className="topbar-right">
            <button className="btn btn-link notif-button" onClick={() => { setMobileOpen(false); navigate('/notifications') }} aria-label="Notifications">🔔{unread > 0 ? <span className="notif-dot topbar-dot" /> : null}</button>
          </div>
        </header>

        {/* overlay for mobile when sidebar open */}
        {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
