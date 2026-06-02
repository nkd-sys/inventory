import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api'
import { Card, Btn, Modal, Field, Badge, PageHeader, Spinner } from '../components/UI'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const empty = { name: '', sku: '', price: '', quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity }); setModal(true) }

  const save = async () => {
    if (!form.name || !form.sku || form.price === '' || form.quantity === '') return toast.error('All fields required')
    setSaving(true)
    try {
      const payload = { name: form.name, sku: form.sku, price: parseFloat(form.price), quantity: parseInt(form.quantity) }
      if (editing) {
        await updateProduct(editing.id, payload)
        toast.success('Product updated')
      } else {
        await createProduct(payload)
        toast.success('Product created')
      }
      setModal(false); load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error saving product')
    } finally { setSaving(false) }
  }

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return
    try { await deleteProduct(p.id); toast.success('Deleted'); load() }
    catch (e) { toast.error(e.response?.data?.detail || 'Error deleting') }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} product${products.length !== 1 ? 's' : ''}`}
        action={<Btn onClick={openAdd}><Plus size={14} /> Add Product</Btn>}
      />
      <Card>
        {products.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>No products yet. Add your first product.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{p.sku}</span></td>
                  <td style={{ fontFamily: 'var(--mono)' }}>₹{p.price.toFixed(2)}</td>
                  <td>
                    <Badge color={p.quantity <= 5 ? 'var(--warn)' : p.quantity <= 20 ? '#f59e0b' : 'var(--accent)'}>
                      {p.quantity}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={12} /></Btn>
                      <Btn variant="danger" size="sm" onClick={() => remove(p)}><Trash2 size={12} /></Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <Field label="Product Name"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Wireless Mouse" /></Field>
        <Field label="SKU / Code"><input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. WM-001" style={{ fontFamily: 'var(--mono)' }} /></Field>
        <Field label="Price (₹)"><input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></Field>
        <Field label="Quantity in Stock"><input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</Btn>
        </div>
      </Modal>
    </div>
  )
}
