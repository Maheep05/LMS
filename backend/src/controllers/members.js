import { query, queryOne } from '../db/pool.js';
import { asyncHandler } from '../middleware/error.js';

export const getMembers = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  let sql = `SELECT m.*,
    (SELECT COUNT(*) FROM Borrowings WHERE member_id=m.member_id AND status='Borrowed') AS active_borrowings,
    (SELECT COALESCE(SUM(f.amount),0) FROM Fines f JOIN Borrowings br ON f.borrowing_id=br.borrowing_id WHERE br.member_id=m.member_id AND f.payment_status='Pending') AS pending_fines
    FROM Members m WHERE 1=1`;
  const params = [];
  if (search) { sql += ` AND (m.name LIKE ? OR m.email LIKE ?)`; const s=`%${search}%`; params.push(s,s); }
  if (status) { sql += ` AND m.status=?`; params.push(status); }
  sql += ` ORDER BY m.name`;
  res.json({ success: true, data: await query(sql, params) });
});

export const getMember = asyncHandler(async (req, res) => {
  const m = await queryOne(`SELECT m.*,
    (SELECT COUNT(*) FROM Borrowings WHERE member_id=m.member_id AND status='Borrowed') AS active_borrowings,
    (SELECT COALESCE(SUM(f.amount),0) FROM Fines f JOIN Borrowings br ON f.borrowing_id=br.borrowing_id WHERE br.member_id=m.member_id AND f.payment_status='Pending') AS pending_fines
    FROM Members m WHERE m.member_id=?`, [req.params.id]);
  if (!m) return res.status(404).json({ success: false, message: 'Member not found' });
  const history = await query(`SELECT br.*,b.title,b.isbn,a.name AS author FROM Borrowings br JOIN Books b ON br.book_id=b.book_id JOIN Authors a ON b.author_id=a.author_id WHERE br.member_id=? ORDER BY br.borrow_date DESC LIMIT 10`, [req.params.id]);
  res.json({ success: true, data: { ...m, history } });
});

export const createMember = asyncHandler(async (req, res) => {
  const { name, email, phone, address, expiry_date, status } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const result = await query(
    `INSERT INTO Members (name,email,phone,address,membership_date,expiry_date,status) VALUES (?,?,?,?,?,?,?)`,
    [name, email, phone||null, address||null, today, expiry_date, status||'Active']
  );
  const member = await queryOne('SELECT * FROM Members WHERE member_id=?', [result.insertId]);
  res.status(201).json({ success: true, data: member, message: 'Member registered' });
});

export const updateMember = asyncHandler(async (req, res) => {
  const { name, email, phone, address, expiry_date, status } = req.body;
  const existing = await queryOne('SELECT * FROM Members WHERE member_id=?', [req.params.id]);
  if (!existing) return res.status(404).json({ success: false, message: 'Member not found' });
  await query(
    `UPDATE Members SET name=?,email=?,phone=?,address=?,expiry_date=?,status=? WHERE member_id=?`,
    [name??existing.name, email??existing.email, phone??existing.phone, address??existing.address, expiry_date??existing.expiry_date, status??existing.status, req.params.id]
  );
  res.json({ success: true, data: await queryOne('SELECT * FROM Members WHERE member_id=?', [req.params.id]), message: 'Member updated' });
});

export const deleteMember = asyncHandler(async (req, res) => {
  const active = await queryOne(`SELECT COUNT(*) AS cnt FROM Borrowings WHERE member_id=? AND status='Borrowed'`, [req.params.id]);
  if (active.cnt > 0) return res.status(400).json({ success: false, message: 'Member has active borrowings' });
  await query('DELETE FROM Members WHERE member_id=?', [req.params.id]);
  res.json({ success: true, message: 'Member deleted' });
});
