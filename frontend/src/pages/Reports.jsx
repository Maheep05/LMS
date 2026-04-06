import { useFetch } from '../hooks/useFetch.js'
import { getDashboard, getCategoryReport } from '../lib/api.js'
import { StatCard, Spinner } from '../components/UI.jsx'
import { formatCurrency } from '../lib/utils.js'
import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react'

function BarRow({ label, value, count, color, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold w-4 text-right" style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span className="text-sm font-medium truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{value}</span>
        </div>
        <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color }}>{count}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden ml-6" style={{ backgroundColor: 'var(--bg-muted)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function Reports() {
  const { data: dash, loading: dLoad } = useFetch(getDashboard)
  const { data: cats, loading: cLoad } = useFetch(getCategoryReport)

  if (dLoad || cLoad) return <Spinner />

  const maxBorrow = Math.max(...(cats?.map(c => +c.times_borrowed) ?? [1]), 1)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Collection statistics and usage insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Titles"     value={cats?.reduce((s,c)=>s+ +c.titles,0)??0} icon={BookOpen}   color="blue" />
        <StatCard label="Active Members"   value={dash?.members?.active??0}                icon={Users}      color="green" />
        <StatCard label="Total Borrowings" value={dash?.borrowings?.total??0}              icon={TrendingUp} color="purple" />
        <StatCard label="Fines Collected"  value={formatCurrency(dash?.fines?.collected??0)} icon={BarChart3} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Books */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Most Borrowed Books</h2>
          </div>
          <div className="card-body space-y-4">
            {dash?.topBooks?.map((b, i) => {
              const max = Math.max(...dash.topBooks.map(x => +x.borrow_count), 1)
              return (
                <BarRow key={i} label={i + 1} value={b.title}
                  count={`${b.borrow_count}×`} color="var(--brand)"
                  max={max} />
              )
            })}
          </div>
        </div>

        {/* Top Members */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Most Active Members</h2>
          </div>
          <div className="card-body space-y-4">
            {dash?.topMembers?.map((m, i) => {
              const max = Math.max(...dash.topMembers.map(x => +x.borrow_count), 1)
              return (
                <BarRow key={i} label={i + 1} value={m.name}
                  count={`${m.borrow_count} books`} color="var(--success)"
                  max={max} />
              )
            })}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Collection by Category</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Titles</th>
                <th>Total Copies</th>
                <th>Available</th>
                <th>Times Borrowed</th>
                <th>Utilisation</th>
              </tr>
            </thead>
            <tbody>
              {cats?.map((c, i) => {
                const utilPct  = +c.total_copies > 0
                  ? Math.round(((+c.total_copies - +c.available_copies) / +c.total_copies) * 100) : 0
                const borrowPct = Math.round((+c.times_borrowed / maxBorrow) * 100)
                const utilColor = utilPct > 80 ? 'var(--danger)' : utilPct > 50 ? 'var(--warning)' : 'var(--success)'
                return (
                  <tr key={i}>
                    <td><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</span></td>
                    <td><span className="badge-blue badge">{c.titles}</span></td>
                    <td><span style={{ color: 'var(--text-secondary)' }}>{c.total_copies}</span></td>
                    <td>
                      <span className="font-bold" style={{ color: +c.available_copies === 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {c.available_copies}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
                          <div className="h-full rounded-full" style={{ width: `${borrowPct}%`, backgroundColor: 'var(--accent)' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{c.times_borrowed}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${utilPct}%`, backgroundColor: utilColor }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: utilColor }}>{utilPct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
