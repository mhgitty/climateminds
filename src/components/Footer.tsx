import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ borderTop: '1px solid #e5e7eb', background: '#f9fafb', marginTop: '80px', padding: '48px 24px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="footer-grid">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
              ⚡ Climateminds.dk
            </div>
            <p style={{ fontSize: '13.5px', color: '#6b7280', lineHeight: 1.6, maxWidth: '240px' }}>
              Danmarks uafhængige guide til billig og grøn el. Vi sammenligner priser fra alle store elselskaber.
            </p>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Sider</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[['/', 'Sammenlign elselskaber'], ['/blog', 'Guides & artikler']].map(([href, label]) => (
                <Link key={href} href={href} style={{ fontSize: '13.5px', color: '#6b7280', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[['/om-os', 'Om os'], ['/cookie-politik', 'Cookiepolitik'], ['/privatlivspolitik', 'Privatlivspolitik']].map(([href, label]) => (
                <Link key={href} href={href} style={{ fontSize: '13.5px', color: '#6b7280', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '12.5px', color: '#9ca3af' }}>© {year} Climateminds.dk · Priser er vejledende og opdateres løbende</p>
          <p style={{ fontSize: '12px', color: '#d1d5db' }}>Spotpris fra energidataservice.dk</p>
        </div>
      </div>
    </footer>
  )
}
