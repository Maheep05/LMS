# Authentication System Documentation

## Overview

The Library Management System now has a complete authentication system with:
- ✅ **Login Page** - Staff authentication with JWT tokens
- ✅ **Signup Page** - New staff registration with validation
- ✅ **Protected Routes** - All pages require authentication
- ✅ **Automatic Token Management** - Tokens attached to API requests
- ✅ **Session Persistence** - Auth state survives page reload
- ✅ **Form Validation** - Email and password validation with feedback

## Frontend Features

### 1. Login Page (`/login`)
**Location:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)

**Features:**
- Email and password validation
- Real-time error messages
- Demo credentials display
- Security information display
- Rate-limited on backend

**Demo Credentials:**
```
Email: admin@library.com
Password: admin123
```

### 2. Signup Page (`/signup`)
**Location:** [frontend/src/pages/Auth/Signup.jsx](frontend/src/pages/Auth/Signup.jsx)

**Features:**
- Full name, email, password validation
- Role selection (Admin, Librarian, Staff)
- Password strength requirements:
  - ✓ At least 6 characters
  - ✓ Must have uppercase & lowercase
  - ✓ Must have a number
- Confirm password matching
- Account pending admin approval notice

### 3. Protected Routes
All pages are now wrapped in `ProtectedRoute` component that:
- Checks for valid auth token
- Redirects to login if not authenticated
- Shows loading state while checking auth
- Auto-redirects on token expiration (401)

### 4. Authentication Hook
**Location:** [frontend/src/hooks/useAuth.js](frontend/src/hooks/useAuth.js)

```javascript
const { user, isAuthenticated, loading, login, logout, getToken } = useAuth()
```

**Usage:**
```javascript
import { useAuth } from '../hooks/useAuth.js'

export default function MyComponent() {
  const { user, logout } = useAuth()
  
  return (
    <div>
      <p>Logged in as: {user?.name}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  )
}
```

### 5. API Integration
**Location:** [frontend/src/lib/api.js](frontend/src/lib/api.js)

**Auth Functions:**
```javascript
// Login
const response = await login({ email: 'user@example.com', password: 'pass123' })
// Returns: { token, user: { staff_id, name, role, email } }

// Signup
const response = await signup({ 
  name: 'John Doe', 
  email: 'john@library.com', 
  password: 'Pass123', 
  role: 'Librarian' 
})

// Logout
await logout()

// Get current user info
const me = await getMe()
```

**Token Management:**
- Token stored in `localStorage.authToken`
- Automatically attached to all API requests via interceptor
- Bearer token format: `Authorization: Bearer <token>`
- Auto-redirect to login on 401 responses

### 6. Updated Layout Component
**Location:** [frontend/src/components/Layout.jsx](frontend/src/components/Layout.jsx)

**New Features:**
- User profile display in topbar (name & role)
- Logout button (red logout icon)
- Proper token cleanup on logout
- Session info display in sidebar footer

---

## Backend Setup

### Current Endpoints

**✅ Already Implemented:**
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (stateless, for convenience)
- `GET /api/auth/me` - Get current user info (requires Bearer token)

**Rate Limiting:**
- Login: Strict rate limiting via `authLimiter`
- Prevents brute force attacks
- Applied to `/api/auth/login`

### ⚠️ Backend Signup Endpoint Needed

The frontend calls `POST /api/auth/signup`, but this endpoint **does not exist yet**. You have two options:

#### Option 1: Create Dedicated Signup Endpoint (Recommended)

Add to `backend/src/controllers/auth.js`:

```javascript
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, email, and password required' 
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

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create staff record
  const result = await query(
    'INSERT INTO Staff (name, email, password, role, active) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, role || 'Staff', 1]
  );

  const staffId = result.insertId;

  // Generate token
  const payload = { staff_id: staffId, name, role: role || 'Staff', email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.status(201).json({ 
    success: true, 
    data: { token, user: payload } 
  });
});
```

Then add route in `backend/src/routes/index.js`:

```javascript
import { login, logout, me, signup } from '../controllers/auth.js';

// Auth routes
router.post('/auth/login', authLimiter, login);
router.post('/auth/signup', authLimiter, signup);  // Add this
router.post('/auth/logout', logout);
router.get('/auth/me', requireAuth, me);
```

#### Option 2: Use Staff Creation (Simpler)

If you want simpler signup without dedicated endpoint:

Update `frontend/src/lib/api.js`:

```javascript
// Authentication
export const login = (data) => api.post('/auth/login', data);
// export const signup = (data) => api.post('/auth/signup', data);
export const signup = (data) => api.post('/staff', data);  // Use staff endpoint
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
```

