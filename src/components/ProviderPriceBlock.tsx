'use client'

import { useEffect, useState, useCallback } from 'react'

interface Props {
  value: {
    title?: string
    text?: string
    pros?: string[]
    cons?: string[]
    ctaSlug: string
    offerSlugs?: string[]
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

/* ── Live prices modal ── */
function LivePricesModal({ area, providerName, onClose }: { area: string; providerName: string; onClose: () => void }) {
  const [hours, setHours] = useState<{ hour: number; price: number }[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    const priceArea = area === 'DK2' ? 'DK2' : 'DK1'
    const url = `https://api.energidataservice.dk/dataset/Elspotprices?start=${today}&end=${tomorrow}&filter=%7B%22PriceArea%22%3A%22${priceArea}%22%7D&sort=HourDK%20ASC&limit=24`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const records = data.records ?? []
        const parsed = records.map((r: any) => ({
          hour: new Date(r.HourDK).getHours(),
          // Convert DKK/MWh → kr./kWh incl. moms
          price: (r.SpotPriceDKK / 1000) * 1.25,
        }))
        setHours(parsed)
      })
      .catch(() => setHours([]))
      .finally(() => setLoading(false))
  }, [area])

  const now = new Date().getHours()
  const maxPrice = hours ? Math.max(...hours.map((h) => h.price), 0.01) : 1

  const barColor = (price: number) => {
    const ratio = price / maxPrice
    if (ratio > 0.75) return '#ef4444'
    if (ratio > 0.4) return '#f59e0b'
    return '#16a34a'
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '680px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af' }}>×</button>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          Live spotpris — {providerName}
        </div>
        <div style={{ fontSize: '12.5px', color: '#9ca3af', marginBottom: '24px' }}>
          {area} · Dagens timepriser inkl. moms · Kilde: energidataservice.dk
        </div>

        {loading && (
          <div style={{ height: '160px', background: '#f9fafb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
            Henter priser…
          </div>
        )}

        {!loading && hours && hours.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '40px 0' }}>
            Ingen prisdata tilgængeligt for i dag.
          </div>
        )}

        {!loading && hours && hours.length > 0 && (
          <>
            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '140px', marginBottom: '8px' }}>
              {hours.map((h) => {
                const heightPct = Math.max((h.price / maxPrice) * 100, 4)
                const isNow = h.hour === now
                return (
                  <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', height: '100%', justifyContent: 'flex-end' }}>
                    <div title={`kl. ${String(h.hour).padStart(2, '0')}:00 — ${fmtDK(h.price, 2)} kr./kWh`} style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: barColor(h.price),
                      borderRadius: '3px 3px 0 0',
                      opacity: isNow ? 1 : 0.75,
                      outline: isNow ? '2px solid #111827' : 'none',
                      outlineOffset: '1px',
                      cursor: 'default',
                      transition: 'opacity 0.1s',
                    }} />
                  </div>
                )
              })}
            </div>

            {/* Hour labels */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {hours.map((h) => (
                <div key={h.hour} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: h.hour === now ? '#111827' : '#9ca3af', fontWeight: h.hour === now ? 700 : 400 }}>
                  {String(h.hour).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Price labels */}
            <div style={{ display: 'flex', gap: '3px', marginTop: '3px', marginBottom: '16px' }}>
              {hours.map((h) => (
                <div key={h.hour} style={{ flex: 1, textAlign: 'center', fontSize: '8.5px', color: h.hour === now ? '#111827' : '#9ca3af', fontWeight: h.hour === now ? 700 : 400 }}>
                  {fmtDK(h.price, 2)}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: '#6b7280' }}>
              <span><span style={{ color: '#16a34a', fontWeight: 700 }}>●</span> Lav</span>
              <span><span style={{ color: '#f59e0b', fontWeight: 700 }}>●</span> Middel</span>
              <span><span style={{ color: '#ef4444', fontWeight: 700 }}>●</span> Høj</span>
              <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: '#d1d5db' }}>Priser er spotpriser ekskl. elselskabets tillæg</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Main block ── */
export function ProviderPriceBlock({ value }: Props) {
  const { title, text, pros = [], cons = [], ctaSlug, offerSlugs = [], area = 'DK1' } = value
  const [apiData, setApiData] = useState<any>(null)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/elpriser')
      .then((r) => r.json())
      .then(setApiData)
      .catch(() => setError(true))
  }, [])

  const closeModal = useCallback(() => setShowModal(false), [])

  if (error) return null

  const findProvider = (slug: string) =>
    apiData?.providers?.find((p: any) => p.ctaSlug === slug)

  const rawPrice: number = apiData ? (area === 'DK2' ? apiData.rawDk2 : apiData.rawDk1) : 0
  const common = apiData ? (area === 'DK2' ? apiData.commonDk2 : apiData.commonDk1) : null

  const primaryProvider = apiData ? findProvider(ctaSlug) : null

  const priceRows = primaryProvider && common
    ? KWH_TIERS.map((kwh) => ({ kwh, ...calcPrice(primaryProvider, rawPrice, common, kwh) }))
    : null

  const slugsToShow = offerSlugs.length > 0 ? offerSlugs : [ctaSlug]
  const offerRows = apiData && common
    ? slugsToShow.map((slug) => {
        const p = findProvider(slug)
        if (!p) return null
        const { total, monthly } = calcPrice(p, rawPrice, common, 4000)
        return { p, total, monthly, slug }
      }).filter(Boolean)
    : null

  const hasProsOrCons = pros.length > 0 || cons.length > 0
  const reviewSlug = primaryProvider?.reviewSlug

  return (
    <>
      {showModal && (
        <LivePricesModal
          area={area}
          providerName={primaryProvider?.title || primaryProvider?.name || ctaSlug}
          onClose={closeModal}
        />
      )}

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        overflow: 'hidden',
        margin: '32px 0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {/* Header — title/text left, logo right */}
        <div style={{ padding: '28px 28px 0', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
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
              <p style={{ fontSize: '14.5px', color: '#6b7280', lineHeight: 1.7, marginBottom: '20px' }}>
                {text}
              </p>
            )}
          </div>

          {/* Logo — right side */}
          {primaryProvider?.logoFile && (
            <div style={{ flexShrink: 0, padding: '4px 0' }}>
              <img
                src={`/logos/${primaryProvider.logoFile}`}
                alt={primaryProvider.name}
                style={{ maxWidth: '110px', maxHeight: '48px', objectFit: 'contain', display: 'block' }}
              />
            </div>
          )}
        </div>

        <div style={{ padding: '0 28px' }}>
          {/* Pros / Cons */}
          {hasProsOrCons && (
            <div style={{ display: 'grid', gridTemplateColumns: pros.length && cons.length ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '24px' }}>
              {pros.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Fordele</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pros.map((pro, i) => (
                      <li key={i} style={{ fontSize: '13.5px', color: '#374151', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#16a34a', flexShrink: 0, marginTop: '1px' }}>✓</span>{pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cons.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Ulemper</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {cons.map((con, i) => (
                      <li key={i} style={{ fontSize: '13.5px', color: '#374151', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>✕</span>{con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* kWh price table */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
              Aktuel pris ved forskelligt forbrug
            </div>
            {priceRows ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 0 8px' }}>Forbrug</th>
                    <th style={{ textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 0 8px' }}>Kr./kWh</th>
                    <th style={{ textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 0 8px' }}>Ca. pr. md.</th>
                  </tr>
                </thead>
                <tbody>
                  {priceRows.map((row, i) => (
                    <tr key={row.kwh} style={{ borderBottom: i < priceRows.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <td style={{ padding: '10px 0', fontSize: '13.5px', color: '#374151', fontWeight: 500 }}>{fmtDK(row.kwh, 0)} kWh/år</td>
                      <td style={{ padding: '10px 0', fontSize: '14px', color: '#111827', fontWeight: 700, textAlign: 'right', fontFamily: 'var(--font-display)' }}>{fmtDK(row.total, 2)} kr.</td>
                      <td style={{ padding: '10px 0', fontSize: '13.5px', color: '#6b7280', textAlign: 'right' }}>{fmtDK(row.monthly, 0)} kr.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ height: '100px', background: '#f9fafb', borderRadius: '8px' }} />
            )}
          </div>
        </div>

        {/* Offer rows */}
        <div style={{ borderTop: '1px solid #f3f4f6' }}>
          <div style={{ padding: '14px 28px 10px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Aktuelle tilbud
          </div>
          {offerRows ? offerRows.map((row: any) => (
            <div key={row.slug} style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr auto',
              gap: '12px',
              alignItems: 'center',
              padding: '14px 28px',
              borderTop: '1px solid #f9fafb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {row.p.logoFile ? (
                  <img src={`/logos/${row.p.logoFile}`} alt={row.p.name}
                    style={{ maxWidth: '80px', maxHeight: '36px', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{row.p.name.slice(0, 10)}</span>
                )}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                  {row.p.title || row.p.name}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {row.p.introtilbud && (
                    <span style={{ fontSize: '10.5px', background: '#fef9c3', color: '#854d0e', padding: '1px 7px', borderRadius: '20px', fontWeight: 500 }}>Introtilbud</span>
                  )}
                  <span style={{ fontSize: '10.5px', background: '#f3f4f6', color: '#6b7280', padding: '1px 7px', borderRadius: '20px' }}>{area}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', justifyContent: 'flex-end', marginBottom: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>{fmtDK(row.total, 2)}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>kr./kWh</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#9ca3af', marginBottom: '8px' }}>
                  ≈ <strong style={{ color: '#6b7280' }}>{fmtDK(row.monthly, 0)} kr.</strong>/md.
                </div>
                <a href={`/go/${row.slug}`} target="_blank" rel="nofollow noopener noreferrer"
                  style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '7px 14px', borderRadius: '7px', fontSize: '12.5px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  Gå til tilbud →
                </a>
              </div>
            </div>
          )) : (
            <div style={{ padding: '20px 28px' }}>
              <div style={{ height: '60px', background: '#f9fafb', borderRadius: '8px' }} />
            </div>
          )}
        </div>

        {/* Bottom action buttons */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {reviewSlug && (
            <a href={`/${reviewSlug}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', padding: '9px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none' }}>
              📝 Læs vores anmeldelse
            </a>
          )}
          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '9px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}>
            ⚡ Se live timepriser
          </button>
        </div>
      </div>
    </>
  )
}
