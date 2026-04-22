import Link from 'next/link'

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-icon">⚡</span>
          <span className="navbar-logo-text">Climateminds</span>
        </Link>

        <nav className="navbar-nav">
          <Link href="/" className="nav-link">Sammenlign</Link>
          <Link href="/blog" className="nav-link">Guides</Link>
          <Link href="/elselskaber" className="nav-link nav-link-cta">Se alle selskaber</Link>
        </nav>
      </div>
    </header>
  )
}
