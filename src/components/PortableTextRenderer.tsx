import { PortableText } from '@portabletext/react'
import { CalloutBlock } from './CalloutBlock'
import { FaqBlock } from './FaqBlock'
import { ProsConsBlock } from './ProsConsBlock'
import { LatestPostsBlock } from './LatestPostsBlock'
import { ElPrisInline } from './ElPrisInline'
import { ElselskabShortcode } from './ElselskabShortcode'
import { headingId } from '@/lib/headingId'

type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  readingTime?: number
  category?: { name: string; emoji?: string; slug: { current: string } }
}

export function PortableTextRenderer({ value, posts }: { value: any[]; posts?: Post[] }) {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''

  const components = {
    block: {
      h2: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return <h2 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', margin: '36px 0 14px', scrollMarginTop: '72px' }}>{children}</h2>
      },
      h3: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return <h3 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: '28px 0 10px', scrollMarginTop: '72px' }}>{children}</h3>
      },
      h4: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return <h4 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: '#111827', margin: '20px 0 8px', scrollMarginTop: '72px' }}>{children}</h4>
      },
      normal: ({ children }: any) => <p style={{ fontSize: '15.5px', color: '#374151', lineHeight: 1.75, marginBottom: '18px' }}>{children}</p>,
      blockquote: ({ children }: any) => <blockquote style={{ borderLeft: '3px solid #16a34a', paddingLeft: '18px', margin: '24px 0', color: '#6b7280', fontStyle: 'italic' }}>{children}</blockquote>,
    },
    marks: {
      strong: ({ children }: any) => <strong style={{ color: '#111827', fontWeight: 600 }}>{children}</strong>,
      em: ({ children }: any) => <em>{children}</em>,
      link: ({ value, children }: any) => (
        <a href={value.href} target={value.blank ? '_blank' : '_self'} rel="noopener noreferrer"
          style={{ color: '#16a34a', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          {children}
        </a>
      ),
    },
    list: {
      bullet: ({ children }: any) => <ul style={{ paddingLeft: '24px', margin: '16px 0 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ul>,
      number: ({ children }: any) => <ol style={{ paddingLeft: '24px', margin: '16px 0 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ol>,
    },
    listItem: {
      bullet: ({ children }: any) => <li style={{ fontSize: '15px', color: '#374151', lineHeight: 1.65 }}>{children}</li>,
      number: ({ children }: any) => <li style={{ fontSize: '15px', color: '#374151', lineHeight: 1.65 }}>{children}</li>,
    },
    types: {
      calloutBlock: ({ value }: any) => <CalloutBlock value={value} />,
      faqBlock: ({ value }: any) => <FaqBlock value={value} />,
      prosConsBlock: ({ value }: any) => <ProsConsBlock value={value} />,
      latestPostsBlock: ({ value: blockValue }: any) =>
        posts ? <LatestPostsBlock value={blockValue} posts={posts} /> : null,
      // Shortcodes
      elprisInline: ({ value }: any) => (
        <ElPrisInline provider={value.provider} area={value.area ?? 'DK1'} />
      ),
      elselskabShortcode: ({ value }: any) => (
        <ElselskabShortcode ctaSlug={value.ctaSlug} area={value.area ?? 'DK1'} />
      ),
      image: ({ value }: any) => {
        if (!value?.asset?._ref || !pid) return null
        const ref = value.asset._ref.replace('image-', '').replace(/-(\w+)$/, '.$1')
        return <img src={`https://cdn.sanity.io/images/${pid}/production/${ref}`} alt={value.alt || ''} style={{ width: '100%', borderRadius: '8px', margin: '24px 0', display: 'block' }} />
      },
    },
  }

  return <PortableText value={value} components={components} />
}