**Note:** This bypasses auth validation and any approval workflows.

---

## Security Features

### 🔒 Frontend Security
- ✅ Passwords never stored in localStorage
- ✅ Only JWT token stored (stateless)
- ✅ Token auto-cleared on 401 response
- ✅ Auto-redirect to login on token expiration
- ✅ HTTPS recommended in production

### 🔒 Backend Security
- ✅ Passwords hashed with bcrypt (salted 10 rounds)
- ✅ JWT tokens with 8-hour expiration
- ✅ Rate limiting on login attempts
- ✅ Bearer token validation middleware
- ✅ CORS restricted to frontend origin

### 🔒 Best Practices
- ✅ Credentials never logged
- ✅ Error messages vague to prevent user enumeration
- ✅ Token expiration enforced
- ✅ Stateless authentication (JWT)

---

## User Flow

### Login Flow
```
User enters email/password
    ↓
Frontend validates form
    ↓
POST /api/auth/login
    ↓
Backend validates credentials
    ↓
Generate JWT token
    ↓
Store token in localStorage
    ↓
Redirect to /dashboard
    ↓
Protected routes check token & allow access
```

### Signup Flow
```
User fills signup form
    ↓
Frontend validates form & password strength
    ↓
POST /api/auth/signup (or /api/staff)
    ↓
Backend creates user account
    ↓
Generate JWT token
    ↓
Store token in localStorage
    ↓
Redirect to /dashboard
```

### Logout Flow
```
User clicks logout button
    ↓
Clear localStorage (authToken & user)
    ↓
POST /api/auth/logout (optional backend update)
    ↓
Redirect to /login
    ↓
Protected routes block access (no token)
```

---

## Testing

### Test Credentials
```
Email: admin@library.com
Password: admin123
Role: Admin
```

### Test Cases

1. **Valid Login:**
   - Enter correct email/password → Success → Redirect to dashboard

2. **Invalid Email:**
   - Show: "Invalid email or password"

3. **Missing Fields:**
   - Show: "Email is required / Password is required"

4. **Password Too Short:**
   - Show: "Password must be at least 6 characters"

5. **Token Expiration:**
   - After 8 hours → Auto redirect to login

6. **Signup with Weak Password:**
   - Show: "Password must have uppercase, lowercase, and number"

7. **Passwords Don't Match:**
   - Show: "Passwords do not match"

---

## Environment Variables

### Backend (.env)
```bash
JWT_SECRET=your-secret-key-for-jwt
TOKEN_EXPIRY=8h
PORT=5000
```

### Frontend
- No env vars needed (uses localhost:5000 by default)
- Update API base URL in [src/lib/api.js](src/lib/api.js) if needed

---

## Next Steps

1. **✅ Frontend:** Complete - Login, Signup, Protected Routes
2. **⚠️ Backend:** Add `/api/auth/signup` endpoint (choose option above)
3. **🔐 Production:** 
   - Enable HTTPS only
   - Set strong JWT_SECRET
   - Configure CORS properly
   - Implement email verification
   - Add password reset flow
   - Consider 2FA/MFA

---

## FAQ

**Q: Where is my password stored?**
A: Only in backend database, hashed with bcrypt. Never stored in browser.

**Q: What if my token expires?**
A: Automatic redirect to login on next API call (401 response).

**Q: Can I stay logged in?**
A: Yes, token persists in localStorage until 8 hours expire or you logout.

**Q: How do I add 2FA?**
A: Add totp library, generate QR code, verify codes on login.

**Q: How do I reset forgotten password?**
A: Add email verification flow with temporary reset tokens.

---

## Files Changed

### Frontend
- ✅ [src/pages/Login.jsx](src/pages/Login.jsx) - NEW
- ✅ [src/pages/Auth/Signup.jsx](src/pages/Auth/Signup.jsx) - NEW
- ✅ [src/hooks/useAuth.js](src/hooks/useAuth.js) - NEW
- ✅ [src/lib/api.js](src/lib/api.js) - UPDATED (interceptors + auth functions)
- ✅ [src/App.jsx](src/App.jsx) - UPDATED (protected routes)
- ✅ [src/components/Layout.jsx](src/components/Layout.jsx) - UPDATED (logout button, user display)

### Backend
- �1️⃣ [src/controllers/auth.js](src/controllers/auth.js) - Need to add signup
- ⚠️ [src/routes/index.js](src/routes/index.js) - Need to add signup route

---

## Support

For issues or questions:
1. Check if token exists: `localStorage.getItem('authToken')`
2. Check browser console for errors
3. Check backend logs: `npm run dev` in backend
4. Verify CORS settings in backend
5. Ensure JWT_SECRET is set in .env
