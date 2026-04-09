# 🔐 Authentication System - Quick Start Guide

## What's New

Your Library Management System now has a **complete authentication system** with:

✅ **Login Page** - Secure staff authentication  
✅ **Signup Page** - New staff registration  
✅ **Protected Routes** - All pages require authentication  
✅ **JWT Tokens** - Secure token-based auth  
✅ **Form Validation** - Real-time validation feedback  
✅ **Session Management** - Auto token refresh & cleanup  

---

## 🚀 Getting Started

### 1. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. Test Login

**Open browser:** http://localhost:5173

You'll be redirected to `/login`

**Demo Credentials:**
```
Email: admin@library.com
Password: admin123
```

Click **Sign In** → You'll be redirected to `/dashboard` ✅

---

## 📋 User Flows

### Flow 1: Login (Existing Staff)

```
http://localhost:5173
    ↓
Not authenticated → Redirect to /login
    ↓
User enters email & password
    ↓
Click "Sign In"
    ↓
Validated on frontend + sent to backend
    ↓
Backend verifies credentials & generates JWT token
    ↓
Token stored in localStorage
    ↓
Redirect to /dashboard (now accessible)
    ↓
All API requests include Authorization: Bearer <token>
```

### Flow 2: Signup (New Staff)

```
Click "Contact Admin" link on login page
    ↓
Go to /signup
    ↓
Fill form: Name, Email, Password, Role
    ↓
Frontend validates:
   • Email format: valid@email.com
   • Password strength: 6+ chars, uppercase, lowercase, number
   • Passwords match
    ↓
Click "Create Account"
    ↓
Backend creates account in Staff table
    ↓
Backend generates JWT token
    ↓
Token stored in localStorage
    ↓
Redirect to /dashboard
```

### Flow 3: Logout

```
In dashboard → Click logout icon (top right)
    ↓
Clear localStorage (authToken & user)
    ↓
Redirect to /login
    ↓
Next request to /dashboard → No token → Redirect to /login again
```

---

## 🔑 Pages

### Login Page: `/login`

**File:** `frontend/src/pages/Login.jsx`

**Features:**
- Email validation
- Password validation
- Live error messages
- Demo credentials display
- Security tips

**Test Cases:**
```
✓ Valid login: admin@library.com / admin123
✗ Wrong password: Shows "Invalid email or password"
✗ Invalid email: Shows "Please enter a valid email address"
✗ Empty fields: Shows field-specific errors
```

### Signup Page: `/signup`

**File:** `frontend/src/pages/Auth/Signup.jsx`

**Features:**
- Name, email, password, role
- Password strength requirements
- Confirm password matching
- Role selection with descriptions
- Terms & account approval notice

**Password Requirements:**
- ✓ At least 6 characters
- ✓ Has uppercase letter (A-Z)
- ✓ Has lowercase letter (a-z)
- ✓ Has a number (0-9)

**Test Cases:**
```
✓ Valid signup: All fields + strong password
✗ Weak password: Pass123 (no lowercase)
✗ Passwords don't match: Show error
✗ Email already exists: Show "Email already registered"
✗ Invalid email: Show "Please enter a valid email address"
```

---

## 🔒 Security Features

### Frontend
- ✅ Passwords never stored (only token)
- ✅ Tokens auto-cleared on 401
- ✅ Auto-redirect to login on expiration
- ✅ Form validation before sending
- ✅ XSS protection via React

### Backend
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens valid for 8 hours
- ✅ Rate limiting on login/signup attempts
- ✅ Access token validation on every request
- ✅ CORS restricted to frontend origin

---

## 📁 Files Created/Updated

### Created Files
| File | Purpose |
|------|---------|
| `frontend/src/pages/Login.jsx` | Login page |
| `frontend/src/pages/Auth/Signup.jsx` | Signup page |
| `frontend/src/hooks/useAuth.js` | Auth state hook |
| `AUTHENTICATION_GUIDE.md` | Detailed documentation |
| `AUTH_QUICKSTART.md` | This file |

### Updated Files
| File | Changes |
|------|---------|
| `frontend/src/App.jsx` | Added login/signup routes + ProtectedRoute |
| `frontend/src/lib/api.js` | Added auth functions + token interceptor |
| `frontend/src/components/Layout.jsx` | Added logout button + user profile |
| `backend/src/controllers/auth.js` | Added signup function |
| `backend/src/routes/index.js` | Added signup route |

