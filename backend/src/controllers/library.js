import { query, queryOne, transaction } from '../db/pool.js';
import { asyncHandler } from '../middleware/error.js';

// ── BORROWINGS ──────────────────────────────────────────────
export const getBorrowings = asyncHandler(async (req, res) => {
  const { status, member_id } = req.query;
  let sql = `
    SELECT br.*, m.name AS member_name, m.email AS member_email,
           b.title AS book_title, b.isbn, b.fine_per_day,
           s.name AS staff_name,
           CASE WHEN br.status='Borrowed' AND br.due_date < CURDATE()
                THEN DATEDIFF(CURDATE(), br.due_date) ELSE 0 END AS days_overdue,
           CASE WHEN br.status='Borrowed' AND br.due_date < CURDATE()
                THEN ROUND(DATEDIFF(CURDATE(), br.due_date) * b.fine_per_day, 2) ELSE 0 END AS current_fine
    FROM Borrowings br
    JOIN Members m ON br.member_id = m.member_id
    JOIN Books   b ON br.book_id   = b.book_id
    JOIN Staff   s ON br.staff_id  = s.staff_id
    WHERE 1=1`;
  const params = [];
  if (status) { sql += ` AND br.status=?`; params.push(status); }
  if (member_id) { sql += ` AND br.member_id=?`; params.push(member_id); }
  sql += ` ORDER BY br.created_at DESC`;
  res.json({ success: true, data: await query(sql, params) });
});

export const issueBook = asyncHandler(async (req, res) => {
  const { member_id, book_id, staff_id, loan_days = 14 } = req.body;
  await transaction(async (conn) => {
    // Call stored procedure
    await conn.execute('CALL sp_issue_book(?,?,?,?)', [member_id, book_id, staff_id, loan_days]);
  });
  const borrowing = await queryOne(
    `SELECT br.*,m.name AS member_name,b.title AS book_title FROM Borrowings br
     JOIN Members m ON br.member_id=m.member_id JOIN Books b ON br.book_id=b.book_id
     WHERE br.member_id=? AND br.book_id=? AND br.status='Borrowed' ORDER BY br.created_at DESC LIMIT 1`,
    [member_id, book_id]
  );
  res.status(201).json({ success: true, data: borrowing, message: 'Book issued successfully' });
});

export const returnBook = asyncHandler(async (req, res) => {
  let result;
  await transaction(async (conn) => {
    const [rows] = await conn.execute('CALL sp_return_book(?)', [req.params.id]);
    result = rows[0]?.[0];
  });
  res.json({ success: true, data: result, message: 'Book returned' });
});

// ── FINES ───────────────────────────────────────────────────
export const getFines = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT f.*, br.due_date, br.return_date, br.borrow_date,
           m.name AS member_name, m.email AS member_email,
           b.title AS book_title
    FROM Fines f
    JOIN Borrowings br ON f.borrowing_id = br.borrowing_id
    JOIN Members    m  ON br.member_id   = m.member_id
    JOIN Books      b  ON br.book_id     = b.book_id
    WHERE 1=1`;
  const params = [];
  if (status) { sql += ` AND f.payment_status=?`; params.push(status); }
  sql += ` ORDER BY f.created_at DESC`;
  res.json({ success: true, data: await query(sql, params) });
});

export const payFine = asyncHandler(async (req, res) => {
  const fine = await queryOne('SELECT * FROM Fines WHERE fine_id=?', [req.params.id]);
  if (!fine) return res.status(404).json({ success: false, message: 'Fine not found' });
  if (fine.payment_status !== 'Pending') return res.status(400).json({ success: false, message: 'Fine already settled' });
  await query(`UPDATE Fines SET payment_status='Paid', paid_date=CURDATE() WHERE fine_id=?`, [req.params.id]);
  res.json({ success: true, message: 'Fine collected successfully' });
});

export const waiveFine = asyncHandler(async (req, res) => {
  await query(`UPDATE Fines SET payment_status='Waived' WHERE fine_id=? AND payment_status='Pending'`, [req.params.id]);
  res.json({ success: true, message: 'Fine waived' });
});

// ── RESERVATIONS ────────────────────────────────────────────
export const getReservations = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT r.*, m.name AS member_name, b.title AS book_title, b.available_copies
    FROM Reservations r
    JOIN Members m ON r.member_id = m.member_id
    JOIN Books   b ON r.book_id   = b.book_id
    WHERE 1=1`;
  const params = [];
  if (status) { sql += ` AND r.status=?`; params.push(status); }
  sql += ` ORDER BY r.reserved_date DESC`;
  res.json({ success: true, data: await query(sql, params) });
});

