import { useState } from 'react'
import { changePassword } from '../api'

export default function Account() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newPassword || newPassword !== confirm) {
      setMessage('New password and confirmation do not match')
      setTimeout(() => setMessage(null), 3000)
      return
    }
    try {
      await changePassword(currentPassword, newPassword)
      setMessage('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err) {
      console.error(err)
      setMessage(err?.response?.data?.error || 'Failed to change password')
    }
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="page">
      <h2 className="page-title">Account</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit} className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Current password</label>
          <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">New password</label>
          <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm new password</label>
          <input type="password" className="form-control" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit">Change password</button>
      </form>
    </div>
  )
}
