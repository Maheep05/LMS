# 📚 Bibliotheca — Library Management System

A full-stack Library Management System built with **React + Node.js + MySQL**.

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Tailwind CSS |
| Backend   | Node.js, Express.js (ESM)               |
| Database  | MySQL 8+ with stored procedures/triggers|
| HTTP      | Axios, REST API                         |
| Build     | Vite 5, PostCSS, Autoprefixer           |

---

## Project Structure

```
library/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── books.js       # Books CRUD
│   │   │   ├── members.js     # Members CRUD
│   │   │   └── library.js     # Borrowings, Returns, Fines,
│   │   │                      # Reservations, Staff, Reports
│   │   ├── db/
│   │   │   ├── pool.js        # MySQL2 connection pool
│   │   │   └── init.js        # Schema + stored procedures
│   │   │                      # + triggers + seed data
│   │   ├── middleware/
│   │   │   └── error.js       # Global error handler
│   │   ├── routes/
│   │   │   └── index.js       # All 30+ REST routes
│   │   └── index.js           # Express app entry point
│   ├── .env                   # DB credentials (edit this)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Stats, charts, activity
    │   │   ├── Books.jsx        # Book catalogue + CRUD
    │   │   ├── Members.jsx      # Member registry + CRUD
    │   │   ├── Borrowings.jsx   # Issue books (sp_issue_book)
    │   │   ├── Returns.jsx      # Return books (sp_return_book)
    │   │   ├── Fines.jsx        # Fine collection & waiving
    │   │   ├── Reservations.jsx # Book holds management
    │   │   ├── Reports.jsx      # Analytics & charts
    │   │   └── Staff.jsx        # Staff management
    │   ├── components/
    │   │   ├── Layout.jsx       # Sidebar + topbar shell
    │   │   ├── Modal.jsx        # Reusable modal dialog
    │   │   └── UI.jsx           # Table, StatCard, Badge,
    │   │                        # Spinner, SearchBar, Confirm
    │   ├── hooks/
    │   │   └── useFetch.js      # Data fetching hooks
    │   ├── lib/
    │   │   ├── api.js           # Axios API client (all endpoints)
    │   │   └── utils.js         # Date, currency, badge helpers
    │   ├── App.jsx              # React Router setup
    │   ├── main.jsx             # App entry point
    │   └── index.css            # Tailwind + component classes
    ├── tailwind.config.js
    ├── vite.config.js           # Proxy /api → localhost:5000
    └── package.json

```

---

## Quick Start

### 1. Configure MySQL

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE LibraryDB;"

# Edit credentials
nano library/backend/.env
```

**.env file:**
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=LibraryDB
```

### 2. Start Backend

```bash
cd library/backend
npm install
npm start
# → API running on http://localhost:5000
# → Auto-creates all tables, views, procedures, triggers
# → Seeds sample data on first run
```

### 3. Start Frontend

```bash
cd library/frontend
npm install
npm run dev
# → App running on http://localhost:5173
```

---

## Database Concepts Implemented

### Tables (8)
`Authors`, `Categories`, `Books`, `Members`, `Staff`,
`Borrowings`, `Fines`, `Reservations`

### Constraints
- `PRIMARY KEY`, `FOREIGN KEY` with `ON DELETE RESTRICT / CASCADE`
- `UNIQUE` (ISBN, email), `NOT NULL`, `CHECK`, `DEFAULT`, `ENUM`

### Views (3)
- `vw_active_borrowings` — live borrowing dashboard
- `vw_book_availability` — availability with author/category join
- `vw_member_fines` — per-member fine summary

### Stored Procedures (2)
- `sp_issue_book(member_id, book_id, staff_id, loan_days)`
  - Validates member status, checks pending fines > ₹50,
    locks row with `FOR UPDATE`, decrements available_copies,
    auto-fulfills matching reservation
- `sp_return_book(borrowing_id)`
  - Marks returned, increments available_copies,
    calculates overdue fine and inserts into Fines table

### Triggers (2)
- `trg_check_overdue` — auto-sets status to 'Overdue' on update
- `trg_prevent_book_delete` — blocks delete if active borrowings exist

### Transactions (ACID)
- `sp_issue_book` and `sp_return_book` run inside explicit
  `BEGIN TRANSACTION … COMMIT / ROLLBACK` via the `transaction()`
  helper in `db/pool.js`

### Indexes (7)
On `author_id`, `category_id`, `member_id`, `book_id`,
`status` (Borrowings), `payment_status` (Fines), `status` (Members)

---

## API Endpoints

```
GET    /api/dashboard              Dashboard stats + charts
GET    /api/reports/categories     Category analytics

GET    /api/books                  List books (search, category, available filters)
POST   /api/books                  Create book
PUT    /api/books/:id              Update book
DELETE /api/books/:id              Delete book (blocked if borrowed)

GET    /api/members                List members (search, status filter)
POST   /api/members                Register member
PUT    /api/members/:id            Update member
DELETE /api/members/:id            Delete member

GET    /api/borrowings             List borrowings (status filter)
POST   /api/borrowings             Issue book → calls sp_issue_book
POST   /api/borrowings/:id/return  Return book → calls sp_return_book

GET    /api/fines                  List fines (status filter)
POST   /api/fines/:id/pay          Mark fine paid
POST   /api/fines/:id/waive        Waive fine

GET    /api/reservations           List reservations
POST   /api/reservations           Create reservation
POST   /api/reservations/:id/cancel Cancel reservation

GET    /api/staff                  List staff
POST   /api/staff                  Add staff
PUT    /api/staff/:id              Update staff
DELETE /api/staff/:id              Delete staff

GET    /api/authors                List authors
POST   /api/authors                Add author
GET    /api/categories             List categories
```

---

## Pages

| Page         | Route          | Features                                         |
|--------------|----------------|--------------------------------------------------|
| Dashboard    | /dashboard     | 6 stat cards, bar chart, top books, recent txns  |
| Books        | /books         | Search, category filter, add/edit/delete, avail. |
| Members      | /members       | Search, status filter, register/edit/suspend     |
| Issue Books  | /borrowings    | Issue form with due-date preview, active list    |
| Returns      | /returns       | Pending returns, fine preview, confirm modal     |
| Fines        | /fines         | Tab filter, collect/waive actions, totals        |
| Reservations | /reservations  | Create holds, cancel, auto-fulfill on issue      |
| Reports      | /reports       | Category breakdown, top books, top members       |
| Staff        | /staff         | Add/edit/remove staff, role summary cards        |

