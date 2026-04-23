import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { AuthorMeta } from '@/components/AuthorMeta'
import { AuthorBio } from '@/components/AuthorBio'
import { getPostBySlug, getPosts } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug).catch(() => null)
  if (!post) return {}
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || '',
    alternates: { canonical: `https://climateminds.dk/blog/${slug}` },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, latestPosts] = await Promise.all([
    getPostBySlug(slug).catch(() => null),
    getPosts(6),
  ])
  if (!post) notFound()

  return (
    <>
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
