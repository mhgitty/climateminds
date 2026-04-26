import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { AuthorMeta } from '@/components/AuthorMeta'
import { AuthorBio } from '@/components/AuthorBio'
import { JsonLd } from '@/components/JsonLd'
import { getPostBySlug, getPosts } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://climateminds.dk'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug).catch(() => null)
  if (!post) return {}
  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || ''
  const canonical = `${BASE}/blog/${slug}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.lastUpdated || post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      ...(post.featuredImage?.asset?.url
        ? { images: [{ url: post.featuredImage.asset.url, alt: title }] }
        : {}),
    },
    twitter: {
      title,
      description,
      ...(post.featuredImage?.asset?.url
        ? { images: [post.featuredImage.asset.url] }
        : {}),
    },
  }
}

/** Extract plain-text FAQ items from Portable Text body */
function extractFaqs(body: any[]): Array<{ question: string; answer: string }> {
  return (body || [])
    .filter((b: any) => b._type === 'faqBlock')
    .flatMap((b: any) => b.items || [])
    .filter((f: any) => f.question && f.answer)
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, latestPosts] = await Promise.all([
    getPostBySlug(slug).catch(() => null),
    getPosts(6),
  ])
  if (!post) notFound()

  const canonical = `${BASE}/blog/${slug}`
  const faqs = post.body ? extractFaqs(post.body) : []

  const jsonLdGraph: object[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hjem', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
      ],
    },
    {
      '@type': 'Article',
      '@id': `${canonical}#article`,
      headline: post.title,
      description: post.excerpt || '',
      url: canonical,
      datePublished: post.publishedAt,
      dateModified: post.lastUpdated || post.publishedAt,
      inLanguage: 'da-DK',
      author: post.author
        ? { '@type': 'Person', name: post.author.name }
        : { '@type': 'Organization', name: 'Climateminds' },
      publisher: {
        '@type': 'Organization',
        name: 'Climateminds',
        url: BASE,
        logo: { '@type': 'ImageObject', url: `${BASE}/logo.webp` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      ...(post.featuredImage?.asset?.url
        ? { image: post.featuredImage.asset.url }
        : {}),
    },
  ]

  if (faqs.length > 0) {
    jsonLdGraph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  const jsonLd = { '@context': 'https://schema.org', '@graph': jsonLdGraph }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />

      {/* Hero header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
            <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Hjem</a>
            <span style={{ margin: '0 6px' }}>›</span>
            <a href="/blog" style={{ color: '#9ca3af', textDecoration: 'none' }}>Guides</a>
            <span style={{ margin: '0 6px' }}>›</span>
            <span style={{ color: '#6b7280' }}>{post.title}</span>
          </div>
          {post.category && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: 500, padding: '3px 12px', borderRadius: '20px', marginBottom: '16px' }}>
              {post.category.emoji} {post.category.name}
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '16px', maxWidth: '720px' }}>
            {post.title}
          </h1>
          {post.excerpt && <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.7, maxWidth: '640px' }}>{post.excerpt}</p>}
        </div>
      </div>

      {/* Article body + sticky TOC sidebar */}
      <div className="article-layout">
        {/* Main content */}
        <article className="article-content">
          {post.author && (
            <AuthorMeta
              author={post.author}
              publishedAt={post.publishedAt}
              lastUpdated={post.lastUpdated}
            />
          )}
          {post.body && <PortableTextRenderer value={post.body} posts={latestPosts} />}
          {post.author && <AuthorBio author={post.author} />}
        </article>

        {/* Sticky TOC sidebar */}
        {post.body && (
          <aside className="toc-sidebar">
            <TableOfContents body={post.body} />
          </aside>
        )}
      </div>

      <Footer />
    </>
  )
}