export const createReservation = asyncHandler(async (req, res) => {
  const { member_id, book_id, hold_days = 14 } = req.body;
  const exists = await queryOne(`SELECT * FROM Reservations WHERE member_id=? AND book_id=? AND status='Active'`, [member_id, book_id]);
  if (exists) return res.status(400).json({ success: false, message: 'Active reservation already exists' });
  const today = new Date().toISOString().split('T')[0];
  const expiry = new Date(Date.now() + hold_days*86400000).toISOString().split('T')[0];
  const result = await query(`INSERT INTO Reservations (member_id,book_id,reserved_date,expiry_date,status) VALUES (?,?,?,?,'Active')`, [member_id, book_id, today, expiry]);
  const res2 = await queryOne(`SELECT r.*,m.name AS member_name,b.title AS book_title FROM Reservations r JOIN Members m ON r.member_id=m.member_id JOIN Books b ON r.book_id=b.book_id WHERE r.reservation_id=?`, [result.insertId]);
  res.status(201).json({ success: true, data: res2, message: 'Reservation created' });
});

export const cancelReservation = asyncHandler(async (req, res) => {
  await query(`UPDATE Reservations SET status='Cancelled' WHERE reservation_id=? AND status='Active'`, [req.params.id]);
  res.json({ success: true, message: 'Reservation cancelled' });
});

// ── STAFF ────────────────────────────────────────────────────
export const getStaff = asyncHandler(async (req, res) => {
  const staff = await query(`
    SELECT s.*, COUNT(br.borrowing_id) AS total_transactions
    FROM Staff s
    LEFT JOIN Borrowings br ON s.staff_id = br.staff_id
    GROUP BY s.staff_id ORDER BY s.name
  `);
  res.json({ success: true, data: staff });
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, phone, role } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const result = await query(`INSERT INTO Staff (name,email,phone,role,password,joined_date) VALUES (?,?,?,?,'password',?)`, [name, email, phone||null, role||'Librarian', today]);
  const staff = await queryOne('SELECT * FROM Staff WHERE staff_id=?', [result.insertId]);
  res.status(201).json({ success: true, data: staff, message: 'Staff added' });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { name, email, phone, role } = req.body;
  const ex = await queryOne('SELECT * FROM Staff WHERE staff_id=?', [req.params.id]);
  if (!ex) return res.status(404).json({ success: false, message: 'Staff not found' });
  await query(`UPDATE Staff SET name=?,email=?,phone=?,role=? WHERE staff_id=?`, [name??ex.name, email??ex.email, phone??ex.phone, role??ex.role, req.params.id]);
  res.json({ success: true, data: await queryOne('SELECT * FROM Staff WHERE staff_id=?', [req.params.id]), message: 'Staff updated' });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const active = await queryOne(`SELECT COUNT(*) AS cnt FROM Borrowings WHERE staff_id=?`, [req.params.id]);
  if (active.cnt > 0) return res.status(400).json({ success: false, message: 'Staff has transaction records' });
  await query('DELETE FROM Staff WHERE staff_id=?', [req.params.id]);
  res.json({ success: true, message: 'Staff deleted' });
});

// ── AUTHORS & CATEGORIES ────────────────────────────────────
export const getAuthors = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await query('SELECT * FROM Authors ORDER BY name') });
});

