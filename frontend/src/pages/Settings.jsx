import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Lock, Palette, Type, Moon, Zap, Layers, User, LogOut, RefreshCw } from 'lucide-react'
import Modal from '../components/Modal.jsx'

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
  default: { name: 'Indigo',  brand: '#4f46e5', accent: '#7c3aed', success: '#059669', danger: '#dc2626', warning: '#d97706' },
  ocean:   { name: 'Ocean',   brand: '#0369a1', accent: '#0ea5e9', success: '#059669', danger: '#dc2626', warning: '#d97706' },
  forest:  { name: 'Forest',  brand: '#15803d', accent: '#16a34a', success: '#059669', danger: '#dc2626', warning: '#d97706' },
  sunset:  { name: 'Sunset',  brand: '#ea580c', accent: '#f97316', success: '#059669', danger: '#dc2626', warning: '#d97706' },
  purple:  { name: 'Purple',  brand: '#9333ea', accent: '#a855f7', success: '#059669', danger: '#dc2626', warning: '#d97706' },
  rose:    { name: 'Rose',    brand: '#e11d48', accent: '#f43f5e', success: '#059669', danger: '#dc2626', warning: '#d97706' },
}

const TEXT_SIZES = {
  small:  { name: 'S',  label: 'Small',      scale: 0.9 },
  normal: { name: 'M',  label: 'Normal',     scale: 1   },
  large:  { name: 'L',  label: 'Large',      scale: 1.1 },
  xlarge: { name: 'XL', label: 'Extra Large',scale: 1.2 },
}

const FONT_FAMILIES = {
  poppins:   { name: 'Poppins',   font: "'Poppins','system-ui','sans-serif'" },
  inter:     { name: 'Inter',     font: "'Inter var','Inter','system-ui','sans-serif'" },
  nunito:    { name: 'Nunito',    font: "'Nunito','system-ui','sans-serif'" },
  roboto:    { name: 'Roboto',    font: "'Roboto','system-ui','sans-serif'" },
  monospace: { name: 'Monospace', font: "'Monaco','Courier New','monospace'" },
}

const PRESET_BACKGROUNDS = [
  { key: 'sunset',  name: 'Sunset',       color1: '#ea580c', color2: '#f97316', angle: 135 },
  { key: 'ocean',   name: 'Ocean',        color1: '#0369a1', color2: '#0ea5e9', angle: 135 },
  { key: 'forest',  name: 'Forest',       color1: '#15803d', color2: '#16a34a', angle: 135 },
  { key: 'purple',  name: 'Purple Haze',  color1: '#7c3aed', color2: '#a855f7', angle: 135 },
  { key: 'dark',    name: 'Dark',         color1: '#1a1830', color2: '#000000', angle: 135 },
  { key: 'light',   name: 'Light',        color1: '#ffffff', color2: '#f8f7ff', angle: 0 },
]

