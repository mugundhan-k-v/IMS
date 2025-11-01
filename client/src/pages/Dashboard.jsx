import { useEffect, useState } from 'react'
import { getProducts, getLowStock, getSuppliers } from '../api'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [supplierCount, setSupplierCount] = useState(0)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('ims_user')
    if (raw) setUser(JSON.parse(raw))

    async function load() {
      const [p, l, s] = await Promise.all([getProducts(), getLowStock(), getSuppliers()])
      // If supplier logged in, getProducts and getLowStock are already filtered server-side
      setProducts(p)
      setLowStock(l)
      setSupplierCount(s.length)
    }
    load()
  }, [])

  const totalProducts = products.length
  const lowCount = lowStock.length

  // category distribution
  const categoryMap = products.reduce((acc, cur) => {
    const c = cur.category || 'Uncategorized'
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})

  const pieData = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        data: Object.values(categoryMap),
        backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56', '#4bc0c0', '#9966ff']
      }
    ]
  }

  const barData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Quantity',
        data: products.map(p => p.quantity),
        backgroundColor: '#36a2eb'
      }
    ]
  }

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>
      <div className="stats-grid mb-4">
        <div className="card stats-card center">
          <div className="muted">{user && user.role === 'supplier' ? 'My Products' : 'Total Products'}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalProducts}</div>
        </div>
        <div className="card stats-card center">
          <div className="muted">{user && user.role === 'supplier' ? 'My Low Stock' : 'Low Stock Items'}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{lowCount}</div>
        </div>
        {user && user.role === 'owner' && (
          <div className="card stats-card center">
            <div className="muted">Suppliers</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{supplierCount}</div>
          </div>
        )}
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h6>Category Distribution</h6>
          <div className="chart-wrap">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="card chart-card">
          <h6>Stock Quantity per Product</h6>
          <div className="chart-wrap">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  )
}
