import { useEffect, useState } from 'react'
import { getDashboardStats } from '../api'
import { Card, Badge, Spinner } from '../components/UI'
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: color + '1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={20} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1.2 }}>{value}</div>
        </div>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Overview of your inventory system</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard icon={Package} label="Total Products" value={stats.total_products} color="var(--accent)" />
        <StatCard icon={Users} label="Total Customers" value={stats.total_customers} color="var(--accent2)" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.total_orders} color="#a78bfa" />
      </div>

      <Card>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} color="var(--warn)" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Low Stock Products</span>
          <Badge color="var(--warn)">{stats.low_stock_products.length}</Badge>
        </div>
        {stats.low_stock_products.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            ✓ All products are sufficiently stocked
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{p.sku}</span></td>
                  <td style={{ fontFamily: 'var(--mono)' }}>₹{p.price.toFixed(2)}</td>
                  <td><Badge color="var(--warn)">{p.quantity} left</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
