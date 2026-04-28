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
import { getElPriserData } from '@/lib/elpriser'

type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  readingTime?: number
  category?: { name: string; emoji?: string; slug: { current: string } }
}

type ResolvePrice = (provider: string, area: string, format: 'kwh' | 'monthly') => string | null

// ─── Server-side price resolution ────────────────────────────────────────────

function bodyHasShortcodes(body: any[]): boolean {
  const re = /\[elpris/
  return body.some((block) => {
    if (block._type === 'block') {
      return (block.children ?? []).some(
        (c: any) => c._type === 'span' && re.test(c.text ?? '')
      )
    }
    if (block._type === 'tableBlock') {
      const cells = [
        ...(block.headers ?? []),
        ...(block.rows ?? []).flatMap((r: any) => r.cells ?? []),
      ]
      return cells.some((c: string) => re.test(c))
    }
    return false
  })
}

function computePrice(
  provider: string,
  area: string,
  format: 'kwh' | 'monthly',
  elData: any
): string | null {
  const p = elData?.providers?.find((x: any) => x.ctaSlug === provider)
  if (!p) return null
  const rawPrice = area === 'DK2' ? elData.rawDk2 : elData.rawDk1
  const common = area === 'DK2' ? elData.commonDk2 : elData.commonDk1
  const annualKwh = 4000
  const aboPerKwh = (p.aboMonthly * 12) / annualKwh
  const total =
    rawPrice + p.kwhTillaeg + aboPerKwh + common.netselskab + common.energinet + common.staten
  if (format === 'monthly') {
    return `${Math.round((total * annualKwh) / 12).toLocaleString('da-DK')} kr./md.`
  }
  return (
    total.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
    ' kr./kWh'
  )
}

// ─── Shortcode helpers ────────────────────────────────────────────────────────

function renderSpan(child: any, markDefs: any[], resolvePrice: ResolvePrice): ReactNode {
  const text: string = child.text ?? ''
  let content: ReactNode = text.includes('[elpris') ? (
    <ShortcodeText text={text} resolvePrice={resolvePrice} />
  ) : (
    text
  )

  for (const mark of child.marks ?? []) {
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

function renderWithShortcodes(v: any, resolvePrice: ResolvePrice): ReactNode | null {
  const hasShortcode = (v?.children ?? []).some(
    (c: any) => c._type === 'span' && c.text?.includes('[elpris')
  )
  if (!hasShortcode) return null
  const markDefs = v?.markDefs ?? []
  return (v.children ?? []).map((child: any, i: number) => (
    <Fragment key={child._key ?? i}>
      {child._type === 'span' ? renderSpan(child, markDefs, resolvePrice) : null}
    </Fragment>
  ))
}

// ─── Component ────────────────────────────────────────────────────────────────

export async function PortableTextRenderer({ value, posts }: { value: any[]; posts?: Post[] }) {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''

  // Fetch price data server-side so shortcodes render as real text in HTML
  let elData: any = null
  if (bodyHasShortcodes(value)) {
    elData = await getElPriserData().catch(() => null)
  }

  const resolvePrice: ResolvePrice = (provider, area, format) => {
    if (!elData) return null
    return computePrice(provider, area, format, elData)
  }

  const components = {
    block: {
      h2: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return (
          <h2 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', margin: '36px 0 14px', scrollMarginTop: '72px' }}>
            {renderWithShortcodes(v, resolvePrice) ?? children}
          </h2>
        )
      },
      h3: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return (
          <h3 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: '28px 0 10px', scrollMarginTop: '72px' }}>
            {renderWithShortcodes(v, resolvePrice) ?? children}
          </h3>
        )
      },
      h4: ({ children, value: v }: any) => {
        const text = v?.children?.map((c: any) => c.text).join('') || ''
        return (
          <h4 id={headingId(text)} style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: '#111827', margin: '20px 0 8px', scrollMarginTop: '72px' }}>
            {renderWithShortcodes(v, resolvePrice) ?? children}
          </h4>
        )
      },
      normal: ({ children, value: v }: any) => (
        <p style={{ fontSize: '15.5px', color: '#374151', lineHeight: 1.75, marginBottom: '18px' }}>
          {renderWithShortcodes(v, resolvePrice) ?? children}
        </p>
      ),
      blockquote: ({ children, value: v }: any) => (
        <blockquote style={{ borderLeft: '3px solid #16a34a', paddingLeft: '18px', margin: '24px 0', color: '#6b7280', fontStyle: 'italic' }}>
          {renderWithShortcodes(v, resolvePrice) ?? children}
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
          {renderWithShortcodes(v, resolvePrice) ?? children}
        </li>
      ),
      number: ({ children, value: v }: any) => (
        <li style={{ fontSize: '15px', color: '#374151', lineHeight: 1.65 }}>
          {renderWithShortcodes(v, resolvePrice) ?? children}
        </li>
      ),
    },
    types: {
      calloutBlock: ({ value }: any) => <CalloutBlock value={value} />,
      faqBlock: ({ value }: any) => <FaqBlock value={value} />,
      prosConsBlock: ({ value }: any) => <ProsConsBlock value={value} />,
      tableBlock: ({ value }: any) => <TableBlock value={value} resolvePrice={resolvePrice} />,
      latestPostsBlock: ({ value: blockValue }: any) =>
        posts ? <LatestPostsBlock value={blockValue} posts={posts} /> : null,
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
