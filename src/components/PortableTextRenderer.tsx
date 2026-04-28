import { PortableText } from '@portabletext/react'
import { Fragment, type ReactNode } from 'react'
import { CalloutBlock } from './CalloutBlock'
import { FaqBlock } from './FaqBlock'
import { ProsConsBlock } from './ProsConsBlock'
import { LatestPostsBlock } from './LatestPostsBlock'
import { TableBlock } from './TableBlock'
import { ElPrisInline } from './ElPrisInline'
import { ShortcodeText } from './ShortcodeText'
import { ElselskabShortcode } from './ElselskabShortcode'
import { ProviderPriceBlock } from './ProviderPriceBlock'
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

// ─── Shortcode helpers ────────────────────────────────────────────────────────

function blockHasShortcode(v: any): boolean {
  return (v?.children ?? []).some(
    (c: any) => c._type === 'span' && c.text?.includes('[elpris')
  )
}

/** Render a single span's text with mark styling preserved. */
function renderSpan(child: any, markDefs: any[]): ReactNode {
  const text: string = child.text ?? ''
  let content: ReactNode = text.includes('[elpris')
    ? <ShortcodeText text={text} />
    : text

  for (const mark of (child.marks ?? [])) {
    if (mark === 'strong') {
      content = <strong style={{ color: '#111827', fontWeight: 600 }}>{content}</strong>
    } else if (mark === 'em') {
      content = <em>{content}</em>
    } else {
      const def = markDefs?.find((d: any) => d._key === mark)
      if (def?._type === 'link') {
        content = (
          <a
            href={def.href}
            target={def.blank ? '_blank' : '_self'}
            rel="noopener noreferrer"
            style={{ color: '#16a34a', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            {content}
          </a>
        )
      }
    }
  }
  return content
}

/**
 * If the block contains shortcodes, render spans manually (preserving marks).
 * Returns null when no shortcodes are present so callers fall back to `children`.
 */
function renderWithShortcodes(v: any): ReactNode | null {
  if (!blockHasShortcode(v)) return null
  const markDefs = v?.markDefs ?? []
  return (v.children ?? []).map((child: any, i: number) => (
    <Fragment key={child._key ?? i}>
      {child._type === 'span' ? renderSpan(child, markDefs) : null}
    </Fragment>
  ))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PortableTextRenderer({ value, posts }: { value: any[]; posts?: Post[] }) {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''

  const components = {
    block: {
      h2: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return (
          <h2 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', margin: '36px 0 14px', scrollMarginTop: '72px' }}>
            {renderWithShortcodes(v) ?? children}
          </h2>
        )
      },
      h3: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return (
          <h3 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: '28px 0 10px', scrollMarginTop: '72px' }}>
            {renderWithShortcodes(v) ?? children}
          </h3>
        )
      },
      h4: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return (
          <h4 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: '#111827', margin: '20px 0 8px', scrollMarginTop: '72px' }}>
            {renderWithShortcodes(v) ?? children}
          </h4>
        )
      },
      normal: ({ children, value: v }: any) => (
        <p style={{ fontSize: '15.5px', color: '#374151', lineHeight: 1.75, marginBottom: '18px' }}>
          {renderWithShortcodes(v) ?? children}
        </p>
      ),
      blockquote: ({ children, value: v }: any) => (
        <blockquote style={{ borderLeft: '3px solid #16a34a', paddingLeft: '18px', margin: '24px 0', color: '#6b7280', fontStyle: 'italic' }}>
          {renderWithShortcodes(v) ?? children}
        </blockquote>
      ),
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
      bullet: ({ children, value: v }: any) => (
        <li style={{ fontSize: '15px', color: '#374151', lineHeight: 1.65 }}>
          {renderWithShortcodes(v) ?? children}
        </li>
      ),
      number: ({ children, value: v }: any) => (
        <li style={{ fontSize: '15px', color: '#374151', lineHeight: 1.65 }}>
          {renderWithShortcodes(v) ?? children}
        </li>
      ),
    },
    types: {
      calloutBlock: ({ value }: any) => <CalloutBlock value={value} />,
      faqBlock: ({ value }: any) => <FaqBlock value={value} />,
      prosConsBlock: ({ value }: any) => <ProsConsBlock value={value} />,
      tableBlock: ({ value }: any) => <TableBlock value={value} />,
      latestPostsBlock: ({ value: blockValue }: any) =>
        posts ? <LatestPostsBlock value={blockValue} posts={posts} /> : null,
      // Shortcodes (inserted via the editor UI)
      elprisInline: ({ value }: any) => (
        <ElPrisInline provider={value.provider} area={value.area ?? 'DK1'} />
      ),
      elselskabShortcode: ({ value }: any) => (
        <ElselskabShortcode ctaSlug={value.ctaSlug} area={value.area ?? 'DK1'} />
      ),
      providerPriceBlock: ({ value }: any) => (
        <ProviderPriceBlock value={value} />
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
