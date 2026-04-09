// Input validation and sanitization middleware

/**
 * Sanitize string input - trim whitespace, escape dangerous characters
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .substring(0, 500) // Limit to 500 chars
    .replace(/[<>"']/g, ''); // Remove dangerous HTML chars
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 255;
}

/**
 * Validate phone format (basic)
 */
export function validatePhone(phone) {
  const regex = /^[+]?[0-9\s\-()]{6,20}$/;
  return regex.test(phone) && phone.length <= 20;
}

/**
 * Validate numeric ID (must be positive integer)
 */
export function validateNumericId(id) {
  return !isNaN(id) && parseInt(id) > 0;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDateFormat(date) {
  if (!date) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Middleware: Validate all request parameters
 */
export function validateInput(req, res, next) {
  // Validate URL parameters (must be numeric IDs)
  if (req.params.id && !validateNumericId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format - must be a positive integer',
    });
  }

  // Validate query parameters (common filters)
  const { search, status, category_id, member_id } = req.query;
  if (search && search.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Search query too long (max 500 characters)',
    });
  }
  if (category_id && !validateNumericId(category_id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category_id - must be a positive integer',
    });
  }
  if (member_id && !validateNumericId(member_id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid member_id - must be a positive integer',
    });
  }
  if (status && !['Active', 'Inactive', 'Suspended', 'Expired', 'Borrowed', 'Returned', 'Overdue', 'Pending', 'Paid', 'Waived'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value',
    });
  }

  // Sanitize body fields (for POST/PUT requests)
  if (req.body) {
    const { name, email, phone, address, role, password, title, isbn, publisher } = req.body;
    
    if (name && (typeof name !== 'string' || name.length < 2 || name.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid name - must be 2-100 characters',
      });
    }
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }
    
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone format',
      });
    }
    
    if (address && (typeof address !== 'string' || address.length > 500)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address - max 500 characters',
      });
    }
    
    if (role && !['Admin', 'Librarian', 'Assistant'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role - must be Admin, Librarian, or Assistant',
      });
    }
    
    if (password && (typeof password !== 'string' || password.length < 6 || password.length > 128)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password - must be 6-128 characters',
      });
    }
    
    if (title && (typeof title !== 'string' || title.length < 1 || title.length > 255)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid title - must be 1-255 characters',
      });
    }
    
    if (isbn && (typeof isbn !== 'string' || isbn.length < 10 || isbn.length > 20)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ISBN - must be 10-20 characters',
      });
    }
    
    if (publisher && (typeof publisher !== 'string' || publisher.length > 255)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid publisher - max 255 characters',
      });
    }
  }

  next();
}

/**
 * Sanitize object fields
 */
export function sanitizeObject(obj) {
  if (!obj) return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
