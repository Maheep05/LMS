import { Loader2, Inbox } from 'lucide-react'
import { statusBadge } from '../lib/utils.js'
import Modal from './Modal.jsx'

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="relative w-10 h-10">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--brand)' }} />
      </div>
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────── */
export function Empty({ message = 'No data found', icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-subtle)' }}>
        {icon ?? <Inbox className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />}
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  )
}

/* ── Status Badge ────────────────────────────────────────── */
export function StatusBadge({ status }) {
  return <span className={statusBadge(status)}>{status}</span>
}

/* ── Generic Badge ───────────────────────────────────────── */
export function Badge({ children, variant = 'gray' }) {
  const variants = {
    blue: 'badge-blue', green: 'badge-green', red: 'badge-red',
    yellow: 'badge-yellow', gray: 'badge-gray', purple: 'badge-purple',
  }
  return <span className={variants[variant] ?? 'badge-gray'}>{children}</span>
}

/* ── Stat Card ───────────────────────────────────────────── */
export function StatCard({ label, value, sub, icon: Icon, color = 'blue' }) {
  const gradients = {
    blue:   'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    green:  'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    red:    'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
    yellow: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    purple: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
  }
  const iconBgs = {
    blue:   'rgba(99,102,241,0.15)',
    green:  'rgba(5,150,105,0.15)',
    red:    'rgba(220,38,38,0.15)',
    yellow: 'rgba(217,119,6,0.15)',
    purple: 'rgba(124,58,237,0.15)',
  }
  const iconColors = {
    blue: '#818cf8', green: '#34d399', red: '#f87171', yellow: '#fbbf24', purple: '#a78bfa',
  }
  return (
    <div className="stat-card group hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          <p className="text-lg sm:text-2xl font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
          {sub && <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        </div>
        {Icon && (
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBgs[color] ?? iconBgs.blue }}>
            <Icon className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: iconColors[color] ?? iconColors.blue }} />
          </div>
        )}
      </div>
      <div className="mt-2 sm:mt-3 h-0.5 rounded-full opacity-40"
        style={{ background: gradients[color] ?? gradients.blue }} />
    </div>
  )
}

/* ── Table ───────────────────────────────────────────────── */
export function Table({ columns, data, loading, emptyMessage, onRowClick }) {
  if (loading) return <Spinner />
  if (!data?.length) return <Empty message={emptyMessage} />

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key ?? col.label} style={col.width ? { width: col.width } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : undefined }}
            >
              {columns.map((col) => (
                <td key={col.key ?? col.label}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Search + Filter Bar ─────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder = 'Search…', children }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      <div className="relative flex-1 min-w-0 sm:min-w-48">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="input pl-9 w-full"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 sm:gap-3 flex-wrap">
        {children}
      </div>
    </div>
  )
}

/* ── Confirm Dialog ──────────────────────────────────────── */
export function Confirm({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-secondary btn" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose() }}>
            Confirm
          </button>
        </>
      }
    >
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </Modal>
  )
}
