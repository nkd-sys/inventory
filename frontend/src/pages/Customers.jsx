import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getCustomers, createCustomer, deleteCustomer } from '../api'
import { Card, Btn, Modal, Field, PageHeader, Spinner } from '../components/UI'
import { Plus, Trash2 } from 'lucide-react'

const empty = { full_name: '', email: '', phone: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.full_name || !form.email || !form.phone) return toast.error('All fields required')
    setSaving(true)
    try {
      await createCustomer(form)
      toast.success('Customer added')
      setModal(false); setForm(empty); load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error saving customer')
    } finally { setSaving(false) }
  }

  const remove = async (c) => {
    if (!confirm(`Delete "${c.full_name}"? This will also delete their orders.`)) return
    try { await deleteCustomer(c.id); toast.success('Deleted'); load() }
    catch (e) { toast.error(e.response?.data?.detail || 'Error deleting') }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
        action={<Btn onClick={() => { setForm(empty); setModal(true) }}><Plus size={14} /> Add Customer</Btn>}
      />
      <Card>
        {customers.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>No customers yet.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.full_name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{c.email}</td>
                  <td>{c.phone}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Btn variant="danger" size="sm" onClick={() => remove(c)}><Trash2 size={12} /></Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Customer">
        <Field label="Full Name"><input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" /></Field>
        <Field label="Email Address"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" /></Field>
        <Field label="Phone Number"><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Add Customer'}</Btn>
        </div>
      </Modal>
    </div>
  )
}
