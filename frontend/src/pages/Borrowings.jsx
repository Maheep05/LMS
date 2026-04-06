import { useState, useCallback } from 'react'
import { BookOpen, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFetch, useAsync } from '../hooks/useFetch.js'
import { getBooks, getMembers, getStaff, getBorrowings, issueBook } from '../lib/api.js'
import { Table, StatusBadge, Spinner } from '../components/UI.jsx'
import { formatDate, addDays } from '../lib/utils.js'

export default function Borrowings() {
  const [form, setForm] = useState({ member_id:'', book_id:'', staff_id:'', loan_days:'14' })
  const { data: activeBooks }   = useFetch(() => getBooks({ available: 'true' }))
  const { data: activeMembers } = useFetch(() => getMembers({ status: 'Active' }))
  const { data: staff }         = useFetch(getStaff)
  const { data: borrowings, loading: bLoading, refetch } = useFetch(() => getBorrowings({ status: 'Borrowed' }))
  const { loading: issuing, run } = useAsync()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const dueDate = addDays(+form.loan_days || 14)

  const handleIssue = () => run(async () => {
    if (!form.member_id || !form.book_id || !form.staff_id) { toast.error('Please fill all fields'); return }
    try {
      const res = await issueBook({ member_id: +form.member_id, book_id: +form.book_id, staff_id: +form.staff_id, loan_days: +form.loan_days })
      toast.success(`Book issued! Due: ${formatDate(res.data?.due_date)}`)
      setForm({ member_id:'', book_id:'', staff_id:'', loan_days:'14' })
      refetch()
    } catch (e) { toast.error(e.message) }
  })

  const columns = [
    { key: 'member_name',  label: 'Member',
      render: v => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
    },
    { key: 'book_title', label: 'Book',
      render: v => <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v}</span>
    },
    { key: 'borrow_date', label: 'Issued',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'due_date', label: 'Due Date',
      render: (v, r) => {
        const overdue = r.days_overdue > 0
        return (
          <div>
            <span className="text-xs font-semibold" style={{ color: overdue ? 'var(--danger)' : 'var(--text-secondary)' }}>
              {formatDate(v)}
            </span>
            {overdue && <p className="text-xs mt-0.5" style={{ color: 'var(--danger)' }}>{r.days_overdue}d overdue</p>}
          </div>
        )
      }
    },
    { key: 'staff_name', label: 'Issued By',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{v}</span>
    },
    { key: 'status', label: 'Status',
      render: (v, r) => <StatusBadge status={r.days_overdue > 0 ? 'Overdue' : v} />
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Issue Books</h1>
        <p className="page-subtitle">Issue a book to a member using the stored procedure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BookOpen className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              Issue Book
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="label">Member *</label>
              <select className="select" value={form.member_id} onChange={set('member_id')}>
                <option value="">Select active member</option>
                {activeMembers?.map(m => (
                  <option key={m.member_id} value={m.member_id}>
                    {m.name} {+m.pending_fines > 50 ? `⚠ ₹${m.pending_fines} fines` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Book *</label>
              <select className="select" value={form.book_id} onChange={set('book_id')}>
                <option value="">Select available book</option>
                {activeBooks?.map(b => (
                  <option key={b.book_id} value={b.book_id}>
                    {b.title} [{b.available_copies} avail.]
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Issued By *</label>
              <select className="select" value={form.staff_id} onChange={set('staff_id')}>
                <option value="">Select staff</option>
                {staff?.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.role})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Loan Period</label>
              <select className="select" value={form.loan_days} onChange={set('loan_days')}>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="21">21 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            {/* Due date preview */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ backgroundColor: 'var(--brand-light)', border: '1px solid color-mix(in srgb, var(--brand) 20%, transparent)' }}>
              <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--brand)' }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>Due Date</p>
                <p className="text-sm font-bold" style={{ color: 'var(--brand-dark)' }}>{formatDate(dueDate)}</p>
              </div>
            </div>

            <button className="btn-primary btn w-full justify-center" onClick={handleIssue} disabled={issuing}>
              {issuing ? 'Issuing…' : 'Issue Book — sp_issue_book()'}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Calls MySQL stored procedure · validates fines · updates availability
            </p>
          </div>
        </div>

        {/* Active Borrowings Table */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Active Borrowings</h2>
            <span className="badge-blue badge">{borrowings?.length ?? 0}</span>
          </div>
          <Table columns={columns} data={borrowings} loading={bLoading} emptyMessage="No active borrowings" />
        </div>
      </div>
    </div>
  )
}
