'use client'
import { type ReactNode } from 'react'

export function WideStudioLayout({ renderDefault, ...props }: { renderDefault: (p: any) => ReactNode; [key: string]: any }) {
  return (
    <div style={{ '--sanity-sidebar-width': '260px' } as React.CSSProperties}>
      {renderDefault(props)}
    </div>
  )
}
