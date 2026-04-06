import pool from './pool.js';

// conn.query()   → raw text, works for DDL (CREATE TABLE/VIEW/PROCEDURE/TRIGGER)
// conn.execute() → prepared statements, only for DML with user params

export async function initDb() {
  const conn = await pool.getConnection();
  try {

    // ── TABLES ─────────────────────────────────────────────

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Authors (
        author_id   INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(150) NOT NULL,
        nationality VARCHAR(100),
        bio         TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Categories (
        category_id INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Books (
        book_id          INT AUTO_INCREMENT PRIMARY KEY,
        isbn             VARCHAR(20)  NOT NULL UNIQUE,
        title            VARCHAR(255) NOT NULL,
        author_id        INT NOT NULL,
        category_id      INT NOT NULL,
        publisher        VARCHAR(150),
        publish_year     YEAR,
        total_copies     INT NOT NULL DEFAULT 1,
        available_copies INT NOT NULL DEFAULT 1,
        fine_per_day     DECIMAL(6,2) NOT NULL DEFAULT 2.00,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id)   REFERENCES Authors(author_id)      ON DELETE RESTRICT,
        FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE RESTRICT
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Members (
        member_id       INT AUTO_INCREMENT PRIMARY KEY,
        name            VARCHAR(150) NOT NULL,
        email           VARCHAR(150) NOT NULL UNIQUE,
        phone           VARCHAR(20),
        address         TEXT,
        membership_date DATE NOT NULL,
        expiry_date     DATE NOT NULL,
        status          ENUM('Active','Suspended','Expired') NOT NULL DEFAULT 'Active',
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Staff (
        staff_id    INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(150) NOT NULL,
        email       VARCHAR(150) NOT NULL UNIQUE,
        phone       VARCHAR(20),
        role        ENUM('Librarian','Admin','Assistant') NOT NULL DEFAULT 'Librarian',
        password    VARCHAR(255) NOT NULL DEFAULT 'password',
        joined_date DATE NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Borrowings (
        borrowing_id INT AUTO_INCREMENT PRIMARY KEY,
        member_id    INT NOT NULL,
        book_id      INT NOT NULL,
        staff_id     INT NOT NULL,
        borrow_date  DATE NOT NULL,
        due_date     DATE NOT NULL,
        return_date  DATE DEFAULT NULL,
        status       ENUM('Borrowed','Returned','Overdue') NOT NULL DEFAULT 'Borrowed',
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE RESTRICT,
        FOREIGN KEY (book_id)   REFERENCES Books(book_id)     ON DELETE RESTRICT,
        FOREIGN KEY (staff_id)  REFERENCES Staff(staff_id)    ON DELETE RESTRICT
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Fines (
        fine_id        INT AUTO_INCREMENT PRIMARY KEY,
        borrowing_id   INT NOT NULL UNIQUE,
        amount         DECIMAL(8,2) NOT NULL,
        payment_status ENUM('Pending','Paid','Waived') NOT NULL DEFAULT 'Pending',
        paid_date      DATE DEFAULT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (borrowing_id) REFERENCES Borrowings(borrowing_id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Reservations (
        reservation_id INT AUTO_INCREMENT PRIMARY KEY,
        member_id      INT NOT NULL,
        book_id        INT NOT NULL,
        reserved_date  DATE NOT NULL,
        expiry_date    DATE NOT NULL,
        status         ENUM('Active','Fulfilled','Cancelled','Expired') NOT NULL DEFAULT 'Active',
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE CASCADE,
        FOREIGN KEY (book_id)   REFERENCES Books(book_id)     ON DELETE CASCADE
      )
    `);

    // ── VIEWS ───────────────────────────────────────────────

    await conn.query(`
      CREATE OR REPLACE VIEW vw_active_borrowings AS
      SELECT
        br.borrowing_id, m.name AS member_name, m.email AS member_email,
        b.title AS book_title, a.name AS author, s.name AS issued_by,
        br.borrow_date, br.due_date,
        DATEDIFF(CURDATE(), br.due_date) AS days_overdue
      FROM Borrowings br
      JOIN Members m ON br.member_id = m.member_id
      JOIN Books   b ON br.book_id   = b.book_id
      JOIN Authors a ON b.author_id  = a.author_id
      JOIN Staff   s ON br.staff_id  = s.staff_id
      WHERE br.status = 'Borrowed'
    `);

    await conn.query(`
      CREATE OR REPLACE VIEW vw_book_availability AS
      SELECT b.book_id, b.title, a.name AS author, c.name AS category,
             b.total_copies, b.available_copies,
             (b.total_copies - b.available_copies) AS copies_borrowed,
             b.fine_per_day
      FROM Books b
      JOIN Authors    a ON b.author_id   = a.author_id
      JOIN Categories c ON b.category_id = c.category_id
    `);

    await conn.query(`
      CREATE OR REPLACE VIEW vw_member_fines AS
      SELECT m.member_id, m.name, m.email,
        COUNT(f.fine_id) AS total_fines,
        ROUND(SUM(f.amount),2) AS total_amount,
        ROUND(SUM(CASE WHEN f.payment_status='Pending' THEN f.amount ELSE 0 END),2) AS pending_amount,
        ROUND(SUM(CASE WHEN f.payment_status='Paid'    THEN f.amount ELSE 0 END),2) AS paid_amount
      FROM Members m
      LEFT JOIN Borrowings br ON m.member_id    = br.member_id
      LEFT JOIN Fines      f  ON br.borrowing_id = f.borrowing_id
      GROUP BY m.member_id, m.name, m.email
    `);

    // ── STORED PROCEDURES ───────────────────────────────────

    await conn.query(`DROP PROCEDURE IF EXISTS sp_issue_book`);
    await conn.query(`
      CREATE PROCEDURE sp_issue_book(
        IN p_member_id INT, IN p_book_id INT, IN p_staff_id INT, IN p_loan_days INT
      )
      BEGIN
        DECLARE v_available INT;
        DECLARE v_mem_status VARCHAR(20);
        DECLARE v_pending_fine DECIMAL(8,2);

        SELECT status INTO v_mem_status FROM Members WHERE member_id = p_member_id;
        IF v_mem_status != 'Active' THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Member account is not active';
        END IF;

        SELECT COALESCE(SUM(f.amount),0) INTO v_pending_fine
        FROM Fines f JOIN Borrowings br ON f.borrowing_id = br.borrowing_id
        WHERE br.member_id = p_member_id AND f.payment_status = 'Pending';
        IF v_pending_fine > 50 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Member has unpaid fines exceeding Rs.50';
        END IF;

        SELECT available_copies INTO v_available FROM Books WHERE book_id = p_book_id FOR UPDATE;
        IF v_available <= 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No copies available';
        END IF;

        INSERT INTO Borrowings (member_id,book_id,staff_id,borrow_date,due_date,status)
        VALUES (p_member_id,p_book_id,p_staff_id,CURDATE(),DATE_ADD(CURDATE(),INTERVAL p_loan_days DAY),'Borrowed');

        UPDATE Books SET available_copies = available_copies - 1 WHERE book_id = p_book_id;

        UPDATE Reservations SET status='Fulfilled'
        WHERE member_id=p_member_id AND book_id=p_book_id AND status='Active';
      END
    `);

    await conn.query(`DROP PROCEDURE IF EXISTS sp_return_book`);
    await conn.query(`
      CREATE PROCEDURE sp_return_book(IN p_borrowing_id INT)
      BEGIN
        DECLARE v_book_id INT;
        DECLARE v_due_date DATE;
        DECLARE v_fine_per_day DECIMAL(6,2);
        DECLARE v_days_late INT DEFAULT 0;
        DECLARE v_fine_amt DECIMAL(8,2) DEFAULT 0;
        DECLARE v_status VARCHAR(20);

        SELECT br.book_id, br.due_date, br.status, b.fine_per_day
        INTO v_book_id, v_due_date, v_status, v_fine_per_day
        FROM Borrowings br JOIN Books b ON br.book_id=b.book_id
        WHERE br.borrowing_id = p_borrowing_id;

        IF v_status = 'Returned' THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book already returned';
        END IF;

        IF CURDATE() > v_due_date THEN
          SET v_days_late = DATEDIFF(CURDATE(), v_due_date);
          SET v_fine_amt  = v_days_late * v_fine_per_day;
        END IF;

        UPDATE Borrowings SET return_date=CURDATE(), status='Returned'
        WHERE borrowing_id = p_borrowing_id;

        UPDATE Books SET available_copies = available_copies + 1 WHERE book_id = v_book_id;

        IF v_fine_amt > 0 THEN
          INSERT INTO Fines (borrowing_id, amount, payment_status)
          VALUES (p_borrowing_id, v_fine_amt, 'Pending');
        END IF;

        SELECT v_days_late AS days_late, v_fine_amt AS fine_amount;
      END
    `);

    // ── TRIGGERS ────────────────────────────────────────────

    await conn.query(`DROP TRIGGER IF EXISTS trg_check_overdue`);
    await conn.query(`
      CREATE TRIGGER trg_check_overdue
      BEFORE UPDATE ON Borrowings FOR EACH ROW
      BEGIN
        IF NEW.status = 'Borrowed' AND NEW.due_date < CURDATE() THEN
          SET NEW.status = 'Overdue';
        END IF;
      END
    `);

    await conn.query(`DROP TRIGGER IF EXISTS trg_prevent_book_delete`);
    await conn.query(`
      CREATE TRIGGER trg_prevent_book_delete
      BEFORE DELETE ON Books FOR EACH ROW
      BEGIN
        DECLARE v_count INT;
        SELECT COUNT(*) INTO v_count FROM Borrowings
        WHERE book_id=OLD.book_id AND status IN('Borrowed','Overdue');
        IF v_count > 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete book with active borrowings';
        END IF;
      END
    `);

    // ── INDEXES ─────────────────────────────────────────────

    const indexes = [
      ['idx_books_author',   'Books',      'author_id'],
      ['idx_books_category', 'Books',      'category_id'],
      ['idx_borrow_member',  'Borrowings', 'member_id'],
      ['idx_borrow_book',    'Borrowings', 'book_id'],
      ['idx_borrow_status',  'Borrowings', 'status'],
      ['idx_fines_payment',  'Fines',      'payment_status'],
      ['idx_members_status', 'Members',    'status'],
    ];

    for (const [name, table, col] of indexes) {
      const [rows] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.statistics
         WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
        [table, name]
      );
      if (rows[0].cnt === 0) {
        await conn.query(`CREATE INDEX ${name} ON ${table}(${col})`);
      }
    }

    // ── SEED DATA (only if tables are empty) ────────────────

    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) AS cnt FROM Authors');
    if (cnt === 0) {
      await conn.query(`
        INSERT INTO Authors (name, nationality, bio) VALUES
        ('George Orwell',          'British',   'Novelist known for dystopian fiction'),
        ('J.K. Rowling',           'British',   'Author of the Harry Potter series'),
        ('Yuval Noah Harari',      'Israeli',   'Historian and futurist'),
        ('Gabriel Garcia Marquez', 'Colombian', 'Nobel laureate, magical realism'),
        ('Agatha Christie',        'British',   'Queen of crime fiction')
      `);

      await conn.query(`
        INSERT INTO Categories (name, description) VALUES
        ('Fiction',     'Literary and imaginative works'),
        ('Non-Fiction', 'Factual prose and reference'),
        ('Science',     'Natural and applied sciences'),
        ('History',     'Historical accounts and analysis'),
        ('Mystery',     'Crime, detective, and thriller genres')
      `);

      await conn.query(`
        INSERT INTO Books (isbn,title,author_id,category_id,publisher,publish_year,total_copies,available_copies,fine_per_day) VALUES
        ('978-0451524935', '1984',                                1, 1, 'Secker and Warburg', 1949, 5, 3, 2.00),
        ('978-0439708180', 'Harry Potter and the Sorcerers Stone', 2, 1, 'Scholastic',         1997, 4, 2, 1.50),
        ('978-0062316097', 'Sapiens',                             3, 2, 'Harper',              2011, 3, 2, 2.50),
        ('978-0060883287', 'One Hundred Years of Solitude',       4, 1, 'Harper and Row',      1967, 2, 1, 2.00),
        ('978-0062073501', 'And Then There Were None',            5, 5, 'HarperCollins',       1939, 6, 4, 1.00),
        ('978-0451526342', 'Animal Farm',                         1, 1, 'Secker and Warburg',  1945, 3, 2, 2.00),
        ('978-0385490818', 'The Name of the Rose',                3, 5, 'Harcourt',            1980, 2, 2, 1.50)
      `);

      await conn.query(`
        INSERT INTO Members (name,email,phone,address,membership_date,expiry_date,status) VALUES
        ('Alice Johnson', 'alice@email.com',  '9876543210', '12 Baker St', '2024-01-10', '2025-01-10', 'Active'),
        ('Bob Smith',     'bob@email.com',    '9123456789', '34 Elm Ave',  '2024-03-05', '2025-03-05', 'Active'),
        ('Carol White',   'carol@email.com',  '9001122334', '78 Oak Lane', '2023-06-20', '2024-06-20', 'Expired'),
        ('David Lee',     'david@email.com',  '9988776655', '56 Pine Rd',  '2024-07-15', '2025-07-15', 'Active'),
        ('Eve Martinez',  'eve@email.com',    '9871234567', '90 Maple Dr', '2024-09-01', '2025-09-01', 'Active')
      `);

      await conn.query(`
        INSERT INTO Staff (name,email,phone,role,password,joined_date) VALUES
        ('Sarah Connor', 'sarah@library.org', '9001234567', 'Admin',     'password', '2020-01-15'),
        ('James Brown',  'james@library.org', '9007654321', 'Librarian', 'password', '2021-06-01'),
        ('Linda Green',  'linda@library.org', '9009876543', 'Assistant', 'password', '2023-03-20')
      `);

      await conn.query(`
        INSERT INTO Borrowings (member_id,book_id,staff_id,borrow_date,due_date,return_date,status) VALUES
        (1, 1, 2, '2024-11-01', '2024-11-15', '2024-11-14', 'Returned'),
        (2, 3, 2, '2024-11-05', '2025-01-10', NULL,          'Borrowed'),
        (4, 2, 3, '2024-10-20', '2024-11-03', '2024-11-10', 'Returned'),
        (5, 5, 2, '2024-11-10', '2025-01-20', NULL,          'Borrowed'),
        (1, 4, 2, '2024-11-12', '2025-01-05', NULL,          'Borrowed')
      `);

      await conn.query(`
        INSERT INTO Fines (borrowing_id, amount, payment_status) VALUES (3, 10.50, 'Pending')
      `);

      await conn.query(`
        INSERT INTO Reservations (member_id,book_id,reserved_date,expiry_date,status) VALUES
        (3, 1, '2024-11-18', '2025-02-25', 'Active'),
        (2, 2, '2024-11-15', '2025-02-22', 'Active')
      `);
    }

    console.log('✅ Database initialized');

  } finally {
    conn.release();
  }
}