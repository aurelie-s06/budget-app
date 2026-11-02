import { router, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  ArrowLeftRight,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  LogOut,
  Tags,
  Wallet,
} from 'lucide-react'
import ThemeToggle from '~/components/theme_toggle'
import Logo from '~/components/logo'
import FlashToasts from '~/components/flash_toasts'
import SkipLinks from '~/components/skip_links'

export const links = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/months', label: 'Mois', icon: CalendarDays },
  { href: '/years', label: 'Année', icon: CalendarRange },
  { href: '/transactions', label: 'Opérations', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Comptes', icon: Wallet },
  { href: '/categories', label: 'Catégories', icon: Tags },
]

// Les sous-pages d'Opérations gardent « Opérations » actif dans le menu
const SUB_PAGES: Record<string, string[]> = {
  '/transactions': ['/transactions', '/recurring', '/triage', '/imports'],
}
const isActive = (url: string, href: string) =>
  (SUB_PAGES[href] ?? [href]).some((path) => url.startsWith(path))

/**
 * Une seule barre, collée en haut : logo, liens en pastilles, thème et déconnexion.
 */
export default function MainNav() {
  const { url, props } = usePage()
  const user = props.user

  return (
    <>
      <SkipLinks />
      <header className="b-topbar">
        <div className="b-topbar__inner b-container">
          <Logo href="/dashboard" />

          <nav
            id="navigation"
            tabIndex={-1}
            className="b-topnav"
            aria-label="Navigation principale"
          >
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="b-topnav__item"
                aria-current={isActive(url, href) ? 'page' : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="b-topbar__actions">
            <ThemeToggle />
            <Link
              href="/settings"
              className="iconbtn b-avatar"
              aria-current={url.startsWith('/settings') ? 'page' : undefined}
              title="Mon profil"
            >
              <span aria-hidden="true">{user?.initials}</span>
              <span className="sr-only">Mon profil</span>
            </Link>
            <button
              type="button"
              className="iconbtn"
              onClick={() => router.post('/logout')}
              aria-label="Déconnexion"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        {/* Messages de confirmation (« Profil enregistré »…) */}
        <FlashToasts />
      </header>
    </>
  )
}
