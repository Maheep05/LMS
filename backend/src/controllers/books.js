import { query, queryOne, transaction } from '../db/pool.js';
import { asyncHandler } from '../middleware/error.js';

export const getBooks = asyncHandler(async (req, res) => {
  const { search, category_id, available } = req.query;
  let sql = `
    SELECT b.*, a.name AS author_name, c.name AS category_name
    FROM Books b
    JOIN Authors a ON b.author_id = a.author_id
    JOIN Categories c ON b.category_id = c.category_id
    WHERE 1=1
  `;
  const params = [];
  if (search) { sql += ` AND (b.title LIKE ? OR a.name LIKE ? OR b.isbn = ?)`; const s = `%${search}%`; params.push(s, s, search); }
  if (category_id) { sql += ` AND b.category_id = ?`; params.push(category_id); }
  if (available === 'true') { sql += ` AND b.available_copies > 0`; }
  sql += ` ORDER BY b.title`;
  const books = await query(sql, params);
  res.json({ success: true, data: books });
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await queryOne(
    `SELECT b.*, a.name AS author_name, c.name AS category_name
     FROM Books b
     JOIN Authors a ON b.author_id = a.author_id
     JOIN Categories c ON b.category_id = c.category_id
     WHERE b.book_id = ?`, [req.params.id]
  );
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, data: book });
});

export const createBook = asyncHandler(async (req, res) => {
  const { isbn, title, author_id, category_id, publisher, publish_year, total_copies, fine_per_day } = req.body;
  const copies = total_copies || 1;
  const result = await query(
    `INSERT INTO Books (isbn,title,author_id,category_id,publisher,publish_year,total_copies,available_copies,fine_per_day)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [isbn, title, author_id, category_id, publisher || null, publish_year || null, copies, copies, fine_per_day || 2.00]
  );
  const book = await queryOne(`SELECT b.*,a.name AS author_name,c.name AS category_name FROM Books b JOIN Authors a ON b.author_id=a.author_id JOIN Categories c ON b.category_id=c.category_id WHERE b.book_id=?`, [result.insertId]);
  res.status(201).json({ success: true, data: book, message: 'Book added successfully' });
});

export const updateBook = asyncHandler(async (req, res) => {
  const { isbn, title, author_id, category_id, publisher, publish_year, total_copies, fine_per_day } = req.body;
  const existing = await queryOne('SELECT * FROM Books WHERE book_id=?', [req.params.id]);
  if (!existing) return res.status(404).json({ success: false, message: 'Book not found' });
  const newTotal = total_copies ?? existing.total_copies;
  const diff = newTotal - existing.total_copies;
  const newAvail = Math.max(0, existing.available_copies + diff);
  await query(
    `UPDATE Books SET isbn=?,title=?,author_id=?,category_id=?,publisher=?,publish_year=?,total_copies=?,available_copies=?,fine_per_day=? WHERE book_id=?`,
    [isbn ?? existing.isbn, title ?? existing.title, author_id ?? existing.author_id, category_id ?? existing.category_id, publisher ?? existing.publisher, publish_year ?? existing.publish_year, newTotal, newAvail, fine_per_day ?? existing.fine_per_day, req.params.id]
  );
  const book = await queryOne(`SELECT b.*,a.name AS author_name,c.name AS category_name FROM Books b JOIN Authors a ON b.author_id=a.author_id JOIN Categories c ON b.category_id=c.category_id WHERE b.book_id=?`, [req.params.id]);
  res.json({ success: true, data: book, message: 'Book updated' });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const active = await queryOne(`SELECT COUNT(*) AS cnt FROM Borrowings WHERE book_id=? AND status IN('Borrowed','Overdue')`, [req.params.id]);
  if (active.cnt > 0) return res.status(400).json({ success: false, message: 'Cannot delete book with active borrowings' });
  await query('DELETE FROM Books WHERE book_id=?', [req.params.id]);
  res.json({ success: true, message: 'Book deleted' });
});
