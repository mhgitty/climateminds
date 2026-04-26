import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PostCard } from '@/components/PostCard'
import ElselskabCompare from '@/components/ElselskabCompare'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { JsonLd } from '@/components/JsonLd'
import { getElPriserData } from '@/lib/elpriser'
import { getPosts, getElselskaber, getHomepage } from '@/lib/sanity'
import type { Metadata } from 'next'

export const revalidate = 1800

const BASE = 'https://climateminds.dk'

const DEFAULT_HERO_HEADING = 'Find den billigste el'
const DEFAULT_HERO_GREEN = 'i Danmark'
const DEFAULT_INTRO = 'Vi beregner den reelle pris pr. kWh for alle store elselskaber baseret på den aktuelle spotpris. Juster dit forbrug og find det tilbud, der passer til dig.'
const DEFAULT_HOW_TITLE = 'Sådan beregner vi prisen'
const DEFAULT_HOW_ITEMS = [
  { icon: '⚡', title: 'Rå spotpris', description: 'Gennemsnittet for seneste måned fra energidataservice.dk — opdateres automatisk.' },
  { icon: '📋', title: '+ Elselskabets tillæg', description: 'Hvert selskabs kWh-tillæg og abonnement omregnet til kr. pr. kWh.' },
  { icon: '🔌', title: '+ Faste afgifter', description: 'Netselskab (N1 eller Radius), Energinet-tarif og statens afgifter.' },
]

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getHomepage().catch(() => null)
  const title = hp?.metaTitle || 'Sammenlign elselskaber — find den billigste el i Danmark'
  const description =
    hp?.metaDescription ||
    'Sammenlign priser fra alle store danske elselskaber baseret på den aktuelle spotpris. Opdateret månedligt fra energidataservice.dk.'
  return {
    title,
    description,
    alternates: { canonical: BASE },
    openGraph: {
      title,
      description,
      url: BASE,
      type: 'website',
    },
    twitter: {
      title,
      description,
    },
  }
}

export default async function HomePage() {
  const [elData, posts, elselskaber, hp] = await Promise.all([
    getElPriserData().catch(() => null),
    getPosts(6).catch(() => []),
    getElselskaber().catch(() => []),
    getHomepage().catch(() => null),
  ])

  const sanityData: Record<string, { affiliateUrl?: string; shortDescription?: string; badges?: string[] }> = {}
  for (const es of elselskaber as any[]) {
    if (es.ctaSlug?.current) {
      sanityData[es.ctaSlug.current] = {
        affiliateUrl: `/go/${es.ctaSlug.current}`,
        shortDescription: es.shortDescription,
        badges: es.badges ?? [],
      }
    }
  }

  const heroHeading = hp?.heroHeading || DEFAULT_HERO_HEADING
  const heroGreen   = hp?.heroGreenText || DEFAULT_HERO_GREEN
  const heroSubtext = hp?.intro || DEFAULT_INTRO
  const showHow     = hp?.showHowItWorks !== false
  const howTitle    = hp?.howItWorksTitle || DEFAULT_HOW_TITLE
  const howItems    = (hp?.howItWorksItems?.length ? hp.howItWorksItems : DEFAULT_HOW_ITEMS) as typeof DEFAULT_HOW_ITEMS

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE}/#website`,
        url: BASE,
        name: 'Climateminds.dk',
        description: 'Danmarks uafhængige guide til billig og grøn el',
        inLanguage: 'da-DK',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE}/blog?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${BASE}/#organization`,
        name: 'Climateminds',
        url: BASE,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE}/logo.webp`,
        },
      },
    ],
  }

  return (
    <>
      <JsonLd data={websiteSchema} />
      <Navbar />

      {/* Hero */}
      <section className="hero-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 className="hero-heading">
            {heroHeading}<br />
            <span style={{ color: '#16a34a' }}>{heroGreen}</span>
          </h1>
          <p className="hero-subtext">{heroSubtext}</p>
        </div>
      </section>

      {/* Comparison table */}
      <div className="section">
        {elData ? (
          <ElselskabCompare
            rawDk1={elData.rawDk1}
            rawDk2={elData.rawDk2}
            commonDk1={elData.commonDk1}
            commonDk2={elData.commonDk2}
            providers={elData.providers}
            sanityData={sanityData}
            fetchedAt={elData.fetchedAt}
          />
        ) : (
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '48px', textAlign: 'center', color: '#9ca3af',
          }}>
            <p>Prisdata er midlertidigt utilgængeligt. Prøv igen om lidt.</p>
          </div>
        )}
      </div>

      {/* How it works */}
      {showHow && (
        <section style={{ borderTop: '1px solid #e5e7eb', background: '#fff', padding: '48px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
              {howTitle}
            </h2>
            <div className="how-grid">
              {howItems.map((item, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '24px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>{item.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{item.title}</div>
                  <p style={{ fontSize: '13.5px', color: '#6b7280', lineHeight: 1.6 }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Page body content with sticky TOC sidebar */}
      {hp?.body && (
        <div className="article-layout" style={{ paddingBottom: '0' }}>
          <div className="article-content">
            <PortableTextRenderer value={hp.body} posts={posts as any} />
          </div>
          <aside className="toc-sidebar">
            <TableOfContents body={hp.body} />
          </aside>
        </div>
      )}

      {/* Latest articles */}
      {(posts as any[]).length > 0 && (
        <section style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#111827' }}>Seneste guides & artikler</h2>
              <a href="/blog" style={{ fontSize: '13.5px', color: '#16a34a', textDecoration: 'none', fontWeight: 500 }}>Se alle →</a>
            </div>
            <div className="blog-grid">
              {(posts as any[]).map((post: any) => <PostCard key={post._id} {...post} />)}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
