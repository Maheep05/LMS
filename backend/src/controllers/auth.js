import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { queryOne, query } from '../db/pool.js';
import { asyncHandler } from '../middleware/error.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '8h';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  const staff = await queryOne('SELECT * FROM Staff WHERE email=?', [email]);
  if (!staff) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  let ok = false;
  if (staff.password && staff.password.startsWith('$2')) {
    ok = await bcrypt.compare(password, staff.password);
  } else {
    ok = password === staff.password;
  }

  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const payload = { staff_id: staff.staff_id, name: staff.name, role: staff.role, email: staff.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.json({ success: true, data: { token, user: payload } });
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, email, and password required' 
    });
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email format' 
    });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters' 
    });
  }

  // Check if staff already exists
  const existing = await queryOne('SELECT * FROM Staff WHERE email=?', [email]);
  if (existing) {
    return res.status(409).json({ 
      success: false, 
      message: 'Email already registered' 
    });
  }

  // Hash password with bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create staff record
  const today = new Date().toISOString().split('T')[0];
  const result = await query(
    'INSERT INTO Staff (name, email, password, role, joined_date) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, role || 'Librarian', today]
  );

  const staffId = result.insertId;

  // Generate token
  const payload = { staff_id: staffId, name, role: role || 'Librarian', email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.status(201).json({ 
    success: true, 
    message: 'Account created successfully',
    data: { token, user: payload } 
  });
});

export const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: client should remove token. Return success for convenience.
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, message: 'No token provided' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, data: payload });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});
