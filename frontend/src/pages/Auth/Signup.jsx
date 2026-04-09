import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Shield, CheckCircle, BookOpen, TrendingUp, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { signup as signupAPI } from '../../lib/api.js'

export default function Signup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Librarian'
  })
  const [errors, setErrors] = useState({})

  // Enable dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }, [])

  const ROLES = ['Admin', 'Librarian', 'Assistant']

  const validateForm = () => {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Password must have uppercase, lowercase, and number'
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) {
      setErrors(err => ({ ...err, [k]: '' }))
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await signupAPI({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      })

      const { token, user } = response.data
      
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      toast.success(`Welcome, ${user.name}! Account created successfully.`)
      navigate('/dashboard')
    } catch (e) {
      if (e.message.includes('already exists')) {
        toast.error('Email already registered')
        setErrors({ email: 'Email already in use' })
      } else {
        toast.error(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex dark" style={{ backgroundColor: '#0f0f0f' }}>
      {/* Left Section - Content & Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">LMS</h2>
              <p className="text-sm text-gray-400">Library System</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Join Our Team</h1>
              <p className="text-lg text-gray-300">Become part of the library management platform trusted by modern institutions.</p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Powerful Tools</h3>
                  <p className="text-sm text-gray-400">Complete suite of tools for library management and analytics.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Role-based Access</h3>
                  <p className="text-sm text-gray-400">Choose your role: Admin, Librarian, or Staff with appropriate permissions.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Secure & Reliable</h3>
                  <p className="text-sm text-gray-400">Enterprise-grade security with bcrypt encryption and JWT authentication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="border-t border-gray-700 pt-6">
          <p className="text-sm text-gray-400">Already have an account?</p>
          <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition text-sm mt-2 inline-block">
            Sign in instead
          </Link>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Create Account</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Staff Account</h2>
            <p className="text-gray-400">Register as a library staff member</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="John Doe"
                value={form.name}
                onChange={set('name')}
                disabled={loading}
                style={errors.name ? { borderColor: '#ef4444' } : {}}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="john@library.com"
                value={form.email}
                onChange={set('email')}
                disabled={loading}
                style={errors.email ? { borderColor: '#ef4444' } : {}}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Role
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-500 transition"
                value={form.role}
                onChange={set('role')}
                disabled={loading}
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {form.role === 'Admin' && '👨‍💼 Full system access & user management'}
                {form.role === 'Librarian' && '📚 Book & member management'}
                {form.role === 'Staff' && '👥 Support & assistance'}
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                disabled={loading}
                style={errors.password ? { borderColor: '#ef4444' } : {}}
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">✓ 6+ characters | ✓ Uppercase & lowercase | ✓ Number</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                disabled={loading}
                style={errors.confirmPassword ? { borderColor: '#ef4444' } : {}}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 rounded-lg bg-gray-900 border border-gray-800">
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our terms and privacy policy.
              <strong className="text-blue-400" style={{ marginLeft: '0.25rem' }}>Account requires admin approval.</strong>
            </p>
          </div>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
