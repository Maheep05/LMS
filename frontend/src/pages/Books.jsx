import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFetch, useAsync } from '../hooks/useFetch.js'
import { getBooks, getAuthors, getCategories, createBook, updateBook, deleteBook, createAuthor } from '../lib/api.js'
import { Table, SearchBar, StatusBadge, Spinner, Confirm } from '../components/UI.jsx'
import Modal from '../components/Modal.jsx'
import { formatCurrency } from '../lib/utils.js'

const EMPTY_FORM = { isbn:'', title:'', author_id:'', category_id:'', publisher:'', publish_year:'', total_copies:1, fine_per_day:2 }

export default function Books() {
  const [search,      setSearch]      = useState('')
  const [catFilter,   setCatFilter]   = useState('')
  const [modal,       setModal]       = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [editId,      setEditId]      = useState(null)
  const [deleteId,    setDeleteId]    = useState(null)
  const [authorModal, setAuthorModal] = useState(false)
  const [newAuthor,   setNewAuthor]   = useState({ name:'', nationality:'' })

  const fetchBooks = useCallback(
    () => getBooks({ search: search || undefined, category_id: catFilter || undefined }),
    [search, catFilter]
  )
  const { data: books, loading, refetch } = useFetch(fetchBooks, [search, catFilter])
  const { data: authors }    = useFetch(getAuthors)
  const { data: categories } = useFetch(getCategories)
  const { loading: saving, run } = useAsync()

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setModal('add') }
  const openEdit = (book) => {
    setForm({
      isbn: book.isbn, title: book.title, author_id: book.author_id,
      category_id: book.category_id, publisher: book.publisher ?? '',
      publish_year: book.publish_year ?? '', total_copies: book.total_copies,
      fine_per_day: book.fine_per_day,
    })
    setEditId(book.book_id); setModal('edit')
  }

  const handleSave = () => run(async () => {
    if (!form.title || !form.author_id || !form.category_id) { toast.error('Fill required fields'); return }
    try {
      if (editId) { await updateBook(editId, form); toast.success('Book updated') }
      else        { await createBook(form);          toast.success('Book added') }
      setModal(null); refetch()
    } catch (e) { toast.error(e.message) }
  })

  const handleDelete = (id) => run(async () => {
    try { await deleteBook(id); toast.success('Book deleted'); refetch() }
    catch (e) { toast.error(e.message) }
  })

  const handleAddAuthor = () => run(async () => {
    if (!newAuthor.name) { toast.error('Author name required'); return }
    try { await createAuthor(newAuthor); toast.success('Author added'); setAuthorModal(false) }
    catch (e) { toast.error(e.message) }
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const availPct = (b) => b.total_copies ? Math.round((b.available_copies / b.total_copies) * 100) : 0

  const columns = [
    { key: 'title', label: 'Title',
      render: (v, r) => (
        <div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.author_name}</p>
        </div>
      )
    },
    { key: 'isbn', label: 'ISBN',
      render: v => <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{v}</span>
    },
    { key: 'category_name', label: 'Category',
      render: v => <span className="badge-gray badge">{v}</span>
    },
    { key: 'publish_year', label: 'Year',
      render: v => <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v ?? '—'}</span>
    },
    { key: 'available_copies', label: 'Availability',
      render: (v, r) => {
        const pct = availPct(r)
        const barColor = pct === 0 ? 'var(--danger)' : pct < 50 ? 'var(--warning)' : 'var(--success)'
        return (
          <div className="min-w-[110px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold" style={{ color: pct === 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                {v}/{r.total_copies}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
            </div>
          </div>
        )
      }
    },
    { key: 'fine_per_day', label: 'Fine/Day',
      render: v => <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(v)}</span>
    },
    { key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button className="btn-ghost btn btn-xs" onClick={(e) => { e.stopPropagation(); openEdit(row) }} title="SQL: UPDATE - Modifies existing book data">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button className="btn-ghost btn btn-xs" style={{ color: 'var(--danger)' }}
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.book_id) }} title="SQL: DELETE - Removes book record from database">
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
          <h1 className="page-title">Books</h1>
          <p className="page-subtitle">{books?.length ?? 0} books in catalogue</p>
        </div>
        <button className="btn-primary btn" onClick={openAdd} title="SQL: INSERT - Adds new book record to database">
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      <div className="card">
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search title, author, ISBN…">
            <select className="select w-44" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories?.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
          </SearchBar>
        </div>
        <Table columns={columns} data={books} loading={loading} emptyMessage="No books found" />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={!!modal} onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Edit Book' : 'Add New Book'}
        size="lg"
        footer={
          <>
            <button className="btn-secondary btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : modal === 'edit' ? 'Update Book' : 'Add Book'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Title *</label>
            <input className="input" placeholder="Book title" value={form.title} onChange={set('title')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Author *</label>
              <div className="flex gap-2">
                <select className="select flex-1" value={form.author_id} onChange={set('author_id')}>
                  <option value="">Select author</option>
                  {authors?.map(a => <option key={a.author_id} value={a.author_id}>{a.name}</option>)}
                </select>
                <button className="btn-secondary btn btn-sm px-2.5" title="SQL: INSERT - Adds new author to database" onClick={() => setAuthorModal(true)}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Category *</label>
              <select className="select" value={form.category_id} onChange={set('category_id')}>
                <option value="">Select category</option>
                {categories?.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">ISBN</label>
              <input className="input font-mono" placeholder="978-…" value={form.isbn} onChange={set('isbn')} />
            </div>
            <div className="form-group">
              <label className="label">Publisher</label>
              <input className="input" placeholder="Publisher name" value={form.publisher} onChange={set('publisher')} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Year</label>
              <input className="input" type="number" placeholder="2024" min="1800" max="2025" value={form.publish_year} onChange={set('publish_year')} />
            </div>
            <div className="form-group">
              <label className="label">Total Copies *</label>
              <input className="input" type="number" min="1" value={form.total_copies} onChange={set('total_copies')} />
            </div>
            <div className="form-group">
              <label className="label">Fine / Day (₹)</label>
              <input className="input" type="number" min="0" step="0.5" value={form.fine_per_day} onChange={set('fine_per_day')} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Quick Add Author Modal */}
      <Modal open={authorModal} onClose={() => setAuthorModal(false)} title="Add Author" size="sm"
        footer={
          <>
            <button className="btn-secondary btn" onClick={() => setAuthorModal(false)}>Cancel</button>
            <button className="btn-primary btn" onClick={handleAddAuthor}>Add Author</button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="form-group">
            <label className="label">Name *</label>
            <input className="input" placeholder="Author name" value={newAuthor.name} onChange={e => setNewAuthor(a => ({...a, name: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="label">Nationality</label>
            <input className="input" placeholder="e.g. British" value={newAuthor.nationality} onChange={e => setNewAuthor(a => ({...a, nationality: e.target.value}))} />
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Book" danger
        message="This book will be permanently removed from the catalogue. Books with active borrowings cannot be deleted."
      />
    </div>
  )
}
