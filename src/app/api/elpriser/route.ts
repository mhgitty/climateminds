import { NextResponse } from 'next/server'
import { getElPriserData } from '@/lib/elpriser'

export async function GET() {
  try {
    const data = await getElPriserData()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' },
    })
  } catch (err) {
    console.error('[/api/elpriser]', err)
    return NextResponse.json({ error: 'Prisdata er utilgængeligt' }, { status: 502 })
  }
}
