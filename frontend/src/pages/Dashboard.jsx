import { BookOpen, Users, ArrowLeftRight, AlertTriangle, Banknote, Bookmark } from 'lucide-react'
import { useFetch } from '../hooks/useFetch.js'
import { getDashboard } from '../lib/api.js'
import { StatCard, Spinner, StatusBadge } from '../components/UI.jsx'
import { formatDate, formatCurrency } from '../lib/utils.js'

export default function Dashboard() {
  const { data, loading } = useFetch(getDashboard)

  if (loading) return <Spinner />
  if (!data) return null

  const { books, members, borrowings, overdue, fines, reservations,
          topBooks, monthlyActivity, recentBorrowings } = data

  const maxMonth = Math.max(...(monthlyActivity?.map(m => m.count) ?? [1]), 1)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Library overview and quick stats</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard label="Total Books"        value={books.total}                  sub={`${books.available} available`}  icon={BookOpen}       color="blue" />
        <StatCard label="Members"            value={members.total}                sub={`${members.active} active`}      icon={Users}          color="green" />
        <StatCard label="Active Borrowings"  value={borrowings.active}            sub={`of ${borrowings.total} total`}  icon={ArrowLeftRight} color="purple" />
        <StatCard label="Overdue"            value={overdue}                      sub="needs attention"                 icon={AlertTriangle}  color="red" />
        <StatCard label="Fines Pending"      value={formatCurrency(fines.pending)} sub="to collect"                    icon={Banknote}       color="yellow" />
        <StatCard label="Reservations"       value={reservations}                 sub="active holds"                   icon={Bookmark}       color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly Activity Bar Chart */}
        <div className="card md:col-span-2">
          <div className="card-header">
            <h2 className="text-sm sm:text-base font-bold\" style={{ color: 'var(--text-primary)' }}>Monthly Borrowings</h2>
            <span className="text-[10px] sm:text-xs font-medium badge-gray badge\">Last 6 months</span>
          </div>
          <div className="card-body\">
            {monthlyActivity?.length ? (
              <div className="flex items-end gap-2 sm:gap-3 h-32 sm:h-40 md:h-44">
                {monthlyActivity.map((m) => {
                  const pct = Math.round((m.count / maxMonth) * 100)
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{m.count}</span>
                      <div className="w-full relative rounded-t-xl overflow-hidden transition-all duration-500"
                        style={{ height: `${Math.max(Math.round((m.count / maxMonth) * 140), 6)}px` }}>
                        <div className="absolute inset-0 rounded-t-xl"
                          style={{ background: 'linear-gradient(180deg, var(--brand) 0%, var(--accent) 100%)', opacity: 0.85 }} />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--text-muted)' }}>{m.month}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No activity data</div>
            )}
          </div>
        </div>

        {/* Top Books */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Top Books</h2>
          </div>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {topBooks?.map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs font-bold w-5 h-5 rounded-lg flex items-center justify-center text-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{b.title}</p>
                </div>
                <span className="text-xs font-bold badge-blue badge">{b.borrow_count}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Borrowings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Borrowed</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBorrowings?.map((b) => (
                <tr key={b.borrowing_id}>
                  <td><span className="font-semibold">{b.member_name}</span></td>
                  <td className="max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>{b.book_title}</td>
                  <td><span className="text-xs">{formatDate(b.borrow_date)}</span></td>
                  <td>
                    <span className="text-xs font-semibold"
                      style={b.display_status !== 'Overdue' ? { color: 'var(--text-muted)' } : { color: 'var(--danger)' }}>
                      {formatDate(b.due_date)}
                    </span>
                  </td>
                  <td><StatusBadge status={b.display_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
