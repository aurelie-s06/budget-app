import { Link, router } from '@inertiajs/react'

const links = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/transactions', label: 'Opérations' },
  { href: '/accounts', label: 'Comptes' },
  { href: '/categories', label: 'Catégories' },
]

export default function MainNav() {
  return (
    <nav
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid #ddd',
      }}
    >
      {links.map((l) => (
        <Link key={l.href} href={l.href}>
          {l.label}
        </Link>
      ))}
      <button style={{ marginLeft: 'auto' }} onClick={() => router.post('/logout')}>
        Déconnexion
      </button>
    </nav>
  )
}
