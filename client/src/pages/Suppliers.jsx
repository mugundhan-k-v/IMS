import { useEffect, useState } from 'react'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState({ name: '', contact: '', address: '', username: '', password: '', display_name: '' })
  const [editingId, setEditingId] = useState(null)
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { 
    const raw = localStorage.getItem('ims_user')
    if (raw) setUser(JSON.parse(raw))
    load()
  }, [])

  async function load() {
    setSuppliers(await getSuppliers())
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await updateSupplier(editingId, { name: form.name, contact: form.contact, address: form.address })
        setMessage('Supplier updated')
      } else {
        await createSupplier(form)
        setMessage('Supplier created')
      }
      setForm({ name: '', contact: '', address: '', username: '', password: '', display_name: '' })
      setEditingId(null)
      await load()
    } catch (err) {
      console.error('Supplier save failed', err)
      setMessage(err?.response?.data?.error || String(err))
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  function beginEdit(s) {
    setEditingId(s.id)
    setForm({ name: s.name || '', contact: s.contact || '', address: s.address || '', username: '', password: '', display_name: '' })
  }

  async function handleDelete(id) {
    if (!confirm('Delete supplier? This will remove the supplier record.')) return
    await deleteSupplier(id)
    setMessage('Supplier deleted')
    load()
    setTimeout(() => setMessage(null), 3000)
  }

  // Only owners can manage suppliers
  if (!user || user.role !== 'owner') {
    return (
      <div className="page">
        <h2 className="page-title">Suppliers</h2>
        <div className="alert alert-secondary">This area is for inventory owners only. If you are a supplier, you can manage your products under the Products page.</div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="page-title">Suppliers</h2>
      {message && <div className="alert alert-success">{message}</div>}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <input name="name" className="form-control" placeholder="Supplier name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <input name="contact" className="form-control" placeholder="Contact" value={form.contact} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <input name="address" className="form-control" placeholder="Address" value={form.address} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editingId ? 'Update' : 'Add Supplier')}</button>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <input name="username" className="form-control" placeholder="Account username (optional)" value={form.username || ''} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <input name="password" type="password" className="form-control" placeholder="Account password (optional)" value={form.password || ''} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <input name="display_name" className="form-control" placeholder="Display name (optional)" value={form.display_name || ''} onChange={handleChange} />
          </div>
        </div>
      </form>

      <table className="table-presentable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id}>
              <td data-label="ID">{s.id}</td>
              <td data-label="Name">{s.name}</td>
              <td data-label="Contact">{s.contact}</td>
              <td data-label="Address">{s.address}</td>
              <td data-label="Actions">
                <button className="btn-edit me-2" onClick={() => beginEdit(s)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
