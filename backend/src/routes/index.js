import { Router } from 'express';
import { getBooks, getBook, createBook, updateBook, deleteBook } from '../controllers/books.js';
import { getMembers, getMember, createMember, updateMember, deleteMember } from '../controllers/members.js';
import {
  getBorrowings, issueBook, returnBook,
  getFines, payFine, waiveFine,
  getReservations, createReservation, cancelReservation,
  getStaff, createStaff, updateStaff, deleteStaff,
  getAuthors, createAuthor, getCategories, createCategory,
  getDashboardStats, getCategoryReport,
} from '../controllers/library.js';
import { login, logout, me } from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/reports/categories', getCategoryReport);

// Books
router.get('/books',         getBooks);
router.get('/books/:id',     getBook);
router.post('/books',        createBook);
router.put('/books/:id',     updateBook);
router.delete('/books/:id',  deleteBook);

// Authors & Categories
router.get('/authors',       getAuthors);
router.post('/authors',      createAuthor);
router.get('/categories',    getCategories);
router.post('/categories',   createCategory);

// Members
router.get('/members',       getMembers);
router.get('/members/:id',   getMember);
router.post('/members',      createMember);
router.put('/members/:id',   updateMember);
router.delete('/members/:id',deleteMember);

// Borrowings
router.get('/borrowings',    getBorrowings);
router.post('/borrowings',   issueBook);
router.post('/borrowings/:id/return', returnBook);

// Fines
router.get('/fines',         getFines);
router.post('/fines/:id/pay',   payFine);
router.post('/fines/:id/waive', waiveFine);

// Reservations
router.get('/reservations',          getReservations);
router.post('/reservations',         createReservation);
router.post('/reservations/:id/cancel', cancelReservation);

// Staff
router.get('/staff',         getStaff);
router.post('/staff',        createStaff);
router.put('/staff/:id',     updateStaff);
router.delete('/staff/:id',  deleteStaff);

// Auth
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', requireAuth, me);

export default router;
