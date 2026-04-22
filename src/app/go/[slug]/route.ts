import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

// Static fallback map built from redirects.txt
// Keys are ctaSlugs, values are affiliate URLs
const STATIC_REDIRECTS: Record<string, string> = {
  edison: 'https://bandstrack.com/r/edison?site=climateminds.dk',
  energiplus: 'https://bandstrack.com/r/energiplus?site=climateminds.dk',
  watt: 'https://bandstrack.com/r/watt?site=climateminds.dk',
  modstrom: 'https://bandstrack.com/r/modstroem?site=climateminds.dk',
  nettopower: 'https://bandstrack.com/r/nettopower?site=climateminds.dk',
  energidrift: 'https://bandstrack.com/r/energidrift?site=climateminds.dk',
  budget: 'https://bandstrack.com/r/budgetenergi?site=climateminds.dk',
  gnpenergy: 'https://bandstrack.com/r/gnpenergy?site=climateminds.dk',
  vestenergi: 'https://bandstrack.com/r/vestenergi?site=climateminds.dk',
  gasel: 'https://bandstrack.com/r/gasel?site=climateminds.dk',
  ok: 'https://bandstrack.com/r/okel?site=climateminds.dk',
  energifyn: 'https://bandstrack.com/r/energifyn?site=climateminds.dk',
  aura: 'https://bandstrack.com/r/aura?site=climateminds.dk',
  sefenergi: 'https://bandstrack.com/r/sefenergi?site=climateminds.dk',
  velkommen: 'https://bandstrack.com/r/velkommen?site=climateminds.dk',
  cheapenergy: 'https://bandstrack.com/r/cheapenergy?site=climateminds.dk',
  zappenergy: 'https://bandstrack.com/r/zappenergy?site=climateminds.dk',
  nrgi: 'https://bandstrack.com/r/nrgi?site=climateminds.dk',
  dccenergy: 'https://bandstrack.com/r/dccenergy?site=climateminds.dk',
  dcc: 'https://bandstrack.com/r/dccenergy?site=climateminds.dk',
  norlys: 'https://bandstrack.com/r/norlys?site=climateminds.dk',
  energynordic: 'https://bandstrack.com/r/energynordic?site=climateminds.dk',
  ewii: 'https://bandstrack.com/r/ewii?site=climateminds.dk',
  looad: 'https://bandstrack.com/r/looad?site=climateminds.dk',
  altid: 'https://bandstrack.com/r/altid-energi?site=climateminds.dk',
  evdk: 'https://bandstrack.com/r/evdk?site=climateminds.dk',
  trygenergi: 'https://bandstrack.com/r/tryg-energi?site=climateminds.dk',
  evdkladeboks: 'https://bandstrack.com/r/evdkladeboks?site=climateminds.dk',
  looadladeboks: 'https://bandstrack.com/r/looad-ladeboks?site=climateminds.dk',
  powerfuelladeboks: 'https://bandstrack.com/r/powerfuel-ladestander?site=climateminds.dk',
  norlysladeboks: 'https://bandstrack.com/r/norlys-ladeboks?site=climateminds.dk',
  modstroemladeboks: 'https://bandstrack.com/r/modstroemladeboks?site=climateminds.dk',
  nettopowerladeboks: 'https://bandstrack.com/r/nettopowerladeboks?site=climateminds.dk',
  dccladeboks: 'https://bandstrack.com/r/dccladeboks?site=climateminds.dk',
  goe: 'https://bandstrack.com/r/goe?site=climateminds.dk',
  okladeboks: 'https://bandstrack.com/r/okladeboks?site=climateminds.dk',
  enkel: 'https://bandstrack.com/r/enkel-el?site=climateminds.dk',
  enkelzaptecgo2: 'https://bandstrack.com/r/enkel-zaptec-go-2?site=climateminds.dk',
  enkelnexblue: 'https://bandstrack.com/r/enkel-nexblue?site=climateminds.dk',
  enkelzaptecgo: 'https://bandstrack.com/r/enkel-zaptec-go?site=climateminds.dk',
  auraladeboksleje: 'https://bandstrack.com/r/auraladeboksleje?site=climateminds.dk',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // 1. Check Sanity first — affiliateUrl field on the elselskab doc overrides the static map
  try {
    const sanityUrl = await client.fetch<string | null>(
      `*[_type == "elselskab" && ctaSlug.current == $slug][0].affiliateUrl`,
      { slug },
      { next: { revalidate: 300 } }
    )
    if (sanityUrl) {
      return NextResponse.redirect(sanityUrl, { status: 302 })
    }
  } catch {
    // fall through to static map
  }

  // 2. Fall back to static map
  const staticUrl = STATIC_REDIRECTS[slug]
  if (staticUrl) {
    return NextResponse.redirect(staticUrl, { status: 302 })
  }

  // 3. Nothing found — redirect to home
  return NextResponse.redirect(new URL('/', _req.url), { status: 302 })
}
