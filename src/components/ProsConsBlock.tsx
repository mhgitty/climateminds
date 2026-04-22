interface ProsConsBlockProps { value: { title?: string; pros?: string[]; cons?: string[] } }

export function ProsConsBlock({ value }: ProsConsBlockProps) {
  const { title, pros = [], cons = [] } = value
  return (
    <div style={{ margin: '24px 0' }}>
      {title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{title}</h3>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>✅ Fordele</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pros.map((p, i) => <li key={i} style={{ fontSize: '14px', color: '#166534', display: 'flex', gap: '8px' }}><span>✓</span>{p}</li>)}
          </ul>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>❌ Ulemper</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cons.map((c, i) => <li key={i} style={{ fontSize: '14px', color: '#991b1b', display: 'flex', gap: '8px' }}><span>✗</span>{c}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
