import { useState } from 'react'
import client from '../api'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await client.post('/auth/login', form)
      const user = res.data || res
      // store user in localStorage
      localStorage.setItem('ims_user', JSON.stringify(user))
      if (onLogin) onLogin(user)
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 360 }}>
        <div className="card p-4" style={{ writingMode: 'horizontal-tb' }}>
          <h3 className="mb-3">Login</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <input name="username" value={form.username} onChange={handleChange} className="form-control" placeholder="Username" required />
            </div>
            <div className="mb-2">
              <input name="password" type="password" value={form.password} onChange={handleChange} className="form-control" placeholder="Password" required />
            </div>
            <div>
              <button className="btn btn-primary w-100">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
