import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
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
