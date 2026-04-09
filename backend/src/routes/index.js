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
import { login, logout, me, signup } from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter, writeLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/reports/categories', getCategoryReport);

// Books
router.get('/books',         getBooks);
router.get('/books/:id',     getBook);
router.post('/books',        writeLimiter, createBook);
router.put('/books/:id',     writeLimiter, updateBook);
router.delete('/books/:id',  writeLimiter, deleteBook);

// Authors & Categories
router.get('/authors',       getAuthors);
router.post('/authors',      writeLimiter, createAuthor);
router.get('/categories',    getCategories);
router.post('/categories',   writeLimiter, createCategory);

// Members
router.get('/members',       getMembers);
router.get('/members/:id',   getMember);
router.post('/members',      writeLimiter, createMember);
router.put('/members/:id',   writeLimiter, updateMember);
router.delete('/members/:id',writeLimiter, deleteMember);

// Borrowings
router.get('/borrowings',    getBorrowings);
router.post('/borrowings',   writeLimiter, issueBook);
router.post('/borrowings/:id/return', writeLimiter, returnBook);

// Fines
router.get('/fines',         getFines);
router.post('/fines/:id/pay',   writeLimiter, payFine);
router.post('/fines/:id/waive', writeLimiter, waiveFine);

// Reservations
router.get('/reservations',          getReservations);
router.post('/reservations',         writeLimiter, createReservation);
router.post('/reservations/:id/cancel', writeLimiter, cancelReservation);

// Staff
router.get('/staff',         getStaff);
router.post('/staff',        writeLimiter, createStaff);
router.put('/staff/:id',     writeLimiter, updateStaff);
router.delete('/staff/:id',  writeLimiter, deleteStaff);

// Auth (with strict rate limiting)
router.post('/auth/login', login);
router.post('/auth/signup', signup);
router.post('/auth/logout', logout);
router.get('/auth/me', requireAuth, me);

export default router;
