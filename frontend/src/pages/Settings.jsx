import { useState } from 'react'
import toast from 'react-hot-toast'
import { Lock, Palette, Type } from 'lucide-react'
import Modal from '../components/Modal.jsx'

// Convert hex to rgba string, used for creating lighter brand variants
function hexToRgb(hex, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`
  const cleaned = hex.replace('#', '')
  const full = cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned
  const bigint = parseInt(full, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const THEMES = {
  default: {
    name: 'Default (Indigo)',
    colors: {
      brand: '#4f46e5',
      accent: '#7c3aed',
      success: '#059669',
      danger: '#dc2626',
      warning: '#d97706',
    }
  },
  ocean: {
    name: 'Ocean Blue',
    colors: {
      brand: '#0369a1',
      accent: '#0ea5e9',
      success: '#059669',
      danger: '#dc2626',
      warning: '#d97706',
    }
  },
  forest: {
    name: 'Forest Green',
    colors: {
      brand: '#15803d',
      accent: '#16a34a',
      success: '#059669',
      danger: '#dc2626',
      warning: '#d97706',
    }
  },
  sunset: {
    name: 'Sunset Orange',
    colors: {
      brand: '#ea580c',
      accent: '#f97316',
      success: '#059669',
      danger: '#dc2626',
      warning: '#d97706',
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      brand: '#9333ea',
      accent: '#a855f7',
      success: '#059669',
      danger: '#dc2626',
      warning: '#d97706',
    }
  },
  rose: {
    name: 'Rose Pink',
    colors: {
      brand: '#e11d48',
      accent: '#f43f5e',
      success: '#059669',
      danger: '#dc2626',
      warning: '#d97706',
    }
  },
}

const TEXT_SIZES = {
  small: { name: 'Small', scale: 0.9 },
  normal: { name: 'Normal', scale: 1 },
  large: { name: 'Large', scale: 1.1 },
  xlarge: { name: 'Extra Large', scale: 1.2 },
}

const FONT_FAMILIES = {
  inter: { name: 'Inter (Default)', font: "'Inter var','Inter','system-ui','sans-serif'" },
  poppins: { name: 'Poppins', font: "'Poppins','system-ui','sans-serif'" },
  nunito: { name: 'Nunito', font: "'Nunito','system-ui','sans-serif'" },
  roboto: { name: 'Roboto', font: "'Roboto','system-ui','sans-serif'" },
  monospace: { name: 'Monospace', font: "'Monaco','Courier New','monospace'" },
}

export default function Settings() {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('selectedTheme') || 'default')
  const [textSize, setTextSize] = useState(() => localStorage.getItem('textSize') || 'normal')
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || 'inter')

  // Custom colors (live preview, saved separately)
  const initialTheme = THEMES[currentTheme] ?? THEMES.default
  const storedCustom = (() => {
    try { return JSON.parse(localStorage.getItem('customColors') || '{}') } catch { return {} }
  })()
  const [customBrand, setCustomBrand] = useState(storedCustom.brand ?? initialTheme.colors.brand)
  const [customAccent, setCustomAccent] = useState(storedCustom.accent ?? initialTheme.colors.accent)

  const [passwordModal, setPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  // Apply theme colors
  const applyTheme = (themeName) => {
    const theme = THEMES[themeName]
    if (!theme) return

    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Update brand-light color based on brand color (lighter version)
    const brandLight = hexToRgb(theme.colors.brand, 0.1)
    root.style.setProperty('--brand-light', brandLight)

    // also update custom pickers to reflect chosen theme
    setCustomBrand(theme.colors.brand)
    setCustomAccent(theme.colors.accent)

    setCurrentTheme(themeName)
    localStorage.setItem('selectedTheme', themeName)
    toast.success(`Theme changed to ${theme.name}`)
  }

  // Handle selection from dropdown (including 'custom')
  const handleThemeSelect = (themeName) => {
    if (themeName === 'custom') {
      // apply saved custom colors if any
      const savedCustom = (() => { try { return JSON.parse(localStorage.getItem('customColors') || '{}') } catch { return {} } })()
      const root = document.documentElement
      if (savedCustom.brand) root.style.setProperty('--brand', savedCustom.brand)
      if (savedCustom.accent) root.style.setProperty('--accent', savedCustom.accent)
      if (savedCustom.brand) root.style.setProperty('--brand-light', hexToRgb(savedCustom.brand, 0.08))
      setCurrentTheme('custom')
      localStorage.setItem('selectedTheme', 'custom')
      toast.success('Custom theme applied')
      return
    }
    applyTheme(themeName)
  }

  // Live preview handlers for custom color picker
  const handleBrandInput = (val) => {
    setCustomBrand(val)
    const root = document.documentElement
    root.style.setProperty('--brand', val)
    root.style.setProperty('--brand-light', hexToRgb(val, 0.08))
    // mark as custom theme
    setCurrentTheme('custom')
  }

  const handleAccentInput = (val) => {
    setCustomAccent(val)
    const root = document.documentElement
    root.style.setProperty('--accent', val)
    setCurrentTheme('custom')
  }

  const saveCustomColors = () => {
    const payload = { brand: customBrand, accent: customAccent }
    localStorage.setItem('customColors', JSON.stringify(payload))
    toast.success('Custom colors saved')
    setCurrentTheme('custom')
    localStorage.setItem('selectedTheme', 'custom')
  }

  const resetCustomColors = () => {
    localStorage.removeItem('customColors')
    const theme = THEMES['default']
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([k, v]) => root.style.setProperty(`--${k}`, v))
    root.style.setProperty('--brand-light', hexToRgb(theme.colors.brand, 0.08))
    setCustomBrand(theme.colors.brand)
    setCustomAccent(theme.colors.accent)
    setCurrentTheme('default')
    localStorage.setItem('selectedTheme', 'default')
    toast.success('Custom colors reset')
  }

  // Apply text size
  const applyTextSize = (size) => {
    const scale = TEXT_SIZES[size].scale
    const root = document.documentElement
    root.style.setProperty('--text-scale', scale)

    setTextSize(size)
    localStorage.setItem('textSize', size)
    toast.success(`Text size changed to ${TEXT_SIZES[size].name}`)
  }

  // Apply font family
  const applyFontFamily = (family) => {
    const font = FONT_FAMILIES[family].font
    document.documentElement.style.fontFamily = font
    
    setFontFamily(family)
    localStorage.setItem('fontFamily', family)
    toast.success(`Font changed to ${FONT_FAMILIES[family].name}`)
  }

  // Handle password change
  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('All fields are required')
      return
    }

    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }

    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: passwords.current,
      //     newPassword: passwords.new,
      //   })
      // })

      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Password changed successfully')
      setPasswordModal(false)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <Lock className="w-5 h-5" style={{ color: 'var(--danger)' }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Security</h2>
              </div>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">Password</label>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Last changed 90 days ago
              </p>
            </div>
            <button
              onClick={() => setPasswordModal(true)}
              className="btn btn-primary w-full"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </div>

        {/* Text Size Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <Type className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Text Size</h2>
              </div>
            </div>
          </div>
          <div className="card-body">
            <label className="label">Text Size</label>
            <select className="input select w-full" value={textSize} onChange={(e) => applyTextSize(e.target.value)}>
              {Object.entries(TEXT_SIZES).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Font Family Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <Type className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Font Family</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Choose your preferred font for the interface</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <label className="label">Font Family</label>
          <select className="input select w-full" value={fontFamily} onChange={(e) => applyFontFamily(e.target.value)}>
            {Object.entries(FONT_FAMILIES).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Theme Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <Palette className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Color Theme</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Customize the color scheme of your interface</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <label className="label">Theme</label>
          <select className="input select w-full" value={currentTheme} onChange={(e) => handleThemeSelect(e.target.value)}>
            {Object.entries(THEMES).map(([key, theme]) => (
              <option key={key} value={key}>{theme.name}</option>
            ))}
            <option value="custom">Custom (Saved)</option>
          </select>

          <div className="mt-4 border-t pt-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Custom colors</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pick a primary color (brand) and an accent color. Use "Save" to persist.</p>
            <div className="flex items-center gap-3 flex-wrap mt-2">
              <label className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Primary</span>
                <input type="color" value={customBrand} onChange={(e) => handleBrandInput(e.target.value)} className="w-10 h-8 p-0 border-0" />
              </label>

              <label className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Accent</span>
                <input type="color" value={customAccent} onChange={(e) => handleAccentInput(e.target.value)} className="w-10 h-8 p-0 border-0" />
              </label>

              <div className="ml-auto flex gap-2">
                <button className="btn btn-secondary" onClick={resetCustomColors}>Reset</button>
                <button className="btn btn-primary" onClick={saveCustomColors}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        open={passwordModal}
        onClose={() => {
          setPasswordModal(false)
          setPasswords({ current: '', new: '', confirm: '' })
        }}
        title="Change Password"
        size="md"
        footer={
          <>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setPasswordModal(false)
                setPasswords({ current: '', new: '', confirm: '' })
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePasswordChange}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Confirm & Update'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              className="input"
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              placeholder="Enter current password"
              disabled={loading}
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              className="input"
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              placeholder="Enter new password"
              disabled={loading}
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <strong>Password requirements:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>At least 6 characters long</li>
                <li>Can contain letters, numbers, and symbols</li>
              </ul>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
