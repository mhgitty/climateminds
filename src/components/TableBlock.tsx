interface TableBlockValue {
  title?: string
  headers?: string[]
  rows?: Array<{ cells?: string[] }>
}

export function TableBlock({ value }: { value: TableBlockValue }) {
  const { title, headers, rows } = value
  const hasHeaders = (headers?.length ?? 0) > 0

  return (
    <div style={{ margin: '28px 0' }}>
      {title && (
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '10px',
        }}>
          {title}
        </div>
      )}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px', color: '#374151' }}>
          {hasHeaders && (
            <thead>
              <tr>
                {(headers ?? []).map((h, i) => (
                  <th key={i} style={{
                    background: '#f9fafb',
                    borderBottom: '2px solid #e5e7eb',
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    color: '#111827',
                    whiteSpace: 'nowrap',
                    fontSize: '13.5px',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {(rows ?? []).map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f9fafb' }}>
                {(row.cells ?? []).map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 16px',
                    borderBottom: ri < (rows?.length ?? 0) - 1 ? '1px solid #f3f4f6' : 'none',
                    verticalAlign: 'top',
                    lineHeight: 1.6,
                  }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
