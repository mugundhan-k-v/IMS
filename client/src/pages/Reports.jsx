import { useEffect, useState } from 'react'
import { getProducts, getLowStock } from '../api'
import { Pie, Bar } from 'react-chartjs-2'

export default function Reports() {
  const [products, setProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('ims_user')
    if (raw) setUser(JSON.parse(raw))

    async function load() {
      const [p, l] = await Promise.all([getProducts(), getLowStock()])
      setProducts(p)
      setLowStock(l)
    }
    load()
  }, [])

  async function handleExportCSV() {
    // fetch all products and sort so low-stock items are first
    try {
      const all = await getProducts()
      all.sort((a, b) => {
        const aLow = (a.quantity <= a.min_stock) ? 0 : 1
        const bLow = (b.quantity <= b.min_stock) ? 0 : 1
        if (aLow !== bLow) return aLow - bLow
        // secondarily sort alphabetically by name
        return (a.name || '').localeCompare(b.name || '')
      })

      const headers = ['ID', 'Name', 'Category', 'Quantity', 'MinStock', 'Supplier', 'Price', 'LowStock']
      const rows = all.map(p => [
        p.id,
        p.name,
        p.category || '',
        p.quantity,
        p.min_stock,
        p.supplier_name || '',
        p.price,
        (p.quantity <= p.min_stock) ? 'YES' : 'NO'
      ])

      const csvLines = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      const csv = csvLines.join('\r\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const d = new Date()
      const filename = `stock_report_${d.toISOString().slice(0,10)}.csv`
      a.href = url
      a.setAttribute('download', filename)
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export CSV failed', err)
      alert('Failed to export CSV: ' + (err.message || err))
    }
  }

  const categoryMap = products.reduce((acc, cur) => {
    const c = cur.category || 'Uncategorized'
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})

  const pieData = {
    labels: Object.keys(categoryMap),
    datasets: [{ data: Object.values(categoryMap), backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56', '#4bc0c0', '#9966ff'] }]
  }

  const barData = {
    labels: products.map(p => p.name),
    datasets: [{ label: 'Quantity', data: products.map(p => p.quantity), backgroundColor: '#36a2eb' }]
  }

  return (
    <div className="page">
      <h2 className="page-title">Reports</h2>
      {user && user.role !== 'owner' && (
        <div className="alert alert-secondary">Reports are available to inventory owners only.</div>
      )}
      <div className="charts-grid reports">
        <div className="card chart-card"><h6>Category distribution</h6>
          <div className="chart-wrap reports-chart-wrap"><Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
        <div className="card chart-card"><h6>Stock per product</h6>
          <div className="chart-wrap reports-chart-wrap"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
      </div>
      <div className="mt-4 reports">
        <h5 className="section-title">Low stock products</h5>
        <div className="card p-3 reports-table-container">
          <button type="button" className="btn-export export-btn" onClick={handleExportCSV}>Export CSV</button>
          <table className="table-presentable reports-table">
            <thead><tr><th>ID</th><th>Name</th><th>Qty</th><th>Min</th><th>Supplier</th></tr></thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id}>
                  <td data-label="ID" className="fw-bold">{p.id}</td>
                  <td data-label="Name">{p.name}</td>
                  <td data-label="Qty" className={p.quantity <= p.min_stock ? 'text-danger fw-bold' : ''}>{p.quantity}</td>
                  <td data-label="Min">{p.min_stock}</td>
                  <td data-label="Supplier" className="muted">{p.supplier_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
