import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from '../api'
import { Card, Btn, Modal, Field, Badge, PageHeader, Spinner } from '../components/UI'
import { Plus, Trash2, Eye, X } from 'lucide-react'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [detailOrder, setDetailOrder] = useState(null)
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [saving, setSaving] = useState(false)

  const load = () =>
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => { setOrders(o.data); setCustomers(c.data); setProducts(p.data) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, field, value) => setItems(i => i.map((it, j) => j === idx ? { ...it, [field]: value } : it))

  const calcTotal = () => items.reduce((sum, it) => {
    const p = products.find(p => p.id === parseInt(it.product_id))
    return sum + (p ? p.price * (parseInt(it.quantity) || 0) : 0)
  }, 0)

  const save = async () => {
    if (!customerId) return toast.error('Select a customer')
    const validItems = items.filter(i => i.product_id && i.quantity > 0)
    if (!validItems.length) return toast.error('Add at least one product')
    setSaving(true)
    try {
      await createOrder({ customer_id: parseInt(customerId), items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })) })
      toast.success('Order created')
      setCreateModal(false); setCustomerId(''); setItems([{ product_id: '', quantity: 1 }]); load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error creating order')
    } finally { setSaving(false) }
  }

  const viewDetail = async (id) => {
    const r = await getOrder(id)
    setDetailOrder(r.data)
  }

  const remove = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    try { await deleteOrder(id); toast.success('Order cancelled'); load() }
    catch (e) { toast.error(e.response?.data?.detail || 'Error') }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        action={<Btn onClick={() => setCreateModal(true)}><Plus size={14} /> New Order</Btn>}
      />
      <Card>
        {orders.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>No orders yet.</div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {orders.map(o => {
                const cust = customers.find(c => c.id === o.customer_id)
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>#{o.id}</td>
                    <td style={{ fontWeight: 500 }}>{cust?.full_name || `Customer #${o.customer_id}`}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--accent)' }}>₹{o.total_amount.toFixed(2)}</td>
                    <td><Badge color={o.status === 'pending' ? '#f59e0b' : 'var(--accent)'}>{o.status}</Badge></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Btn variant="ghost" size="sm" onClick={() => viewDetail(o.id)}><Eye size={12} /></Btn>
                        <Btn variant="danger" size="sm" onClick={() => remove(o.id)}><Trash2 size={12} /></Btn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Create Order Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Order" width={540}>
        <Field label="Customer">
          <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Select customer…</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
          </select>
        </Field>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 8 }}>ORDER ITEMS</div>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <div style={{ flex: 2 }}>
                <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price} (stock: {p.quantity})</option>)}
                </select>
              </div>
              <div style={{ width: 80 }}>
                <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} placeholder="Qty" />
              </div>
              {items.length > 1 && (
                <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <Btn variant="secondary" size="sm" onClick={addItem}><Plus size={12} /> Add Item</Btn>
        </div>

        {calcTotal() > 0 && (
          <div style={{ background: 'var(--surface2)', padding: '10px 14px', borderRadius: 6, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>Estimated Total</span>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>₹{calcTotal().toFixed(2)}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? 'Placing…' : 'Place Order'}</Btn>
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Order #${detailOrder?.id}`}>
        {detailOrder && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                ['Status', <Badge color={detailOrder.status === 'pending' ? '#f59e0b' : 'var(--accent)'}>{detailOrder.status}</Badge>],
                ['Date', new Date(detailOrder.created_at).toLocaleString()],
                ['Customer ID', `#${detailOrder.customer_id}`],
                ['Total', <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 700 }}>₹{detailOrder.total_amount.toFixed(2)}</span>],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--surface2)', padding: '10px 14px', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Items</div>
            <table>
              <thead><tr><th>Product ID</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {detailOrder.items.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>#{item.product_id}</td>
                    <td>{item.quantity}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>₹{item.unit_price.toFixed(2)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>₹{(item.unit_price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Modal>
    </div>
  )
}
