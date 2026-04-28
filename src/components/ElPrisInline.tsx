'use client'

import { useEffect, useState } from 'react'

interface Props {
  provider: string
  area?: 'DK1' | 'DK2'
  format?: 'kwh' | 'monthly'
}

export function ElPrisInline({ provider, area = 'DK1', format = 'kwh' }: Props) {
  const [total, setTotal] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/elpriser')
      .then((r) => r.json())
      .then((data) => {
        const p = data.providers?.find((p: any) => p.ctaSlug === provider)
        if (!p) { setError(true); return }

        const rawPrice: number = area === 'DK2' ? data.rawDk2 : data.rawDk1
        const common = area === 'DK2' ? data.commonDk2 : data.commonDk1
        const annualKwh = 4000
        const aboPerKwh = (p.aboMonthly * 12) / annualKwh
        const totalKwh = rawPrice + p.kwhTillaeg + aboPerKwh + common.netselskab + common.energinet + common.staten
        setTotal(totalKwh)
      })
      .catch(() => setError(true))
  }, [provider, area])

  if (error) return <span style={{ color: '#9ca3af' }}>[ukendt udbyder]</span>
  if (total === null) return <span style={{ color: '#9ca3af' }}>…</span>

  if (format === 'monthly') {
    const monthly = total * (4000 / 12)
    return (
      <span style={{ fontWeight: 600, color: '#16a34a' }}>
        {Math.round(monthly).toLocaleString('da-DK')} kr./md.
      </span>
    )
  }

  return (
    <span style={{ fontWeight: 600, color: '#16a34a' }}>
      {total.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr./kWh
    </span>
  )
}
