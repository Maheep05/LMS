import { useState } from 'react'
import { Banknote, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFetch, useAsync } from '../hooks/useFetch.js'
import { getFines, payFine, waiveFine } from '../lib/api.js'
import { StatCard, Table, StatusBadge } from '../components/UI.jsx'
import { formatDate, formatCurrency } from '../lib/utils.js'

const TABS = ['All', 'Pending', 'Paid', 'Waived']

export default function Fines() {
  const [tab, setTab] = useState('All')
  const { data: fines, loading, refetch } = useFetch(() => getFines())
  const { run } = useAsync()

  const filtered       = fines?.filter(f => tab === 'All' || f.payment_status === tab) ?? []
  const totalPending   = fines?.filter(f => f.payment_status === 'Pending').reduce((s, f) => s + +f.amount, 0) ?? 0
  const totalCollected = fines?.filter(f => f.payment_status === 'Paid').reduce((s, f)    => s + +f.amount, 0) ?? 0
  const totalFines     = fines?.length ?? 0

  const handle = (action, id, label) => run(async () => {
    try { await action(id); toast.success(label); refetch() }
    catch (e) { toast.error(e.message) }
  })

  const columns = [
    { key: 'fine_id',     label: '#',
      render: v => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{v}</span>
    },
    { key: 'member_name', label: 'Member',
      render: v => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
    },
    { key: 'book_title',  label: 'Book',
      render: v => <span className="text-sm max-w-[200px] truncate block" style={{ color: 'var(--text-secondary)' }}>{v}</span>
    },
    { key: 'due_date',    label: 'Was Due',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'return_date', label: 'Returned',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'amount',      label: 'Amount',
      render: v => <span className="font-bold text-sm" style={{ color: 'var(--danger)' }}>{formatCurrency(v)}</span>
    },
    { key: 'payment_status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'paid_date',   label: 'Paid On',
      render: v => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(v)}</span>
    },
    { key: 'actions', label: '',
      render: (_, row) => row.payment_status === 'Pending' ? (
        <div className="flex items-center gap-1.5">
          <button className="btn btn-success btn-sm" title="SQL: UPDATE - Updates fine payment status to 'Paid'"
            onClick={e => { e.stopPropagation(); handle(() => payFine(row.fine_id), row.fine_id, `₹${row.amount} collected`) }}>
            <CheckCircle className="w-3.5 h-3.5" /> Collect
          </button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-secondary)' }} title="SQL: UPDATE - Marks fine as waived"
            onClick={e => { e.stopPropagation(); handle(() => waiveFine(row.fine_id), row.fine_id, 'Fine waived') }}>
            <XCircle className="w-3.5 h-3.5" /> Waive
          </button>
        </div>
      ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Fine Management</h1>
        <p className="page-subtitle">Collect and manage overdue fines</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending Fines" value={formatCurrency(totalPending)}
          sub={`${fines?.filter(f=>f.payment_status==='Pending').length??0} unpaid`} icon={Banknote}     color="red" />
        <StatCard label="Collected"     value={formatCurrency(totalCollected)}
          sub={`${fines?.filter(f=>f.payment_status==='Paid').length??0} paid`}     icon={CheckCircle}  color="green" />
        <StatCard label="Total Fines"   value={totalFines}
          sub="all time"                                                              icon={Banknote}     color="blue" />
      </div>

      <div className="card">
        <div className="card-header">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            {TABS.map(t => (
              <button key={t}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                title={`SQL: SELECT with WHERE - Filter fines by ${t.toLowerCase()} status`}
                style={tab === t
                  ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: 'var(--text-muted)' }
                }
                onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = 'var(--text-muted)' }}
                onClick={() => setTab(t)}
              >
                {t}
                {t !== 'All' && (
                  <span className="ml-1.5 text-xs opacity-60">({fines?.filter(f => f.payment_status === t).length ?? 0})</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage={`No ${tab.toLowerCase()} fines`} />
      </div>
    </div>
  )
}
