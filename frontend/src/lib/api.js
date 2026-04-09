import axios from 'axios';
import { deduplicate, debounceAsync } from './rateLimit.js';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Add auth token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Request failed';
    // // Handle 401 - unauthorized
    // if (err.response?.status === 401) {
    //   localStorage.removeItem('authToken');
    //   localStorage.removeItem('user');
    //   window.location.href = '/login';
    // }
    return Promise.reject(new Error(msg));
  }
);

// Dashboard
export const getDashboard   = deduplicate(() => api.get('/dashboard'));
export const getCategoryReport = deduplicate(() => api.get('/reports/categories'));

// Books
export const getBooks       = debounceAsync((params)  => api.get('/books', { params }), 300);
export const getBook        = deduplicate((id)      => api.get(`/books/${id}`));
export const createBook     = (data)    => api.post('/books', data);
export const updateBook     = (id, data)=> api.put(`/books/${id}`, data);
export const deleteBook     = (id)      => api.delete(`/books/${id}`);

// Authors & Categories
export const getAuthors     = deduplicate(() => api.get('/authors'));
export const createAuthor   = (data)    => api.post('/authors', data);
export const getCategories  = deduplicate(() => api.get('/categories'));
export const createCategory = (data)    => api.post('/categories', data);

// Members
export const getMembers     = debounceAsync((params)  => api.get('/members', { params }), 300);
export const getMember      = deduplicate((id)      => api.get(`/members/${id}`));
export const createMember   = (data)    => api.post('/members', data);
export const updateMember   = (id, data)=> api.put(`/members/${id}`, data);
export const deleteMember   = (id)      => api.delete(`/members/${id}`);

// Borrowings
export const getBorrowings  = debounceAsync((params)  => api.get('/borrowings', { params }), 300);
export const issueBook      = (data)    => api.post('/borrowings', data);
export const returnBook     = (id)      => api.post(`/borrowings/${id}/return`);

// Fines
export const getFines       = debounceAsync((params)  => api.get('/fines', { params }), 300);
export const payFine        = (id)      => api.post(`/fines/${id}/pay`);
export const waiveFine      = (id)      => api.post(`/fines/${id}/waive`);

// Reservations
export const getReservations    = debounceAsync((params) => api.get('/reservations', { params }), 300);
export const createReservation  = (data)   => api.post('/reservations', data);
export const cancelReservation  = (id)     => api.post(`/reservations/${id}/cancel`);

// Staff
export const getStaff       = deduplicate(() => api.get('/staff'));
export const createStaff    = (data)    => api.post('/staff', data);
export const updateStaff    = (id, data)=> api.put(`/staff/${id}`, data);
export const deleteStaff    = (id)      => api.delete(`/staff/${id}`);

// Authentication
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data); // Note: Backend signup endpoint needed
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

export default api;
