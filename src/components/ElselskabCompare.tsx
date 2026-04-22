'use client'

import { useState, useMemo } from 'react'
import type { Provider, CommonComponents } from '@/lib/elpriser'
import { KWH_PRESETS, DEFAULT_ANNUAL_KWH, calcTotalPrice } from '@/lib/elpriser'

export interface ElselskabCompareProps {
  rawDk1: number
  rawDk2: number
  commonDk1: CommonComponents
  commonDk2: CommonComponents
  providers: Provider[]
  sanityData?: Record<string, { affiliateUrl?: string; shortDescription?: string; badges?: string[] }>
  fetchedAt: string
}

function fmtDK(n: number, dec: number): string {
  return n.toLocaleString('da-DK', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

const BADGE_LABELS: Record<string, string> = {
  'green': '🌿 Grøn',
  'editors-choice': '⭐ Redaktørens valg',
  'cheapest': '💰 Billigst',
  'new': '🆕 Ny',
  'no-lock-in': '🔒 Ingen binding',
}

export default function ElselskabCompare({
  rawDk1, rawDk2, commonDk1, commonDk2, providers, sanityData = {}, fetchedAt,
}: ElselskabCompareProps) {
  const [area, setArea] = useState<'DK1' | 'DK2'>('DK1')
  const [presetIdx, setPresetIdx] = useState(() => KWH_PRESETS.indexOf(DEFAULT_ANNUAL_KWH))
  const [introOnly, setIntroOnly] = useState(false)
  const [openTooltip, setOpenTooltip] = useState<string | null>(null)

  const annualKwh = KWH_PRESETS[presetIdx] ?? DEFAULT_ANNUAL_KWH
  const rawPrice = area === 'DK2' ? rawDk2 : rawDk1
  const common = area === 'DK2' ? commonDk2 : commonDk1

  const sorted = useMemo(() => {
    return providers
      .filter((p) => !introOnly || p.introtilbud)
      .map((p) => {
        const { total, monthly, aboPerKwh } = calcTotalPrice(p, rawPrice, common, annualKwh)
        return { ...p, total, monthly, aboPerKwh, sanity: sanityData[p.ctaSlug] }
      })
      .sort((a, b) => a.total - b.total)
  }, [providers, area, annualKwh, introOnly, rawPrice, common, sanityData])

  const fetchDate = new Date(fetchedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="elcomp-filters">
        {/* Area toggle */}
        <div className="elcomp-filter-group">
          <div className="elcomp-filter-label">Priszone</div>
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '3px' }}>
            {(['DK1', 'DK2'] as const).map((a) => (
              <button key={a} onClick={() => setArea(a)} className={`elcomp-area-btn${area === a ? ' is-active' : ''}`}>
                {a === 'DK1' ? 'DK1 – Vest' : 'DK2 – Øst'}
              </button>
            ))}
          </div>
        </div>

        {/* kWh slider */}
        <div className="elcomp-slider-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="elcomp-filter-label">Årligt forbrug</span>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>{fmtDK(annualKwh, 0)} kWh/år</span>
          </div>
          <input type="range" min={0} max={KWH_PRESETS.length - 1} step={1} value={presetIdx}
            onChange={(e) => setPresetIdx(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: '#16a34a' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            {KWH_PRESETS.map((v) => (
              <span key={v} style={{ fontSize: '10.5px', color: '#d1d5db' }}>{v >= 1000 ? `${v / 1000}k` : v}</span>
            ))}
          </div>
        </div>

        {/* Intro filter */}
        <div className="elcomp-filter-group">
          <div className="elcomp-filter-label">Filter</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', color: '#374151' }}>
            <input type="checkbox" checked={introOnly} onChange={(e) => setIntroOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#16a34a', cursor: 'pointer' }} />
            Kun introtilbud
          </label>
        </div>
      </div>

      {/* ── Cards ── */}
      {sorted.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
          Ingen selskaber matcher dine filtre.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sorted.map((p, idx) => {
            const isCheapest = idx === 0
            const affiliateUrl = p.sanity?.affiliateUrl || `/go/${p.ctaSlug}`
            const isTooltipOpen = openTooltip === p.key

            return (
              <div key={p.key}
                className="elcard-row"
                style={{
                  border: `1px solid ${isCheapest ? '#16a34a' : '#e5e7eb'}`,
                  boxShadow: isCheapest ? '0 0 0 2px rgba(22,163,74,0.15)' : 'none',
                }}>

                {isCheapest && (
                  <div className="elcard-cheapest-badge">💰 Billigst lige nu</div>
                )}

                {/* Logo */}
                <div className="elcard-logo-col">
                  {p.logoFile ? (
                    <img src={`/logos/${p.logoFile}`} alt={p.name}
                      style={{ maxWidth: '100px', maxHeight: '44px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{
                      width: '80px', height: '40px', background: '#f3f4f6', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: '#9ca3af', fontWeight: 500,
                    }}>
                      {p.name.slice(0, 8)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="elcard-info-col">
                  {/* Logo shown inline on mobile only */}
                  <div className="elcard-mobile-logo">
                    {p.logoFile ? (
                      <img src={`/logos/${p.logoFile}`} alt={p.name}
                        style={{ maxHeight: '28px', maxWidth: '80px', objectFit: 'contain', display: 'block' }} />
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>{p.name.slice(0, 12)}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                      {p.title || p.name}
                    </span>
                    {p.introtilbud && (
                      <span style={{ fontSize: '11px', background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>
                        Introtilbud
                      </span>
                    )}
                    {(p.sanity?.badges ?? []).map((b) => BADGE_LABELS[b] && (
                      <span key={b} style={{ fontSize: '11px', background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>
                        {BADGE_LABELS[b]}
                      </span>
                    ))}
                  </div>
                  {p.sanity?.shortDescription && (
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px', lineHeight: 1.5 }}>{p.sanity.shortDescription}</p>
                  )}
                  {p.campaign && <div style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: 500 }}>{p.campaign}</div>}
                  <div className="elcard-tags">
                    {[['Pristype', 'Variabel'], ['Binding', 'Ingen']].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '3px 9px' }}>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{label}:</span>
                        <span style={{ fontSize: '11.5px', color: '#374151', fontWeight: 500 }}>{val}</span>
                      </div>
                    ))}
                    {p.reviewSlug && (
                      <a href={`/${p.reviewSlug}`} style={{ fontSize: '12px', color: '#16a34a', textDecoration: 'underline', alignSelf: 'center' }}>
                        Læs anmeldelse
                      </a>
                    )}
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="elcard-price-col">
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end', marginBottom: '2px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
                      {fmtDK(p.total, 2)}
                    </span>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>kr./kWh</span>
                    <button onClick={() => setOpenTooltip(isTooltipOpen ? null : p.key)} className="elcard-tooltip-trigger">?</button>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    ≈ <strong style={{ color: '#374151' }}>{fmtDK(Math.round(p.monthly), 0)} kr.</strong>/md.
                  </div>
                  <a href={affiliateUrl} target="_blank" rel="nofollow noopener noreferrer"
                    className={`elcard-cta${isCheapest ? ' is-cheapest' : ''}`}>
                    Gå til tilbud →
                  </a>

                  {/* Price breakdown tooltip */}
                  {isTooltipOpen && (
                    <div className="elcard-tooltip">
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827', marginBottom: '8px' }}>Prissammensætning</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Baseret på <strong>{fmtDK(annualKwh, 0)} kWh/år</strong></div>
                      {[
                        ['Rå spotpris', rawPrice],
                        ['kWh-tillæg', p.kwhTillaeg],
                        ['Abonnement (pr. kWh)', p.aboPerKwh],
                        [`Netselskab (${area === 'DK2' ? 'Radius' : 'N1'})`, common.netselskab],
                        ['Energinet', common.energinet],
                        ['Staten', common.staten],
                      ].map(([label, val]) => (
                        <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12.5px' }}>
                          <span style={{ color: '#6b7280' }}>{label}</span>
                          <span style={{ color: '#111827', fontWeight: 500 }}>{(val as number).toLocaleString('da-DK', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} kr./kWh</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', color: '#111827' }}>
                        <span>Total</span>
                        <span>{fmtDK(p.total, 4)} kr./kWh</span>
                      </div>
                      <button onClick={() => setOpenTooltip(null)} style={{ position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#9ca3af' }}>×</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '16px', textAlign: 'center' }}>
        Spotpris er gennemsnittet for seneste måned fra{' '}
        <a href="https://energidataservice.dk" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af' }}>energidataservice.dk</a>.
        Opdateret: {fetchDate}. Priser er inkl. moms.
      </p>
    </div>
  )
}
