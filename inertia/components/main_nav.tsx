import { Link, router, usePage } from '@inertiajs/react'
import ThemeToggle from '~/components/theme_toggle'
import Logo from '~/components/logo'

const links = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/months', label: 'Vue mensuelle' },
  { href: '/transactions', label: 'Opérations' },
  { href: '/accounts', label: 'Comptes' },
  { href: '/categories', label: 'Catégories' },
]

export default function MainNav() {
  const { url } = usePage()

  return (
    <>
      <header className="header--bar">
        <div className="header__inner b-container">
          <Logo href="/dashboard" />
          <div className="header__right">
            <ThemeToggle />
            <button className="btn btn--secondary btn--sm" onClick={() => router.post('/logout')}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <nav className="subnav">
        <div className="subnav__inner b-container">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="subnav__item"
              aria-current={url.startsWith(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
