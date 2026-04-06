import { useState } from 'react'
import { Plus, XCircle, Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFetch, useAsync } from '../hooks/useFetch.js'
import { getReservations, createReservation, cancelReservation, getMembers, getBooks } from '../lib/api.js'
import { Table, StatusBadge, SearchBar } from '../components/UI.jsx'
import Modal from '../components/Modal.jsx'
import { formatDate } from '../lib/utils.js'

export default function Reservations() {
  const [modal, setModal] = useState(false)
  const [form,  setForm]  = useState({ member_id:'', book_id:'', hold_days:'14' })

  const { data: reservations, loading, refetch } = useFetch(getReservations)
  const { data: members } = useFetch(() => getMembers({ status: 'Active' }))
  const { data: books }   = useFetch(getBooks)
  const { loading: saving, run } = useAsync()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCreate = () => run(async () => {
    if (!form.member_id || !form.book_id) { toast.error('Select member and book'); return }
    try {
      await createReservation({ member_id: +form.member_id, book_id: +form.book_id, hold_days: +form.hold_days })
      toast.success('Reservation created')
      setModal(false)
      setForm({ member_id:'', book_id:'', hold_days:'14' })
      refetch()
    } catch (e) { toast.error(e.message) }
  })

  const handleCancel = (id) => run(async () => {
    try { await cancelReservation(id); toast.success('Reservation cancelled'); refetch() }
    catch (e) { toast.error(e.message) }
  })

  const columns = [
    { key: 'reservation_id', label: '#',
      render: v => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{v}</span>
    },
    { key: 'member_name', label: 'Member',
      render: v => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
    },
    { key: 'book_title', label: 'Book',
      render: (v, r) => (
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{v}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {r.available_copies > 0 ? `${r.available_copies} copies available` : 'Currently unavailable'}
          </p>
        </div>
      )
    },
    { key: 'reserved_date', label: 'Reserved',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'expiry_date', label: 'Hold Until',
      render: (v, r) => {
        const expired = new Date(v) < new Date() && r.status === 'Active'
        return (
          <span className="text-xs font-semibold" style={{ color: expired ? 'var(--danger)' : 'var(--text-secondary)' }}>
            {formatDate(v)}
          </span>
        )
      }
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'actions', label: '',
      render: (_, row) => row.status === 'Active' ? (
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
          onClick={e => { e.stopPropagation(); handleCancel(row.reservation_id) }}>
          <XCircle className="w-3.5 h-3.5" /> Cancel
        </button>
      ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
    },
  ]

  const active   = reservations?.filter(r => r.status === 'Active')  ?? []
  const inactive = reservations?.filter(r => r.status !== 'Active')  ?? []

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reservations</h1>
          <p className="page-subtitle">{active.length} active holds</p>
        </div>
        <button className="btn-primary btn" onClick={() => setModal(true)}>
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Bookmark className="w-4 h-4" style={{ color: 'var(--brand)' }} /> Active Holds
          </h2>
          <span className="badge-blue badge">{active.length}</span>
        </div>
        <Table columns={columns} data={active} loading={loading} emptyMessage="No active reservations" />
      </div>

      {inactive.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>History</h2>
          </div>
          <Table columns={columns} data={inactive} loading={false} emptyMessage="No history" />
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Reservation" size="sm"
        footer={
          <>
            <button className="btn-secondary btn" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-primary btn" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating…' : 'Reserve'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Member *</label>
            <select className="select" value={form.member_id} onChange={set('member_id')}>
              <option value="">Select member</option>
              {members?.map(m => <option key={m.member_id} value={m.member_id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Book *</label>
            <select className="select" value={form.book_id} onChange={set('book_id')}>
              <option value="">Select book</option>
              {books?.map(b => <option key={b.book_id} value={b.book_id}>{b.title} [{b.available_copies} avail.]</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Hold Duration</label>
            <select className="select" value={form.hold_days} onChange={set('hold_days')}>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
