import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (r) => r.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

// Dashboard
export const getDashboard   = ()        => api.get('/dashboard');
export const getCategoryReport = ()     => api.get('/reports/categories');

// Books
export const getBooks       = (params)  => api.get('/books', { params });
export const getBook        = (id)      => api.get(`/books/${id}`);
export const createBook     = (data)    => api.post('/books', data);
export const updateBook     = (id, data)=> api.put(`/books/${id}`, data);
export const deleteBook     = (id)      => api.delete(`/books/${id}`);

// Authors & Categories
export const getAuthors     = ()        => api.get('/authors');
export const createAuthor   = (data)    => api.post('/authors', data);
export const getCategories  = ()        => api.get('/categories');
export const createCategory = (data)    => api.post('/categories', data);

// Members
export const getMembers     = (params)  => api.get('/members', { params });
export const getMember      = (id)      => api.get(`/members/${id}`);
export const createMember   = (data)    => api.post('/members', data);
export const updateMember   = (id, data)=> api.put(`/members/${id}`, data);
export const deleteMember   = (id)      => api.delete(`/members/${id}`);

// Borrowings
export const getBorrowings  = (params)  => api.get('/borrowings', { params });
export const issueBook      = (data)    => api.post('/borrowings', data);
export const returnBook     = (id)      => api.post(`/borrowings/${id}/return`);

// Fines
export const getFines       = (params)  => api.get('/fines', { params });
export const payFine        = (id)      => api.post(`/fines/${id}/pay`);
export const waiveFine      = (id)      => api.post(`/fines/${id}/waive`);

// Reservations
export const getReservations    = (params) => api.get('/reservations', { params });
export const createReservation  = (data)   => api.post('/reservations', data);
export const cancelReservation  = (id)     => api.post(`/reservations/${id}/cancel`);

// Staff
export const getStaff       = ()        => api.get('/staff');
export const createStaff    = (data)    => api.post('/staff', data);
export const updateStaff    = (id, data)=> api.put(`/staff/${id}`, data);
export const deleteStaff    = (id)      => api.delete(`/staff/${id}`);

export default api;
