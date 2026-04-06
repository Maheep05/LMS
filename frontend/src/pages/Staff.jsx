import { useState } from 'react'
import { Plus, Pencil, Trash2, UserCog, Shield, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFetch, useAsync } from '../hooks/useFetch.js'
import { getStaff, createStaff, updateStaff, deleteStaff } from '../lib/api.js'
import { Table, Confirm } from '../components/UI.jsx'
import Modal from '../components/Modal.jsx'
import { formatDate, initials } from '../lib/utils.js'

const EMPTY = { name:'', email:'', phone:'', role:'Librarian' }
const ROLE_BADGE = { Admin: 'badge-purple', Librarian: 'badge-blue', Assistant: 'badge-gray' }
const ROLE_ICONS = { Admin: Shield, Librarian: BookOpen, Assistant: UserCog }

export default function Staff() {
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [editId,   setEditId]   = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: staff, loading, refetch } = useFetch(getStaff)
  const { loading: saving, run } = useAsync()

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (s) => {
    setForm({ name:s.name, email:s.email, phone:s.phone??'', role:s.role })
    setEditId(s.staff_id); setModal(true)
  }

  const handleSave = () => run(async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    try {
      if (editId) { await updateStaff(editId, form); toast.success('Staff updated') }
      else        { await createStaff(form);          toast.success('Staff added') }
      setModal(false); refetch()
    } catch (e) { toast.error(e.message) }
  })

  const handleDelete = (id) => run(async () => {
    try { await deleteStaff(id); toast.success('Staff removed'); refetch() }
    catch (e) { toast.error(e.message) }
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const columns = [
    { key: 'name', label: 'Staff Member',
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
    { key: 'phone',  label: 'Phone',
      render: v => <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{v ?? '—'}</span>
    },
    { key: 'role',   label: 'Role',
      render: v => <span className={`badge ${ROLE_BADGE[v] ?? 'badge-gray'}`}>{v}</span>
    },
    { key: 'joined_date', label: 'Joined',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'total_transactions', label: 'Transactions',
      render: v => <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>{v}</span>
    },
    { key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button className="btn-ghost btn btn-xs" onClick={e => { e.stopPropagation(); openEdit(row) }}>
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button className="btn-ghost btn btn-xs" style={{ color: 'var(--danger)' }}
            onClick={e => { e.stopPropagation(); setDeleteId(row.staff_id) }}>
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
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">{staff?.length ?? 0} staff members</p>
        </div>
        <button className="btn-primary btn" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {['Admin','Librarian','Assistant'].map(role => {
          const Icon = ROLE_ICONS[role]
          const count = staff?.filter(s => s.role === role).length ?? 0
          return (
            <div key={role} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--brand-light)' }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{count}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{role}{count !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <Table columns={columns} data={staff} loading={loading} emptyMessage="No staff found" />
      </div>

      <Modal open={modal} onClose={() => setModal(false)}
        title={editId ? 'Edit Staff Member' : 'Add Staff Member'} size="sm"
        footer={
          <>
            <button className="btn-secondary btn" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-primary btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Update' : 'Add Staff'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Full Name *</label>
            <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="label">Email *</label>
            <input className="input" type="email" placeholder="email@library.org" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input className="input" placeholder="Phone number" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label className="label">Role</label>
            <select className="select" value={form.role} onChange={set('role')}>
              <option>Librarian</option>
              <option>Admin</option>
              <option>Assistant</option>
            </select>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Remove Staff Member" danger
        message="This staff member will be permanently removed. Staff with transaction records cannot be deleted."
      />
    </div>
  )
}
