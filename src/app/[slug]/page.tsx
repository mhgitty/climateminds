import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { JsonLd } from '@/components/JsonLd'
import { getPageBySlug } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://climateminds.dk'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug).catch(() => null)
  if (!page) return {}
  const title = page.metaTitle || page.title
  const description = page.metaDescription || page.intro || ''
  const canonical = `${BASE}/${slug}`
  const img = page.featuredImage?.url ? page.featuredImage : null
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      ...(img ? { images: [{ url: img.url, alt: img.alt || title }] } : {}),
    },
    twitter: {
      title,
      description,
      ...(img ? { images: [img.url] } : {}),
    },
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPageBySlug(slug).catch(() => null)
  if (!page) notFound()

  const canonical = `${BASE}/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hjem', item: BASE },
          { '@type': 'ListItem', position: 2, name: page.title, item: canonical },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.intro || '',
        inLanguage: 'da-DK',
        publisher: {
          '@type': 'Organization',
          name: 'Climateminds',
          url: BASE,
        },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />
      <HeroSection title={page.title} intro={page.intro} />

      <div className="article-layout">
        <article className="article-content">
          {page.body && <PortableTextRenderer value={page.body} />}
        </article>

        {page.body && (
          <aside className="toc-sidebar">
            <TableOfContents body={page.body} />
          </aside>
        )}
      </div>

      <Footer />
    </>
  )
}
