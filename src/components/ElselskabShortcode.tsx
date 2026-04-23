'use client'

import { useEffect, useState } from 'react'

interface Props {
  ctaSlug: string
  area?: 'DK1' | 'DK2'
}

function fmtDK(n: number, dec: number) {
  return n.toLocaleString('da-DK', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export function ElselskabShortcode({ ctaSlug, area = 'DK1' }: Props) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/elpriser')
      .then((r) => r.json())
      .then((apiData) => {
        const p = apiData.providers?.find((p: any) => p.ctaSlug === ctaSlug)
        if (!p) { setError(true); return }

        const rawPrice: number = area === 'DK2' ? apiData.rawDk2 : apiData.rawDk1
        const common = area === 'DK2' ? apiData.commonDk2 : apiData.commonDk1
        const annualKwh = 4000
        const aboPerKwh = (p.aboMonthly * 12) / annualKwh
        const total = rawPrice + p.kwhTillaeg + aboPerKwh + common.netselskab + common.energinet + common.staten
        const monthly = total * annualKwh / 12
        setData({ p, total, monthly, affiliateUrl: `/go/${ctaSlug}` })
      })
      .catch(() => setError(true))
  }, [ctaSlug, area])

  if (error) return null
  if (!data) {
    return (
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', margin: '24px 0', height: '80px' }} />
    )
  }

  const { p, total, monthly, affiliateUrl } = data
  const BADGE_LABELS: Record<string, string> = {
    'green': '🌿 Grøn',
    'editors-choice': '⭐ Redaktørens valg',
    'no-lock-in': '🔒 Ingen binding',
    'new': '🆕 Ny',
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #16a34a',
      borderRadius: '12px',
      padding: '20px 24px',
      margin: '24px 0',
      display: 'grid',
      gridTemplateColumns: '100px 1fr auto',
      gap: '16px',
      alignItems: 'center',
      boxShadow: '0 0 0 2px rgba(22,163,74,0.1)',
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {p.logoFile ? (
          <img src={`/logos/${p.logoFile}`} alt={p.name}
            style={{ maxWidth: '90px', maxHeight: '40px', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: '80px', height: '36px', background: '#f3f4f6', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#9ca3af' }}>
            {p.name.slice(0, 8)}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          {p.title || p.name}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {p.introtilbud && (
            <span style={{ fontSize: '11px', background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>Introtilbud</span>
          )}
          {area && (
            <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '20px' }}>{area}</span>
          )}
        </div>
      </div>

      {/* Price + CTA */}
      <div style={{ textAlign: 'right', minWidth: '140px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end', marginBottom: '2px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
            {fmtDK(total, 2)}
          </span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>kr./kWh</span>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
          ≈ <strong style={{ color: '#374151' }}>{fmtDK(Math.round(monthly), 0)} kr.</strong>/md.
        </div>
        <a href={affiliateUrl} target="_blank" rel="nofollow noopener noreferrer"
          style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '8px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
          Gå til tilbud →
        </a>
      </div>
    </div>
  )
}
