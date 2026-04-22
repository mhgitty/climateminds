/**
 * elpriser.ts — server-side data layer for the electricity comparison table.
 * Ports the logic from the WordPress plugin (class-elselskab-compare.php).
 *
 * Sources:
 *   1. Google Sheets CSV  → provider list (name, kWh tillæg, abonnement, etc.)
 *   2. energidataservice.dk → last month's average spot price (DK1 + DK2)
 */

const SHEET_ID = process.env.SHEETS_ID ?? '12RhPm3xKVgt18B7sFlASBf4biBCCmOLQliiks-Imxbw'
const SHEET_NAME = 'Elselskaber'

export const KWH_PRESETS = [1000, 2000, 4000, 6000, 8000, 10000]
export const DEFAULT_ANNUAL_KWH = 4000

// Fixed charges in kr./kWh (mirrored from PHP plugin, April 2025)
const STATEN = 0.0100
const ENERGINET_TRANSMISSION = 0.0537
const ENERGINET_SYSTEM = 0.0900
const ENERGINET_ABO_YEAR = 233.75
const N1_NETTARIF_KWH = 0.3844       // DK1
const N1_NETABO_MONTH = 35.15
const RADIUS_NETTARIF_KWH = 0.4272  // DK2
const RADIUS_NETABO_MONTH = 45.97

export type PriceArea = 'DK1' | 'DK2'

export interface Provider {
  key: string
  name: string
  title: string
  logoFile: string
  ctaSlug: string
  affiliateUrl: string
  campaign: string
  reviewSlug: string
  introtilbud: boolean
  promo: boolean
  kwhTillaeg: number
  aboMonthly: number
}

export interface CommonComponents {
  netselskab: number
  energinet: number
  staten: number
}

export interface ElPriserData {
  rawDk1: number
  rawDk2: number
  commonDk1: CommonComponents
  commonDk2: CommonComponents
  providers: Provider[]
  fetchedAt: string
}

function aboMonthlyToKwh(monthly: number, annualKwh = DEFAULT_ANNUAL_KWH): number {
  return annualKwh > 0 ? (monthly * 12) / annualKwh : 0
}

function aboYearlyToKwh(yearly: number, annualKwh = DEFAULT_ANNUAL_KWH): number {
  return annualKwh > 0 ? yearly / annualKwh : 0
}

function parseDecimal(raw: string): number {
  return parseFloat(raw.replace(',', '.').replace(/[^0-9.\-]/g, '')) || 0
}

export function getCommonComponents(area: PriceArea): CommonComponents {
  const energinet = ENERGINET_TRANSMISSION + ENERGINET_SYSTEM + aboYearlyToKwh(ENERGINET_ABO_YEAR)
  const netselskab = area === 'DK2'
    ? RADIUS_NETTARIF_KWH + aboMonthlyToKwh(RADIUS_NETABO_MONTH)
    : N1_NETTARIF_KWH + aboMonthlyToKwh(N1_NETABO_MONTH)
  return { netselskab, energinet, staten: STATEN }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuote = !inQuote
    } else if (ch === ',' && !inQuote) {
      result.push(cur.trim()); cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur.trim())
  return result
}

async function fetchProviders(): Promise<Provider[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`
  const res = await fetch(url, { next: { revalidate: 1800 } })
  if (!res.ok) return []

  const lines = (await res.text()).split('\n')
  const providers: Provider[] = []

  lines.slice(1).forEach((line, index) => {
    if (!line.trim()) return
    const cols = parseCSVLine(line)
    const name = cols[0] ?? ''
    const ctaSlug = cols[1] ?? ''
    if (!name || !ctaSlug) return

    providers.push({
      key: `${ctaSlug.toLowerCase()}_${index}`,
      name,
      title: cols[5] || name,
      logoFile: cols[4] ? `${cols[4]}.webp` : '',
      ctaSlug,
      affiliateUrl: '',
      campaign: cols[6] ?? '',
      reviewSlug: cols[7] ?? '',
      introtilbud: (cols[8] ?? '').toLowerCase() === 'ja',
      promo: (cols[9] ?? '').toLowerCase() === 'x',
      kwhTillaeg: parseDecimal(cols[2] ?? '0'),
      aboMonthly: parseDecimal(cols[3] ?? '0'),
    })
  })

  return providers
}

async function fetchRawPrice(area: PriceArea): Promise<number> {
  const now = new Date()
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01T00:00`

  const filter = encodeURIComponent(JSON.stringify({ PriceArea: [area] }))
  const url = `https://api.energidataservice.dk/dataset/DayAheadPrices?start=${fmt(lastStart)}&end=${fmt(thisStart)}&filter=${filter}&limit=10000`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return 0

  const { records = [] } = await res.json()
  let sum = 0, count = 0
  for (const r of records) {
    const mwh = r.DayAheadPriceDKK ?? r.SpotPriceDKK ?? null
    if (mwh != null && mwh >= 0) { sum += mwh / 1000; count++ }
  }
  return count > 0 ? sum / count : 0
}

let _cache: { data: ElPriserData; ts: number } | null = null
const CACHE_TTL = 10 * 60 * 1000

export async function getElPriserData(): Promise<ElPriserData> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.data

  const [rawDk1, rawDk2, providers] = await Promise.all([
    fetchRawPrice('DK1'),
    fetchRawPrice('DK2'),
    fetchProviders(),
  ])

  const data: ElPriserData = {
    rawDk1, rawDk2,
    commonDk1: getCommonComponents('DK1'),
    commonDk2: getCommonComponents('DK2'),
    providers,
    fetchedAt: new Date().toISOString(),
  }

  _cache = { data, ts: Date.now() }
  return data
}

export function calcTotalPrice(
  provider: Provider,
  rawPrice: number,
  common: CommonComponents,
  annualKwh: number = DEFAULT_ANNUAL_KWH
): { total: number; monthly: number; aboPerKwh: number } {
  const aboPerKwh = aboMonthlyToKwh(provider.aboMonthly, annualKwh)
  const total = rawPrice + provider.kwhTillaeg + aboPerKwh + common.netselskab + common.energinet + common.staten
  return { total, monthly: total * (annualKwh / 12), aboPerKwh }
}
