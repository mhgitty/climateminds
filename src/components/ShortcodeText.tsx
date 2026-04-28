'use client'

/**
 * Renders a string that may contain elpris shortcodes, e.g.:
 *   [elpris provider="altid" area="DK1"]
 *   [elpris_month provider="altid" area="DK1"]
 *
 * Works anywhere you have a plain text string — table cells, intro fields, etc.
 */

import { Fragment } from 'react'
import { ElPrisInline } from './ElPrisInline'

// Matches both [elpris ...] and [elpris_month ...] with any attribute order
const SHORTCODE_RE = /\[(elpris(?:_month)?)\s+provider="([^"]+)"\s+area="([^"]+)"\]/g

export function ShortcodeText({ text }: { text: string }) {
  if (!text) return null
  if (!text.includes('[elpris')) return <>{text}</>

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex state (important when re-using the same regex across renders)
  SHORTCODE_RE.lastIndex = 0

  while ((match = SHORTCODE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const [, type, provider, area] = match
    parts.push(
      <ElPrisInline
        key={match.index}
        provider={provider}
        area={area as 'DK1' | 'DK2'}
        format={type === 'elpris_month' ? 'monthly' : 'kwh'}
      />
    )

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
