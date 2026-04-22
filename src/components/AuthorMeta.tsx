interface AuthorMetaProps {
  author: {
    name: string
    imageUrl?: string
  }
  lastUpdated?: string
  publishedAt?: string
}

export function AuthorMeta({ author, lastUpdated, publishedAt }: AuthorMetaProps) {
  const dateStr = lastUpdated || publishedAt
  const date = dateStr
    ? new Date(dateStr).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 0',
      borderTop: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '36px',
    }}>
      {author.imageUrl ? (
        <img
          src={author.imageUrl}
          alt={author.name}
          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 700, color: '#16a34a', flexShrink: 0,
        }}>
          {author.name.charAt(0)}
        </div>
      )}

      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
          {author.name}
        </div>
        {date && (
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '1px' }}>
            Sidst opdateret: {date}
          </div>
        )}
      </div>
    </div>
  )
}
