/**
 * Renders a string that may contain elpris shortcodes, e.g.:
 *   [elpris provider="altid" area="DK1"]
 *   [elpris_month provider="altid" area="DK1"]
 *
 * When `resolvePrice` is provided (server-side context), prices are rendered
 * as static HTML — visible to Google immediately. Falls back to the client-side
 * ElPrisInline component when no server data is available (e.g. in TableBlock
 * that hasn't received pre-fetched data).
 */

import { Fragment } from 'react'
import { ElPrisInline } from './ElPrisInline'

const SHORTCODE_RE = /\[(elpris(?:_month)?)\s+provider="([^"]+)"\s+area="([^"]+)"\]/g

interface Props {
  text: string
  resolvePrice?: (provider: string, area: string, format: 'kwh' | 'monthly') => string | null
}

export function ShortcodeText({ text, resolvePrice }: Props) {
  if (!text) return null
  if (!text.includes('[elpris')) return <>{text}</>

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  SHORTCODE_RE.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = SHORTCODE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const [, type, provider, area] = match
    const format: 'kwh' | 'monthly' = type === 'elpris_month' ? 'monthly' : 'kwh'

    // Server-side: static span — Google can read this
    const resolved = resolvePrice?.(provider, area, format)
    if (resolved) {
      parts.push(
        <span key={match.index} style={{ fontWeight: 600, color: '#16a34a' }}>
          {resolved}
        </span>
      )
    } else {
      // Client-side fallback (used when no elData available)
      parts.push(
        <ElPrisInline key={match.index} provider={provider} area={area as 'DK1' | 'DK2'} format={format} />
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>{part}</Fragment>
      ))}
    </>
  )
}
