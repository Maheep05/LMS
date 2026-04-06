import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { queryOne } from '../db/pool.js';
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