---

## 🧪 Testing Checklist

### Backend API Tests

```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"admin123"}'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGc...",
#     "user": {
#       "staff_id": 1,
#       "name": "Admin",
#       "role": "Admin",
#       "email": "admin@library.com"
#     }
#   }
# }
```

```bash
# Test signup endpoint
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@library.com",
    "password":"Pass123",
    "role":"Librarian"
  }'
```

### Frontend Tests

1. **Test Login:**
   - [ ] Open http://localhost:5173
   - [ ] Should redirect to /login (no token)
   - [ ] Enter admin@library.com / admin123
   - [ ] Click Sign In
   - [ ] Should redirect to /dashboard
   - [ ] User name shows in top right

2. **Test Logout:**
   - [ ] Click logout icon (top right)
   - [ ] Should redirect to /login
   - [ ] Try to access /dashboard directly
   - [ ] Should redirect to /login again

3. **Test Token Persistence:**
   - [ ] Login successfully
   - [ ] Refresh page (F5)
   - [ ] Should stay logged in
   - [ ] User info preserved

4. **Test Form Validation:**
   - [ ] Invalid email format → Error
   - [ ] Empty password → Error
   - [ ] Password < 6 chars → Error
   - [ ] Weak password → Error
   - [ ] Passwords don't match → Error

5. **Test Signup:**
   - [ ] Click "Contact Admin" on login
   - [ ] Fill signup form
   - [ ] Click Create Account
   - [ ] Should redirect to /dashboard

6. **Test 401 Errors:**
   - [ ] Clear localStorage.authToken manually
   - [ ] Try any page
   - [ ] Should redirect to /login

---

## 🔧 Troubleshooting

### Issue: "Invalid credentials" on correct password

**Solution:**
- Check backend database has admin user
- Verify password in database (should be hashed or plain)
- Check JWT_SECRET in .env matches

### Issue: React warning about key prop

**Solution:**
- This is a DiceBear avatar generation warning
- Safe to ignore, already handled

### Issue: CORS error when logging in

**Solution:**
- Ensure backend has CORS enabled
- Check `CORS_ORIGIN` in backend/src/index.js
- Should be: `http://localhost:5173`

### Issue: Token not persisting after refresh

**Solution:**
- Check browser localStorage is enabled
- Open DevTools → Application → localStorage
- Should see `authToken` and `user` keys

### Issue: Signup shows "Email already registered"

**Solution:**
- Email already exists in Staff table
- Use different email for signup
- Or check database directly: `SELECT * FROM Staff WHERE email='...';`

---

## 📚 API Endpoints

### Authentication Endpoints

**POST /api/auth/login**
```json
Request:
{
  "email": "admin@library.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "staff_id": 1,
      "name": "Admin",
      "role": "Admin",
      "email": "admin@library.com"
    }
  }
}
```

**POST /api/auth/signup**
```json
Request:
{
  "name": "John Doe",
  "email": "john@library.com",
  "password": "Pass123",
  "role": "Librarian"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

**POST /api/auth/logout**
```json
Response:
{
  "success": true,
  "message": "Logged out"
}
```

**GET /api/auth/me**
```
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "staff_id": 1,
    "name": "Admin",
    "role": "Admin",
    "email": "admin@library.com"
  }
}
```

---

## 🚨 Important Notes

1. **Demo User:** `admin@library.com` / `admin123` - Use this to test
2. **Token Expiry:** 8 hours (set in `TOKEN_EXPIRY` env var)
3. **Passwords:** Must be hashed before stored in database
4. **JWT Secret:** Change `JWT_SECRET` in production
5. **HTTPS:** Always use HTTPS in production (not just HTTP)

---

## 📞 Next Steps

1. ✅ Test login with demo credentials
2. ✅ Test signup with new user
3. ✅ Test logout
4. ✅ Verify all pages are protected
5. 🔄 Add email verification (optional)
6. 🔄 Add password reset flow (optional)
7. 🔄 Add 2FA/MFA (optional)

---

## ❓ Questions?

- **Authentication Guide:** See `AUTHENTICATION_GUIDE.md`
- **SQL Concepts:** See `SQL_CONCEPTS_REFERENCE.md`
- **API Docs:** Check backend/src/routes/index.js
- **Frontend Code:** Check frontend/src/pages/Login.jsx & Signup.jsx

**Happy coding!** 🎉
