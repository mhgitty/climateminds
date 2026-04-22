import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
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
    description: page.metaDescription || page.intro || '',
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
      <HeroSection title={page.title} intro={page.intro} narrow />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {page.body && <PortableTextRenderer value={page.body} />}
      </div>
      <Footer />
    </>
  )
}
