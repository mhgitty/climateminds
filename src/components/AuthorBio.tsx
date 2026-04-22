interface AuthorBioProps {
  author: {
    name: string
    bio?: string
    imageUrl?: string
    linkedin?: string
    x?: string
    facebook?: string
  }
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '34px', height: '34px',
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        color: '#6b7280',
        textDecoration: 'none',
        transition: 'background 0.2s',
      }}
    >
      {icon}
    </a>
  )
}

export function AuthorBio({ author }: AuthorBioProps) {
  const hasSocials = author.linkedin || author.x || author.facebook

  return (
    <div style={{
      marginTop: '56px',
      padding: '28px',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      display: 'flex',
      gap: '24px',
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      {author.imageUrl ? (
        <img
          src={author.imageUrl}
          alt={author.name}
          style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
          background: '#f0fdf4',
          border: '2px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', fontWeight: 800, color: '#16a34a',
          fontFamily: 'var(--font-display)',
        }}>
          {author.name.charAt(0)}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Skrevet af
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
          {author.name}
        </div>

        {author.bio && (
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: '0 0 16px' }}>
            {author.bio}
          </p>
        )}

        {hasSocials && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {author.linkedin && (
              <SocialLink href={author.linkedin} label="LinkedIn" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              } />
            )}
            {author.x && (
              <SocialLink href={author.x} label="X / Twitter" icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              } />
            )}
            {author.facebook && (
              <SocialLink href={author.facebook} label="Facebook" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              } />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
