import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Auth/Signup.jsx'
import Dashboard    from './pages/Dashboard.jsx'
import Books        from './pages/Books.jsx'
import Members      from './pages/Members.jsx'
import Borrowings   from './pages/Borrowings.jsx'
import Returns      from './pages/Returns.jsx'
import Fines        from './pages/Fines.jsx'
import Reservations from './pages/Reservations.jsx'
import Reports      from './pages/Reports.jsx'
import Staff        from './pages/Staff.jsx'
import Settings     from './pages/Settings.jsx'

function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')
    setIsAuth(!!(token && user))
    setLoading(false)
  }, [])

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading...</p>
      </div>
    </div>
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="books"        element={<Books />} />
        <Route path="members"      element={<Members />} />
        <Route path="borrowings"   element={<Borrowings />} />
        <Route path="returns"      element={<Returns />} />
        <Route path="fines"        element={<Fines />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="reports"      element={<Reports />} />
        <Route path="staff"        element={<Staff />} />
        <Route path="settings"     element={<Settings />} />
      </Route>
    </Routes>
  )
}
