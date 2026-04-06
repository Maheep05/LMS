import { useState } from 'react'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFetch, useAsync } from '../hooks/useFetch.js'
import { getBorrowings, returnBook } from '../lib/api.js'
import { Table, StatusBadge } from '../components/UI.jsx'
import Modal from '../components/Modal.jsx'
import { formatDate, formatCurrency } from '../lib/utils.js'

export default function Returns() {
  const [confirmRow, setConfirmRow] = useState(null)
  const { data: active,   loading: aLoad, refetch: refetchActive }   = useFetch(() => getBorrowings({ status: 'Borrowed' }))
  const { data: returned, loading: rLoad, refetch: refetchReturned } = useFetch(() => getBorrowings({ status: 'Returned' }))
  const { loading: returning, run } = useAsync()

  const handleReturn = () => run(async () => {
    try {
      const res = await returnBook(confirmRow.borrowing_id)
      const { days_late, fine_amount } = res.data ?? {}
      if (+fine_amount > 0)
        toast(`Returned with fine: ${formatCurrency(fine_amount)} (${days_late}d overdue)`, { icon: '⚠️' })
      else
        toast.success('Returned on time — no fine!')
      setConfirmRow(null)
      refetchActive(); refetchReturned()
    } catch (e) { toast.error(e.message) }
  })

  const activeColumns = [
    { key: 'member_name', label: 'Member',
      render: v => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
    },
    { key: 'book_title',  label: 'Book',
      render: v => <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v}</span>
    },
    { key: 'borrow_date', label: 'Borrowed',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'due_date', label: 'Due Date',
      render: (v, r) => (
        <span className="text-xs font-semibold" style={{ color: r.days_overdue > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
          {formatDate(v)}
        </span>
      )
    },
    { key: 'days_overdue', label: 'Status',
      render: v => +v > 0
        ? <span className="badge-red badge">{v}d late</span>
        : <span className="badge-green badge">On time</span>
    },
    { key: 'current_fine', label: 'Est. Fine',
      render: v => (
        <span className="text-xs font-bold" style={{ color: +v > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
          {+v > 0 ? formatCurrency(v) : '—'}
        </span>
      )
    },
    { key: 'action', label: '',
      render: (_, row) => (
        <button className="btn-primary btn btn-sm" onClick={e => { e.stopPropagation(); setConfirmRow(row) }}>
          <RotateCcw className="w-3 h-3" /> Return
        </button>
      )
    },
  ]

  const returnedColumns = [
    { key: 'member_name', label: 'Member',
      render: v => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
    },
    { key: 'book_title',  label: 'Book',
      render: v => <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v}</span>
    },
    { key: 'borrow_date', label: 'Borrowed',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'due_date',    label: 'Was Due',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'return_date', label: 'Returned',
      render: v => <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>{formatDate(v)}</span>
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Book Returns</h1>
        <p className="page-subtitle">Process returns via sp_return_book() · auto-calculates fines</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ArrowLeftRight className="w-4 h-4" style={{ color: 'var(--brand)' }} /> Pending Returns
          </h2>
          <span className="badge-blue badge">{active?.length ?? 0}</span>
        </div>
        <Table columns={activeColumns} data={active} loading={aLoad} emptyMessage="No books pending return" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Return History</h2>
        </div>
        <Table columns={returnedColumns} data={returned} loading={rLoad} emptyMessage="No return history" />
      </div>

      {/* Confirm Return Modal */}
      <Modal
        open={!!confirmRow} onClose={() => setConfirmRow(null)}
        title="Confirm Return" size="sm"
        footer={
          <>
            <button className="btn-secondary btn" onClick={() => setConfirmRow(null)}>Cancel</button>
            <button className="btn-primary btn" onClick={handleReturn} disabled={returning}>
              {returning ? 'Processing…' : 'Confirm Return'}
            </button>
          </>
        }
      >
        {confirmRow && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl space-y-2.5 text-sm" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              {[
                ['Member',   confirmRow.member_name,                             null],
                ['Book',     confirmRow.book_title,                              null],
                ['Due Date', formatDate(confirmRow.due_date), confirmRow.days_overdue > 0 ? 'var(--danger)' : null],
              ].map(([label, val, color]) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span className="font-semibold text-right max-w-[200px]" style={{ color: color ?? 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>

            {+confirmRow.days_overdue > 0 ? (
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--danger) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--danger)' }}>
                  ⚠ {confirmRow.days_overdue} days overdue
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: 'var(--danger)' }}>
                  Fine: {formatCurrency(confirmRow.current_fine)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Fine will be added to member account</p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--success) 20%, transparent)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>✓ Returned on time — no fine</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
