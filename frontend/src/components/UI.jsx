// Btn
export function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 6, fontWeight: 500, transition: 'all 0.15s',
    fontSize: size === 'sm' ? 12 : 13,
    padding: size === 'sm' ? '5px 10px' : '9px 16px',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  }
  const variants = {
    primary: { background: 'var(--accent)', color: '#0d0f12' },
    secondary: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: 'rgba(255,107,53,0.15)', color: 'var(--warn)', border: '1px solid rgba(255,107,53,0.3)' },
    ghost: { background: 'transparent', color: 'var(--muted)', border: '1px solid transparent' },
  }
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>
}

// Card
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
  )
}

// Modal
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 24, width, maxWidth: '90vw',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Field
export function Field({ label, children, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5, fontWeight: 500 }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

// Badge
export function Badge({ children, color = 'var(--accent)' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)',
      background: color + '1a', color, border: `1px solid ${color}33`,
    }}>
      {children}
    </span>
  )
}

// PageHeader
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--muted)', fontSize: 13 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// Spinner
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div style={{
        width: 28, height: 28, border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
