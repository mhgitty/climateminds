import Link from 'next/link'
import Image from 'next/image'

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <Image
            src="/logo.webp"
            alt="Climateminds"
            height={36}
            width={200}
            style={{ height: '36px', width: 'auto', display: 'block' }}
            priority
          />
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