export const createAuthor = asyncHandler(async (req, res) => {
  const { name, nationality, bio } = req.body;
  const result = await query('INSERT INTO Authors (name,nationality,bio) VALUES (?,?,?)', [name, nationality||null, bio||null]);
  res.status(201).json({ success: true, data: await queryOne('SELECT * FROM Authors WHERE author_id=?', [result.insertId]) });
});

export const getCategories = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await query('SELECT * FROM Categories ORDER BY name') });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const result = await query('INSERT INTO Categories (name,description) VALUES (?,?)', [name, description||null]);
  res.status(201).json({ success: true, data: await queryOne('SELECT * FROM Categories WHERE category_id=?', [result.insertId]) });
});

// ── REPORTS / DASHBOARD ─────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalBooks] = await query('SELECT SUM(total_copies) AS total, SUM(available_copies) AS available FROM Books');
  const [members]    = await query("SELECT COUNT(*) AS total, SUM(status='Active') AS active FROM Members");
  const [borrowings] = await query("SELECT COUNT(*) AS total, SUM(status='Borrowed') AS active FROM Borrowings");
  const [overdue]    = await query("SELECT COUNT(*) AS cnt FROM Borrowings WHERE status='Borrowed' AND due_date < CURDATE()");
  const [fines]      = await query("SELECT COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount END),0) AS pending, COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount END),0) AS collected FROM Fines");
  const [reservations] = await query("SELECT COUNT(*) AS active FROM Reservations WHERE status='Active'");

  const topBooks = await query(`
    SELECT b.title, COUNT(br.borrowing_id) AS borrow_count
    FROM Books b LEFT JOIN Borrowings br ON b.book_id=br.book_id
    GROUP BY b.book_id, b.title ORDER BY borrow_count DESC LIMIT 5`);

  const topMembers = await query(`
    SELECT m.name, COUNT(br.borrowing_id) AS borrow_count
    FROM Members m LEFT JOIN Borrowings br ON m.member_id=br.member_id
    GROUP BY m.member_id, m.name ORDER BY borrow_count DESC LIMIT 5`);

  const monthlyActivity = await query(`
    SELECT DATE_FORMAT(borrow_date,'%b %Y') AS month, COUNT(*) AS count
    FROM Borrowings WHERE borrow_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(borrow_date,'%Y-%m') ORDER BY borrow_date`);

  const recentBorrowings = await query(`
    SELECT br.borrowing_id, m.name AS member_name, b.title AS book_title,
           br.borrow_date, br.due_date, br.status,
           CASE WHEN br.status='Borrowed' AND br.due_date<CURDATE() THEN 'Overdue' ELSE br.status END AS display_status
    FROM Borrowings br JOIN Members m ON br.member_id=m.member_id JOIN Books b ON br.book_id=b.book_id
    ORDER BY br.created_at DESC LIMIT 8`);

  res.json({
    success: true,
    data: {
      books:       { total: totalBooks.total, available: totalBooks.available },
      members:     { total: members.total, active: members.active },
      borrowings:  { total: borrowings.total, active: borrowings.active },
      overdue:     overdue.cnt,
      fines:       { pending: +fines.pending, collected: +fines.collected },
      reservations: reservations.active,
      topBooks, topMembers, monthlyActivity, recentBorrowings,
    }
  });
});

export const getCategoryReport = asyncHandler(async (req, res) => {
  const data = await query(`
    SELECT c.name, COUNT(DISTINCT b.book_id) AS titles,
           SUM(b.total_copies) AS total_copies, SUM(b.available_copies) AS available_copies,
           COUNT(br.borrowing_id) AS times_borrowed
    FROM Categories c
    LEFT JOIN Books b ON c.category_id=b.category_id
    LEFT JOIN Borrowings br ON b.book_id=br.book_id
    GROUP BY c.category_id, c.name ORDER BY times_borrowed DESC`);
  res.json({ success: true, data });
});
