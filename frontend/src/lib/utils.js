export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatCurrency = (n) =>
  `₹${(+n || 0).toFixed(2)}`;

export const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const daysSince = (dateStr) => {
  const diff = new Date() - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const today = () => new Date().toISOString().split('T')[0];

export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export const statusBadge = (status) => {
  const map = {
    Active: 'badge-green', Borrowed: 'badge-blue', Returned: 'badge-green',
    Overdue: 'badge-red', Pending: 'badge-yellow', Paid: 'badge-green',
    Waived: 'badge-gray', Suspended: 'badge-red', Expired: 'badge-gray',
    Fulfilled: 'badge-green', Cancelled: 'badge-gray',
  };
  return map[status] || 'badge-gray';
};
