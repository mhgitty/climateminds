'use client'

import { useEffect, useState } from 'react'

interface Props {
  value: {
    title?: string
    text?: string
    ctaSlug: string
    area?: 'DK1' | 'DK2'
  }
}

const KWH_TIERS = [2000, 4000, 6000, 8000]

function fmtDK(n: number, dec: number) {
  return n.toLocaleString('da-DK', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function calcPrice(p: any, rawPrice: number, common: any, annualKwh: number) {
  const aboPerKwh = (p.aboMonthly * 12) / annualKwh
  const total = rawPrice + p.kwhTillaeg + aboPerKwh + common.netselskab + common.energinet + common.staten
  const monthly = Math.round(total * annualKwh / 12)
  return { total, monthly }
}

export function ProviderPriceBlock({ value }: Props) {
  const { title, text, ctaSlug, area = 'DK1' } = value
  const [rows, setRows] = useState<{ kwh: number; total: number; monthly: number }[] | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/elpriser')
      .then((r) => r.json())
      .then((data) => {
        const p = data.providers?.find((p: any) => p.ctaSlug === ctaSlug)
        if (!p) { setError(true); return }

        const rawPrice: number = area === 'DK2' ? data.rawDk2 : data.rawDk1
        const common = area === 'DK2' ? data.commonDk2 : data.commonDk1

        setProvider(p)
        setRows(KWH_TIERS.map((kwh) => ({ kwh, ...calcPrice(p, rawPrice, common, kwh) })))
      })
      .catch(() => setError(true))
  }, [ctaSlug, area])

  if (error) return null

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      padding: '28px 28px 24px',
      margin: '32px 0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      {title && (
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 700,
          color: '#111827',
          letterSpacing: '-0.02em',
          marginBottom: text ? '10px' : '20px',
        }}>
          {title}
        </h3>
      )}
      {text && (
        <p style={{ fontSize: '14.5px', color: '#6b7280', lineHeight: 1.7, marginBottom: '24px' }}>
          {text}
        </p>
      )}

      {/* Provider logo + name */}
      {provider && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          {provider.logoFile && (
            <img src={`/logos/${provider.logoFile}`} alt={provider.name}
              style={{ maxHeight: '32px', maxWidth: '90px', objectFit: 'contain' }} />
          )}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#111827' }}>
            {provider.title || provider.name}
          </span>
          <span style={{ fontSize: '11.5px', background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: '20px', fontWeight: 500 }}>
            {area}
          </span>
        </div>
      )}

      {/* Price table */}
      {rows ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 0 10px' }}>Forbrug</th>
              <th style={{ textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 0 10px' }}>Pris pr. kWh</th>
              <th style={{ textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 0 10px' }}>Ca. pr. md.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.kwh} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '12px 0', fontSize: '14px', color: '#374151', fontWeight: 500 }}>
                  {fmtDK(row.kwh, 0)} kWh/år
                </td>
                <td style={{ padding: '12px 0', fontSize: '14px', color: '#111827', fontWeight: 700, textAlign: 'right', fontFamily: 'var(--font-display)' }}>
                  {fmtDK(row.total, 2)} kr.
                </td>
                <td style={{ padding: '12px 0', fontSize: '14px', color: '#6b7280', textAlign: 'right' }}>
                  {fmtDK(row.monthly, 0)} kr.
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Loading skeleton
        <div style={{ height: '120px', background: '#f9fafb', borderRadius: '8px', marginBottom: '20px' }} />
      )}

      {/* CTA */}
      <a
        href={`/go/${ctaSlug}`}
        target="_blank"
        rel="nofollow noopener noreferrer"
        style={{
          display: 'inline-block',
          background: '#16a34a',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Se tilbud fra {provider?.title || provider?.name || ctaSlug} →
      </a>
    </div>
  )
}
