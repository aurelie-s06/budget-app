import { Link, router, usePage } from '@inertiajs/react'

const links = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/transactions', label: 'Opérations' },
  { href: '/accounts', label: 'Comptes' },
  { href: '/categories', label: 'Catégories' },
]

export default function MainNav() {
  const { url } = usePage()

  return (
    <>
      <header className="header--bar">
        <div className="header__inner">
          <span className="b-brand">Mon Budget</span>
          <div className="header__right">
            <button className="btn btn--secondary btn--sm" onClick={() => router.post('/logout')}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <nav className="subnav">
        <div className="subnav__inner">
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
