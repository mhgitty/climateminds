import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { getPageBySlug } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug).catch(() => null)
  if (!page) return {}
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || '',
    alternates: { canonical: `https://climateminds.dk/${slug}` },
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPageBySlug(slug).catch(() => null)
  if (!page) notFound()

  return (
    <>
      <Navbar />
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            {page.title}
          </h1>
        </div>
      </div>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {page.body && <PortableTextRenderer value={page.body} />}
      </div>
      <Footer />
    </>
  )
}
