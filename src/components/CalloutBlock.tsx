interface CalloutBlockProps {
  value: { variant?: 'info' | 'tip' | 'warning'; title?: string; body?: string }
}

const styles: Record<string, { bg: string; border: string; icon: string; color: string }> = {
  info:    { bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ️', color: '#1d4ed8' },
  tip:     { bg: '#f0fdf4', border: '#bbf7d0', icon: '💡', color: '#15803d' },
  warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', color: '#b45309' },
}

export function CalloutBlock({ value }: CalloutBlockProps) {
  const { variant = 'info', title, body } = value
  const s = styles[variant] ?? styles.info
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '16px 20px', margin: '24px 0' }}>
      {title && <div style={{ fontWeight: 600, color: s.color, fontSize: '14.5px', marginBottom: '6px' }}>{s.icon} {title}</div>}
      {body && <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65, margin: 0 }}>{body}</p>}
    </div>
  )
}
