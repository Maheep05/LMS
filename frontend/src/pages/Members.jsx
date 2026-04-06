import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFetch, useAsync } from '../hooks/useFetch.js'
import { getMembers, createMember, updateMember, deleteMember } from '../lib/api.js'
import { Table, SearchBar, StatusBadge, Confirm } from '../components/UI.jsx'
import Modal from '../components/Modal.jsx'
import { formatDate, formatCurrency, initials, addDays } from '../lib/utils.js'

const EMPTY = { name:'', email:'', phone:'', address:'', expiry_date: addDays(365), status:'Active' }

export default function Members() {
  const [search,   setSearch]   = useState('')
  const [statusF,  setStatusF]  = useState('')
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [editId,   setEditId]   = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const fetchFn = useCallback(() => getMembers({ search: search||undefined, status: statusF||undefined }), [search, statusF])
  const { data: members, loading, refetch } = useFetch(fetchFn, [search, statusF])
  const { loading: saving, run } = useAsync()

  const openAdd  = () => { setForm({ ...EMPTY, expiry_date: addDays(365) }); setEditId(null); setModal(true) }
  const openEdit = (m) => {
    setForm({ name:m.name, email:m.email, phone:m.phone??'', address:m.address??'', expiry_date:m.expiry_date, status:m.status })
    setEditId(m.member_id); setModal(true)
  }

  const handleSave = () => run(async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    try {
      if (editId) { await updateMember(editId, form); toast.success('Member updated') }
      else        { await createMember(form);          toast.success('Member registered') }
      setModal(false); refetch()
    } catch (e) { toast.error(e.message) }
  })

  const handleDelete = (id) => run(async () => {
    try { await deleteMember(id); toast.success('Member removed'); refetch() }
    catch (e) { toast.error(e.message) }
  })

  const toggleStatus = (m) => run(async () => {
    const newStatus = m.status === 'Active' ? 'Suspended' : 'Active'
    try { await updateMember(m.member_id, { status: newStatus }); toast.success(`Member ${newStatus.toLowerCase()}`); refetch() }
    catch (e) { toast.error(e.message) }
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const columns = [
    { key: 'name', label: 'Member',
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
            {initials(v)}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.email}</p>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone',
      render: v => <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{v ?? '—'}</span>
    },
    { key: 'membership_date', label: 'Joined',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'expiry_date', label: 'Expires',
      render: (v) => {
        const expired = new Date(v) < new Date()
        return (
          <span className="text-xs font-semibold" style={{ color: expired ? 'var(--danger)' : 'var(--text-secondary)' }}>
            {formatDate(v)}
          </span>
        )
      }
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'active_borrowings', label: 'Borrowings',
      render: (v, r) => (
        <div className="text-xs">
          <span className="font-bold" style={{ color: 'var(--brand)' }}>{v}</span>
          <span style={{ color: 'var(--text-muted)' }}> active</span>
          {+r.pending_fines > 0 && (
            <p className="font-semibold mt-0.5" style={{ color: 'var(--danger)' }}>{formatCurrency(r.pending_fines)} fine</p>
          )}
        </div>
      )
    },
    { key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button className="btn-ghost btn btn-xs" onClick={e => { e.stopPropagation(); openEdit(row) }}>
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button className="btn-ghost btn btn-xs" title={row.status==='Active'?'Suspend':'Activate'}
            onClick={e => { e.stopPropagation(); toggleStatus(row) }}>
            {row.status==='Active'
              ? <ToggleRight className="w-4 h-4" style={{ color: 'var(--success)' }} />
              : <ToggleLeft  className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
          </button>
          <button className="btn-ghost btn btn-xs" style={{ color: 'var(--danger)' }}
            onClick={e => { e.stopPropagation(); setDeleteId(row.member_id) }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{members?.length ?? 0} registered members</p>
        </div>
        <button className="btn-primary btn" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Register Member
        </button>
      </div>

      <div className="card">
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name or email…">
            <select className="select w-36" value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="">All Status</option>
              <option>Active</option><option>Suspended</option><option>Expired</option>
            </select>
          </SearchBar>
        </div>
        <Table columns={columns} data={members} loading={loading} emptyMessage="No members found" />
      </div>

      <Modal
        open={modal} onClose={() => setModal(false)}
        title={editId ? 'Edit Member' : 'Register New Member'}
        size="md"
        footer={
          <>
            <button className="btn-secondary btn" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-primary btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Update' : 'Register'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Full Name *</label>
            <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Email *</label>
              <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="label">Phone</label>
              <input className="input" placeholder="10-digit number" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Address</label>
            <textarea className="input resize-none" rows={2} placeholder="Full address" value={form.address} onChange={set('address')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Membership Expiry *</label>
              <input className="input" type="date" value={form.expiry_date} onChange={set('expiry_date')} />
            </div>
            <div className="form-group">
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={set('status')}>
                <option>Active</option><option>Suspended</option><option>Expired</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Remove Member" danger
        message="This member will be permanently removed. Members with active borrowings cannot be deleted."
      />
    </div>
  )
}