/* ── helpers ─────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 mt-6 first:mt-0"
      style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  )
}

function SettingRow({ icon: Icon, label, sub, children, last }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4"
      style={!last ? { borderBottom: '1px solid var(--border)' } : {}}>
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-subtle)' }}>
          <Icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
          {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        </div>
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto mt-3 sm:mt-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: checked ? 'var(--brand)' : 'var(--bg-muted)' }}
    >
      <span className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(4px)' }} />
    </button>
  )
}

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
          style={value === opt.value
            ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
            : { color: 'var(--text-muted)', border: '1px solid transparent' }
          }
        >{opt.label}</button>
      ))}
    </div>
  )
}

function ColorSwatch({ color, onClick, active }) {
  return (
    <button onClick={onClick} title={color}
      className="w-7 h-7 rounded-full transition-all duration-150 flex-shrink-0"
      style={{
        backgroundColor: color,
        outline: active ? `2.5px solid ${color}` : '2px solid transparent',
        outlineOffset: active ? '2px' : '0',
        transform: active ? 'scale(1.15)' : 'scale(1)',
      }}
    />
  )
}

/* ── Main component ──────────────────────────────────── */
export default function Settings() {
  /* ── state ─────────────────────────── */
  const [theme,      setTheme]      = useState(() => localStorage.getItem('selectedTheme') || 'default')
  const [textSize,   setTextSize]   = useState(() => localStorage.getItem('textSize')       || 'normal')
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily')     || 'poppins')
  const [compact,    setCompact]    = useState(() => localStorage.getItem('compact') === 'true')
  const [animations, setAnimations] = useState(() => localStorage.getItem('animations') !== 'false')
  const [dark,       setDark]       = useState(() => document.documentElement.classList.contains('dark'))

  const getStoredCustom = () => {
    try { return JSON.parse(localStorage.getItem('customColors') || '{}') } catch { return {} }
  }
  const initTheme = THEMES[localStorage.getItem('selectedTheme')] ?? THEMES.default
  const sc = getStoredCustom()
  const [customBrand,  setCustomBrand]  = useState(sc.brand  ?? initTheme.brand)
  const [customAccent, setCustomAccent] = useState(sc.accent ?? initTheme.accent)

  /* background state */
  const getStoredBg = () => { try { return JSON.parse(localStorage.getItem('customBg') || '{}') } catch { return {} } }
  const storedBg = getStoredBg()
  const [bgType,         setBgType]         = useState(storedBg.type          || 'solid')
  const [solidColor,     setSolidColor]     = useState(storedBg.solidColor    || '#f8f7ff')
  const [gradColor1,     setGradColor1]     = useState(storedBg.gradientColor1|| '#4f46e5')
  const [gradColor2,     setGradColor2]     = useState(storedBg.gradientColor2|| '#7c3aed')
  const [gradAngle,      setGradAngle]      = useState(storedBg.gradientAngle || 135)
  const [radialShape,    setRadialShape]    = useState(storedBg.radialShape   || 'circle')
  const [selectedPreset, setSelectedPreset] = useState(storedBg.preset || '')

  /* ── profile state (Dicebear) — 5-choice avatar picker ───────── */
  const getStoredProfile = () => { try { return JSON.parse(localStorage.getItem('profile') || '{}') } catch { return {} } }
  const storedProfile = getStoredProfile()
  const [profileName, setProfileName] = useState(storedProfile.name || 'Admin')
  const [profileAge, setProfileAge] = useState(storedProfile.age || '')
  const [profileDob, setProfileDob] = useState(storedProfile.dob || '')

  const AVATAR_STYLES = ['avataaars','bottts','avataaars','big-ears-neutral','avataaars-neutral','pixel-art','micah','adventurer']
  const avatarApiUrl = (style, seed) => `https://api.dicebear.com/9.x/${style}/${encodeURIComponent(seed)}.svg?background=%23ffffff`
  const randomSeed = () => Math.random().toString(36).slice(2,9)

  const makeInitialChoices = () => {
    const existingStyle = storedProfile.avatarStyle
    const existingSeed = storedProfile.avatarSeed
    const choices = AVATAR_STYLES.map(style => {
      const seed = (existingStyle === style && existingSeed) ? existingSeed : randomSeed()
      return { style, seed, dataUrl: avatarApiUrl(style, seed) }
    })
    const selIndex = existingStyle ? Math.max(0, AVATAR_STYLES.indexOf(existingStyle)) : 0
    return { choices, selIndex }
  }

  const initial = makeInitialChoices()
  const [avatarChoices, setAvatarChoices] = useState(initial.choices)
  const [selectedChoice, setSelectedChoice] = useState(initial.selIndex)

  const refreshChoices = () => {
    setAvatarChoices(prev => prev.map(c => ({ ...c, seed: randomSeed(), dataUrl: avatarApiUrl(c.style, randomSeed()) })))
  }

  const saveProfile = () => {
    const chosen = avatarChoices[selectedChoice] || avatarChoices[0]
    const payload = { name: profileName, age: profileAge, dob: profileDob, avatarStyle: chosen.style, avatarSeed: chosen.seed }
    localStorage.setItem('profile', JSON.stringify(payload))
    toast.success('Profile saved')
  }
  const resetProfile = () => {
    localStorage.removeItem('profile')
    setProfileName('Admin'); setProfileAge(''); setProfileDob('')
    const newChoices = AVATAR_STYLES.map(style => ({ style, seed: randomSeed(), dataUrl: avatarApiUrl(style, randomSeed()) }))
    setAvatarChoices(newChoices)
    setSelectedChoice(0)
    toast.success('Profile reset')
  }

  /* generate SVG data-URLs for each choice (tries local DiceBear first; falls back to API)
     only runs when style/seed pairs change (avoids infinite loops). */
  const choicesKey = avatarChoices.map(c => `${c.style}|${c.seed}`).join(',')
  useEffect(() => {
    let mounted = true
    const genAll = async () => {
      try {
        const { createAvatar } = await import('@dicebear/core')
        const col = await import('@dicebear/collection')
        const toKey = s => s.replace(/[-_ ]([a-z])/g, (_, c) => c.toUpperCase())
        const updated = await Promise.all(avatarChoices.map(async c => {
          const candidates = [c.style, toKey(c.style), c.style.replace(/[-_ ]/g, ''), c.style.toLowerCase(), c.style.charAt(0).toUpperCase() + c.style.slice(1)]
          let styleModule = null
          for (const k of candidates) {
            if (col[k]) { styleModule = col[k]; break }
            if (col.default && col.default[k]) { styleModule = col.default[k]; break }
          }
          if (!styleModule) return { ...c, dataUrl: avatarApiUrl(c.style, c.seed) }
          try {
            const svg = createAvatar(styleModule, { seed: c.seed }).toString()
            return { ...c, dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg) }
          } catch (e) {
            return { ...c, dataUrl: avatarApiUrl(c.style, c.seed) }
          }
        }))
        if (mounted) {
          setAvatarChoices(prev => {
            // only replace if something changed to avoid unnecessary re-renders
            const prevKey = prev.map(p => `${p.style}|${p.seed}`).join(',')
            const sameSeeds = prevKey === choicesKey
            const changed = updated.some((u, i) => u.dataUrl !== (prev[i] && prev[i].dataUrl))
            if (sameSeeds && changed) return updated
            return prev
          })
        }
      } catch (e) {
        if (mounted) setAvatarChoices(prev => prev.map(p => ({ ...p, dataUrl: avatarApiUrl(p.style, p.seed) })))
      }
    }
    genAll()
    return () => { mounted = false }
  }, [choicesKey])

  /* password modal */
  const [pwModal,   setPwModal]   = useState(false)
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  /* apply stored theme on mount */
  useEffect(() => {
    const t = THEMES[theme]
    if (t) {
      const root = document.documentElement
      root.style.setProperty('--brand',       t.brand)
      root.style.setProperty('--accent',      t.accent)
      root.style.setProperty('--brand-light', hexToRgb(t.brand, 0.1))
    }
  }, [])

  /* ── theme handlers ─────────────────── */
  const applyTheme = (key) => {
    const t = THEMES[key]
    if (!t) return
    const root = document.documentElement
    Object.entries(t).forEach(([k, v]) => { if (k !== 'name') root.style.setProperty(`--${k}`, v) })
    root.style.setProperty('--brand-light', hexToRgb(t.brand, 0.1))
    setCustomBrand(t.brand)
    setCustomAccent(t.accent)
    setTheme(key)
    localStorage.setItem('selectedTheme', key)
    toast.success(`${t.name} theme applied`)
  }

  const handleBrandInput = (val) => {
    setCustomBrand(val)
    document.documentElement.style.setProperty('--brand', val)
    document.documentElement.style.setProperty('--brand-light', hexToRgb(val, 0.08))
    setTheme('custom')
  }
  const handleAccentInput = (val) => {
    setCustomAccent(val)
    document.documentElement.style.setProperty('--accent', val)
    setTheme('custom')
  }
  const saveCustomColors = () => {
    localStorage.setItem('customColors', JSON.stringify({ brand: customBrand, accent: customAccent }))
    localStorage.setItem('selectedTheme', 'custom')
    setTheme('custom')
    toast.success('Custom colors saved')
  }
  const resetCustomColors = () => {
    localStorage.removeItem('customColors')
    applyTheme('default')
    toast.success('Colors reset to default')
  }

  /* ── background helpers ─────────────── */
  const BLACK_ALPHA = 'rgba(0,0,0,0.6)'
  const makeLinear = (angle, c1, c2) => `linear-gradient(${angle}deg, ${BLACK_ALPHA}, ${c1} 30%, ${c2})`
  const makeRadial = (shape, c1, c2) => `radial-gradient(${shape}, ${BLACK_ALPHA}, ${c1} 35%, ${c2})`

  const buildBgValue = (type, s, g1, g2, angle, shape) => {
    if (type === 'solid') return s
    if (type === 'linear') return makeLinear(angle, g1, g2)
    if (type === 'radial') return makeRadial(shape, g1, g2)
    return ''
  }
  const applyBg = (val) => document.documentElement.style.setProperty('--custom-bg', val || 'none')

  const handleBgTypeChange = (type) => {
    setBgType(type)
    if (type === 'preset' && selectedPreset) {
      const p = PRESET_BACKGROUNDS.find(x => x.key === selectedPreset)
      if (p) applyBg(makeLinear(p.angle || 135, p.color1, p.color2))
    } else {
      applyBg(buildBgValue(type, solidColor, gradColor1, gradColor2, gradAngle, radialShape))
    }
  }
  const handleSolidColor = (c) => { setSolidColor(c); if (bgType === 'solid') applyBg(c) }
  const handleGrad1 = (c) => {
    setGradColor1(c)
    if (bgType === 'linear') applyBg(makeLinear(gradAngle, c, gradColor2))
    else if (bgType === 'radial') applyBg(makeRadial(radialShape, c, gradColor2))
    else applyBg(buildBgValue(bgType, solidColor, c, gradColor2, gradAngle, radialShape))
  }
  const handleGrad2 = (c) => {
    setGradColor2(c)
    if (bgType === 'linear') applyBg(makeLinear(gradAngle, gradColor1, c))
    else if (bgType === 'radial') applyBg(makeRadial(radialShape, gradColor1, c))
    else applyBg(buildBgValue(bgType, solidColor, gradColor1, c, gradAngle, radialShape))
  }
  const handleAngle = (a) => {
    setGradAngle(a)
    if (bgType === 'linear') applyBg(makeLinear(a, gradColor1, gradColor2))
  }
  const handleRadialShape = (s) => {
    setRadialShape(s)
    if (bgType === 'radial') applyBg(makeRadial(s, gradColor1, gradColor2))
  }
  const applyPreset = (preset) => {
    setSelectedPreset(preset.key)
    setBgType('preset')
    const bgVal = preset.color2 ? makeLinear(preset.angle || 135, preset.color1, preset.color2) : preset.color1
    applyBg(bgVal)
    toast.success(`${preset.name} background applied`)
  }
  const saveBg = () => {
    const payload = { type: bgType, solidColor, gradientColor1: gradColor1, gradientColor2: gradColor2, gradientAngle: gradAngle, radialShape }
    if (bgType === 'preset') {
      payload.preset = selectedPreset
      const p = PRESET_BACKGROUNDS.find(x => x.key === selectedPreset)
      if (p) {
        payload.presetColor1 = p.color1
        payload.presetColor2 = p.color2
        payload.presetAngle = p.angle
      }
    }
    localStorage.setItem('customBg', JSON.stringify(payload))
    if (bgType === 'preset' && selectedPreset) {
      const p = PRESET_BACKGROUNDS.find(x => x.key === selectedPreset)
      if (p) applyBg(makeLinear(p.angle || 135, p.color1, p.color2))
    } else {
      applyBg(buildBgValue(bgType, solidColor, gradColor1, gradColor2, gradAngle, radialShape))
    }
    toast.success('Background saved')
  }
  const resetBg = () => {
    localStorage.removeItem('customBg')
    document.documentElement.style.setProperty('--custom-bg', 'none')
    setBgType('solid'); setSolidColor('#f8f7ff'); setGradColor1('#4f46e5'); setGradColor2('#7c3aed'); setGradAngle(135); setRadialShape('circle')
    setSelectedPreset('')
    toast.success('Background reset')
  }

  /* ── text / font ────────────────────── */
  const applyTextSize = (size) => {
    document.documentElement.style.setProperty('--text-scale', TEXT_SIZES[size].scale)
    setTextSize(size); localStorage.setItem('textSize', size)
    toast.success(`Text size: ${TEXT_SIZES[size].label}`)
  }
  const applyFont = (key) => {
    document.documentElement.style.fontFamily = FONT_FAMILIES[key].font
    setFontFamily(key); localStorage.setItem('fontFamily', key)
    toast.success(`Font: ${FONT_FAMILIES[key].name}`)
  }

  /* ── toggles ────────────────────────── */
  const toggleDark = (val) => {
    document.documentElement.classList.toggle('dark', val)
    localStorage.setItem('theme', val ? 'dark' : 'light')
    setDark(val)
  }
  const toggleCompact = (val) => { setCompact(val); localStorage.setItem('compact', val); toast.success(`Compact view ${val ? 'on' : 'off'}`) }
  const toggleAnimations = (val) => { setAnimations(val); localStorage.setItem('animations', val); toast.success(`Animations ${val ? 'enabled' : 'disabled'}`) }

  /* ── password ───────────────────────── */
  const handlePasswordChange = async () => {
    const { current, newPw, confirm } = passwords
    if (!current || !newPw || !confirm) { toast.error('All fields are required'); return }
    if (newPw !== confirm)              { toast.error('Passwords do not match');   return }
    if (newPw.length < 6)              { toast.error('Minimum 6 characters');     return }
    setPwLoading(true)
    try {
      await new Promise(r => setTimeout(r, 900))
      toast.success('Password updated')
      setPwModal(false); setPasswords({ current: '', newPw: '', confirm: '' })
    } catch (e) { toast.error(e.message || 'Failed') } finally { setPwLoading(false) }
  }
  const setPw = (k) => (e) => setPasswords(p => ({ ...p, [k]: e.target.value }))

  /* ── bg preview strip ───────────────── */
  let bgPreview = ''
  if (bgType === 'solid') bgPreview = solidColor
  else if (bgType === 'linear') bgPreview = makeLinear(gradAngle, gradColor1, gradColor2)
  else if (bgType === 'radial') bgPreview = makeRadial(radialShape, gradColor1, gradColor2)
  else if (bgType === 'preset' && selectedPreset) {
    const p = PRESET_BACKGROUNDS.find(x => x.key === selectedPreset)
    bgPreview = p ? (p.color2 ? makeLinear(p.angle || 135, p.color1, p.color2) : p.color1) : ''
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* ── PROFILE ─────────────────────────────────────── */}
      <SectionLabel>Profile</SectionLabel>
      <div className="card px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-24 h-24 rounded-full overflow-hidden " >
              <img src={avatarChoices[selectedChoice]?.dataUrl || avatarApiUrl(avatarChoices[selectedChoice]?.style, avatarChoices[selectedChoice]?.seed)} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Profile</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage display name and avatar</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input type="text" className="input w-full sm:w-56" value={profileName} onChange={e => setProfileName(e.target.value)} />
              <input type="number" className="input w-full sm:w-32" value={profileAge} onChange={e => setProfileAge(e.target.value)} />
              <input type="date" className="input w-full sm:w-44" value={profileDob} onChange={e => setProfileDob(e.target.value)} />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-2 overflow-x-auto">
                  {avatarChoices.map((c, i) => (
                    <button key={`${c.style}-${c.seed}`} onClick={() => setSelectedChoice(i)}
                      className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                      style={i === selectedChoice ? { border: '2px solid var(--brand)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' } : { border: '2px solid transparent' }}>
                      <img src={c.dataUrl} alt={c.style} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm flex items-center gap-2" onClick={refreshChoices} title="Randomize choices">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              <div className="mt-3 flex gap-2 w-full sm:w-auto">
                <button className="btn btn-secondary btn-sm w-full sm:w-auto" onClick={resetProfile}>Reset</button>
                <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={saveProfile}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── APPEARANCE ──────────────────────────────────── */}
      <SectionLabel>Appearance</SectionLabel>
      <div className="card px-6">

        {/* Theme swatches */}
        <SettingRow icon={Palette} label="Color theme" sub="Choose a preset accent color">
          <div className="flex items-center gap-1.5">
            {Object.entries(THEMES).map(([key, t]) => (
              <ColorSwatch key={key} color={t.brand} active={theme === key} onClick={() => applyTheme(key)} />
            ))}
          </div>
        </SettingRow>

        {/* Custom colors */}
        <SettingRow icon={Palette} label="Custom colors" sub="Pick your own primary and accent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Primary</span>
              <input type="color" value={customBrand} onChange={e => handleBrandInput(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" style={{ backgroundColor: 'transparent' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Accent</span>
              <input type="color" value={customAccent} onChange={e => handleAccentInput(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" style={{ backgroundColor: 'transparent' }} />
            </div>
            <button className="btn btn-secondary btn-sm" onClick={resetCustomColors}>Reset</button>
            <button className="btn btn-primary btn-sm"   onClick={saveCustomColors}>Save</button>
          </div>
        </SettingRow>

        {/* Text size */}
        <SettingRow icon={Type} label="Text size" sub="Adjust the interface font size">
          <PillGroup value={textSize} onChange={applyTextSize}
            options={Object.entries(TEXT_SIZES).map(([k, v]) => ({ value: k, label: v.name }))} />
        </SettingRow>

        {/* Font family */}
        <SettingRow icon={Type} label="Font family" sub="Interface typeface" last>
          <select className="select" style={{ width: 150 }} value={fontFamily} onChange={e => applyFont(e.target.value)}>
            {Object.entries(FONT_FAMILIES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </SettingRow>
      </div>

      {/* ── BACKGROUND ──────────────────────────────────── */}
      <SectionLabel>Background</SectionLabel>
      <div className="card px-6">

        {/* Type switcher */}
        <SettingRow icon={Palette} label="Background type" sub="Solid, gradient, or a preset">
          <PillGroup value={bgType} onChange={handleBgTypeChange}
            options={[
              { value: 'solid',  label: 'Solid'   },
              { value: 'linear', label: 'Linear'  },
              { value: 'radial', label: 'Radial'  },
              { value: 'preset', label: 'Presets' },
            ]}
          />
        </SettingRow>

        {/* Solid */}
        {bgType === 'solid' && (
          <SettingRow icon={Palette} label="Color">
            <div className="flex items-center gap-2">
              <input type="color" value={solidColor} onChange={e => handleSolidColor(e.target.value)}
                className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0" />
              <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{solidColor}</span>
            </div>
          </SettingRow>
        )}

        {/* Linear */}
        {bgType === 'linear' && (
          <>
            <SettingRow icon={Palette} label="Start → End colors">
              <div className="flex items-center gap-2">
                <input type="color" value={gradColor1} onChange={e => handleGrad1(e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
                <input type="color" value={gradColor2} onChange={e => handleGrad2(e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0" />
              </div>
            </SettingRow>
            <SettingRow icon={Palette} label={`Angle — ${gradAngle}°`}>
              <input type="range" min="0" max="360" value={gradAngle}
                onChange={e => handleAngle(parseInt(e.target.value))}
                style={{ width: 140 }} />
            </SettingRow>
          </>
        )}

        {/* Radial */}
        {bgType === 'radial' && (
          <>
            <SettingRow icon={Palette} label="Inner → Outer colors">
              <div className="flex items-center gap-2">
                <input type="color" value={gradColor1} onChange={e => handleGrad1(e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
                <input type="color" value={gradColor2} onChange={e => handleGrad2(e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0" />
              </div>
            </SettingRow>
            <SettingRow icon={Palette} label="Shape">
              <PillGroup value={radialShape} onChange={handleRadialShape}
                options={[{ value: 'circle', label: 'Circle' }, { value: 'ellipse', label: 'Ellipse' }]} />
            </SettingRow>
          </>
        )}

        {/* Presets */}
        {bgType === 'preset' && (
          <div className="py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_BACKGROUNDS.map(p => (
                <button key={p.key} onClick={() => applyPreset(p)}
                  className="h-10 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{ background: p.color2 ? makeLinear(p.angle || 135, p.color1, p.color2) : p.color1, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)', border: '2px solid var(--border)' }}
                >{p.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Preview + save */}
        <div className="py-3.5 flex items-center gap-3" >
          {bgPreview && (
            <div className="h-8 flex-1 rounded-xl border" style={{ background: bgPreview, borderColor: 'var(--border)' }} />
          )}
          <button className="btn btn-secondary btn-sm flex-shrink-0" onClick={resetBg}>Reset</button>
          <button className="btn btn-primary btn-sm flex-shrink-0"  onClick={saveBg}>Save</button>
        </div>
      </div>

      {/* ── INTERFACE ───────────────────────────────────── */}
      <SectionLabel>Interface</SectionLabel>
      <div className="card px-6">
        <SettingRow icon={Moon}   label="Dark mode"    sub={dark ? 'Dark theme active' : 'Light theme active'}>
          <Toggle checked={dark}       onChange={toggleDark} />
        </SettingRow>
        <SettingRow icon={Layers} label="Compact view" sub="Reduce padding and whitespace">
          <Toggle checked={compact}    onChange={toggleCompact} />
        </SettingRow>
        <SettingRow icon={Zap}    label="Animations"   sub="Fade and slide transitions" last>
          <Toggle checked={animations} onChange={toggleAnimations} />
        </SettingRow>
      </div>

      {/* ── ACCOUNT ─────────────────────────────────────── */}
      

      <SectionLabel>Account</SectionLabel>
      <div className="card px-6">
        <SettingRow icon={User}  label="Admin" sub="Librarian · admin@LMS.in">
          <button className="btn btn-secondary btn-sm" onClick={() => toast('Profile editing moved to Profile section')}>Edit profile</button>
        </SettingRow>
        <SettingRow icon={Lock}  label="Password" sub="Last changed 90 days ago">
          <button className="btn btn-secondary btn-sm" onClick={() => setPwModal(true)}>Change</button>
        </SettingRow>
        <SettingRow icon={LogOut} label="Sign out" sub="Sign out of this device" last>
          <button className="btn btn-sm" onClick={() => toast('Signed out')}
            style={{ color: 'var(--danger)', backgroundColor: 'color-mix(in srgb,var(--danger) 8%,transparent)', border: '1px solid color-mix(in srgb,var(--danger) 20%,transparent)' }}>
            Sign out
          </button>
        </SettingRow>
      </div>

      <p className="text-center text-xs pt-4 pb-2" style={{ color: 'var(--text-muted)' }}>
        LMS v2.0 · All settings saved locally
      </p>

      {/* ── Password modal ───────────────────────────────── */}
      <Modal open={pwModal}
        onClose={() => { setPwModal(false); setPasswords({ current: '', newPw: '', confirm: '' }) }}
        title="Change password" size="sm"
        footer={
          <>
            <button className="btn btn-secondary" disabled={pwLoading}
              onClick={() => { setPwModal(false); setPasswords({ current: '', newPw: '', confirm: '' }) }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handlePasswordChange} disabled={pwLoading}>
              {pwLoading ? 'Updating…' : 'Update password'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Current password</label>
            <input type="password" className="input" placeholder="Enter current password"
              value={passwords.current} onChange={setPw('current')} disabled={pwLoading} />
          </div>
          <div className="form-group">
            <label className="label">New password</label>
            <input type="password" className="input" placeholder="At least 6 characters"
              value={passwords.newPw} onChange={setPw('newPw')} disabled={pwLoading} />
          </div>
          <div className="form-group">
            <label className="label">Confirm new password</label>
            <input type="password" className="input" placeholder="Repeat new password"
              value={passwords.confirm} onChange={setPw('confirm')} disabled={pwLoading} />
          </div>
          <div className="rounded-xl p-3 text-xs space-y-1"
            style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-dark)' }}>
            <p className="font-semibold">Requirements</p>
            <p style={{ color: 'var(--text-secondary)' }}>· At least 6 characters</p>
            <p style={{ color: 'var(--text-secondary)' }}>· Letters, numbers, or symbols</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}