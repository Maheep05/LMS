# SQL Concepts Reference Guide

This guide documents the SQL concepts associated with each button/action in the Library Management System. Hover over any button to see the SQL concept being used.

## Books Page
| Button | SQL Concept | Description |
|--------|-----------|-------------|
| **Add Book** | INSERT | Adds new book record to database |
| **Edit** (pencil icon) | UPDATE | Modifies existing book data |
| **Delete** (trash icon) | DELETE | Removes book record from database |
| **Add Author** | INSERT | Adds new author to database |

## Members Page
| Button | SQL Concept | Description |
|--------|-----------|-------------|
| **Register Member** | INSERT | Adds new member record to database |
| **Edit** (pencil icon) | UPDATE | Modifies existing member data |
| **Toggle Status** (toggle icon) | UPDATE with CASE | Conditionally updates member status (Active/Suspended) |
| **Delete** (trash icon) | DELETE | Removes member record from database |

## Borrowings Page
| Button | SQL Concept | Description |
|--------|-----------|-------------|
| **Issue Book Section** | INSERT / Stored Procedure | Issues book via stored procedure with transaction handling |

## Returns Page
| Button | SQL Concept | Description |
|--------|-----------|-------------|
| **Return** | UPDATE + Trigger | Updates borrow status and auto-calculates fines |

## Fines Page
| Button | SQL Concept | Description |
|--------|-----------|-------------|
| **Collect** | UPDATE | Updates fine payment status to 'Paid' |
| **Waive** | UPDATE | Marks fine as waived |
| **Tab Filters** | SELECT with WHERE | Retrieves fines filtered by payment status |

## Reservations Page
| Button | SQL Concept | Description |
|--------|-----------|-------------|
| **New Reservation** | INSERT | Creates new book reservation record |
| **Reserve** (confirm) | INSERT | Adds new reservation with member & book relationship |
| **Cancel** | UPDATE with FK | Updates reservation status with foreign key constraint |

## Key SQL Concepts Used

### 1. **SELECT**
- Basic data retrieval
- Often combined with WHERE, JOINs, and filtering
- Example: Getting filtered fines by payment status

### 2. **INSERT**
- Creates new records in the database
- Examples: Adding books, members, reservations
- May involve relationships between tables

### 3. **UPDATE**
- Modifies existing records
- Can include CASE statements for conditional updates
- May trigger calculations or cascading updates

### 4. **DELETE**
- Removes records from the database
- May be constrained by foreign keys
- Example: Removing books or members

### 5. **UPDATE with CASE**
- Conditional update logic
- Example: Toggle member status based on current state

### 6. **UPDATE with Trigger**
- Updates that automatically trigger other operations
- Example: Book return automatically calculates fines

### 7. **Stored Procedure**
- Complex operations bundled into database functions
- Example: Issue Book involves multiple steps with transactions

### 8. **UPDATE with FK (Foreign Key)**
- Updates respecting relational constraints
- Example: Canceling reservations with member/book relationships

## How to Use

1. **Hover over any button** in the application to see the SQL concept tooltip
2. **Refer to this guide** for detailed descriptions of each concept
3. **Learn the database operations** behind each action in the UI

## Benefits

- 🎓 **Educational**: Learn SQL concepts by using the application
- 🔍 **Transparent**: Understand what database operations are happening
- 📚 **Reference**: Quick lookup for SQL concepts used in each action
- 🚀 **CRUD Operations**: See all basic database operations in action
