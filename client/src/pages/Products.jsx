import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct, getSuppliers } from '../api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', category: '', quantity: 0, min_stock: 0, price: 0.0, supplier_id: '' })
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('ims_user')
    if (raw) setUser(JSON.parse(raw))
    load()
  }, [])

  async function load() {
    const [p, s] = await Promise.all([getProducts(), getSuppliers()])
    // if logged in as supplier, filter to supplier's products
    const raw = localStorage.getItem('ims_user')
    const curUser = raw ? JSON.parse(raw) : null
    if (curUser && curUser.role === 'supplier') {
      setProducts(p.filter(x => x.supplier_id === curUser.supplier_id))
    } else {
      setProducts(p)
    }
    setSuppliers(s)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      try {
        // normalize types and avoid sending empty supplier_id
        const payload = { ...form }
        payload.quantity = Number(payload.quantity)
        payload.min_stock = Number(payload.min_stock)
        payload.price = Number(payload.price)
        if (!payload.supplier_id) delete payload.supplier_id
        await updateProduct(editingId, payload)
        setMessage('Product updated')
      } catch (err) {
        console.error('Failed to update product', err)
        setMessage('Failed to update product: ' + (err?.response?.data?.error || err.message || err))
      }
    } else {
      // if supplier logged in, ensure supplier_id is set to their supplier
      const raw = localStorage.getItem('ims_user')
      const curUser = raw ? JSON.parse(raw) : null
      const payload = { ...form }
      if (curUser && curUser.role === 'supplier') payload.supplier_id = curUser.supplier_id
      await createProduct(payload)
      setMessage('Product created')
    }
    setForm({ name: '', category: '', quantity: 0, min_stock: 0, price: 0.0, supplier_id: '' })
    setEditingId(null)
    load()
    setTimeout(() => setMessage(null), 3000)
  }

  function beginEdit(p) {
    setEditingId(p.id)
    setForm({ name: p.name || '', category: p.category || '', quantity: p.quantity || 0, min_stock: p.min_stock || 0, price: p.price || 0.0, supplier_id: p.supplier_id || '' })
  }

  async function handleDelete(id) {
    if (!confirm('Delete product?')) return
    await deleteProduct(id)
    load()
    setMessage('Product deleted')
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="page">
      <h2 className="page-title">Products</h2>
      {message && <div className="alert alert-success">{message}</div>}

  <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <input name="name" className="form-control" placeholder="Product name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="col-md-2">
            <input name="category" className="form-control" placeholder="Category" value={form.category} onChange={handleChange} />
          </div>
          <div className="col-md-1">
            <input name="quantity" type="number" className="form-control" placeholder="Qty" value={form.quantity} onChange={handleChange} />
          </div>
          <div className="col-md-1">
            <input name="min_stock" type="number" className="form-control" placeholder="Min" value={form.min_stock} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <input name="price" type="number" step="0.01" className="form-control" placeholder="Price" value={form.price} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            {/* If supplier logged in, lock supplier selection to their supplier */}
            {user && user.role === 'supplier' ? (
              <input className="form-control" readOnly value={suppliers.find(x => x.id === user.supplier_id)?.name || ''} />
            ) : (
              <select name="supplier_id" className="form-select" value={form.supplier_id} onChange={handleChange}>
                <option value="">No supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
          <div className="col-md-1">
            <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </form>

      <table className="table-presentable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Qty</th>
            {!user || user.role === 'owner' ? <th>Supplier</th> : null}
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td data-label="ID">{p.id}</td>
              <td data-label="Name">
                {p.name} {p.quantity < p.min_stock ? <span className="badge-low ms-2">⚠️ Low Stock</span> : null}
              </td>
              <td data-label="Category">{p.category}</td>
              <td data-label="Qty">{p.quantity}</td>
              {(!user || user.role === 'owner') && <td data-label="Supplier">{p.supplier_name}</td>}
              <td data-label="Price">{p.price}</td>
              <td data-label="Actions">
                <button className="btn-edit me-2" onClick={() => beginEdit(p)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
