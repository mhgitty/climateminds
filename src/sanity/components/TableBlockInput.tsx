'use client'
import { useCallback, useState } from 'react'
import type { ObjectInputProps } from 'sanity'
import { PatchEvent, set } from 'sanity'
import { Button, Dialog, TextArea, Stack, Text, Box, Card } from '@sanity/ui'

export function TableBlockInput(props: ObjectInputProps) {
  const [open, setOpen] = useState(false)
  const [html, setHtml] = useState('')
  const [error, setError] = useState('')

  const handleImport = useCallback(() => {
    setError('')
    if (!html.trim()) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const table = doc.querySelector('table')
    if (!table) {
      setError('Ingen <table> fundet i den indsatte HTML.')
      return
    }

    // Extract headers — prefer <thead>, fall back to first <tr>
    const headers: string[] = []
    const theadCells = table.querySelectorAll('thead tr:first-child th, thead tr:first-child td')
    if (theadCells.length > 0) {
      theadCells.forEach((cell) => headers.push(cell.textContent?.trim() ?? ''))
    }

    // Extract data rows
    const rowEls = headers.length > 0
      ? table.querySelectorAll('tbody tr')
      : table.querySelectorAll('tr')

    const rows: Array<{ _type: string; _key: string; cells: string[] }> = []
    rowEls.forEach((row, idx) => {
      // If no thead, treat first row as headers
      if (headers.length === 0 && idx === 0) {
        row.querySelectorAll('th, td').forEach((c) => headers.push(c.textContent?.trim() ?? ''))
        return
      }
      const cells: string[] = []
      row.querySelectorAll('td, th').forEach((c) => cells.push(c.textContent?.trim() ?? ''))
      if (cells.some((c) => c !== '')) {
        rows.push({
          _type: 'tableRow',
          _key: Math.random().toString(36).slice(2, 9),
          cells,
        })
      }
    })

    if (headers.length === 0 && rows.length === 0) {
      setError('Tabellen ser ud til at være tom.')
      return
    }

    props.onChange(
      PatchEvent.from([
        set(headers, ['headers']),
        set(rows, ['rows']),
      ])
    )
    setOpen(false)
    setHtml('')
  }, [html, props])

  return (
    <Stack space={3}>
      <Button
        mode="ghost"
        tone="primary"
        fontSize={1}
        padding={3}
        text="📋 Importer fra HTML (ChatGPT / Word)"
        onClick={() => { setOpen(true); setError('') }}
      />

      {props.renderDefault(props)}

      {open && (
        <Dialog
          header="Importer HTML-tabel"
          onClose={() => { setOpen(false); setHtml(''); setError('') }}
          id="html-table-import-dialog"
          width={1}
        >
          <Box padding={4}>
            <Stack space={4}>
              <Text size={1} muted>
                Kopier HTML-koden fra ChatGPT, Word eller en anden kilde og indsæt herunder.
                Overskrifter og rækker udfyldes automatisk.
              </Text>
              <TextArea
                rows={10}
                value={html}
                onChange={(e) => setHtml((e.target as HTMLTextAreaElement).value)}
                placeholder={'<table>\n  <thead>...<\/thead>\n  <tbody>...<\/tbody>\n<\/table>'}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              {error && (
                <Card tone="critical" padding={3} radius={2}>
                  <Text size={1}>{error}</Text>
                </Card>
              )}
              <Button
                text="Konverter & indsæt tabel"
                tone="primary"
                onClick={handleImport}
              />
            </Stack>
          </Box>
        </Dialog>
      )}
    </Stack>
  )
}
