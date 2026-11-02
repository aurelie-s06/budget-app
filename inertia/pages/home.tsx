import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import Logo from '~/components/logo'
import Footer from '~/components/footer'
import ThemeToggle from '~/components/theme_toggle'
import FlashToasts from '~/components/flash_toasts'
import SkipLinks from '~/components/skip_links'

const features = ['Tous tes comptes', 'Budgets par catégorie', 'Graphique des dépenses']

export default function Home() {
  const { user } = usePage().props

  return (
    <div className="b-landing">
      <Head title="Gère ton budget personnel" />
      <SkipLinks navigation={false} />
      <header className="b-landing__header">
        <Logo />
        <div className="header__right">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard" className="btn btn--primary">
              Tableau de bord
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn--ghost">
                Se connecter
              </Link>
              <Link href="/signup" className="btn btn--primary">
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </header>

      <main id="contenu" tabIndex={-1} className="b-hero">
        <span className="tag">Gestionnaire de budget personnel</span>
        <h1 className="b-hero__title">Reprends le contrôle de ton budget, simplement.</h1>
        <p className="b-hero__text">
          Mon Budget centralise tes comptes, tes revenus et tes dépenses pour t’aider à comprendre
          où part ton argent et à respecter tes objectifs chaque mois.
        </p>
        <div className="b-hero__actions">
          {user ? (
            <Link href="/dashboard" className="btn btn--primary">
              Voir mon tableau de bord
            </Link>
          ) : (
            <>
              <Link href="/signup" className="btn btn--primary">
                Commencer gratuitement
              </Link>
              <Link href="/login" className="btn btn--secondary">
                J’ai déjà un compte
              </Link>
            </>
          )}
        </div>
        <ul className="b-pills">
          {features.map((f) => (
            <li key={f} className="b-pill">
              {f}
            </li>
          ))}
        </ul>
      </main>

      <Footer />
      {/* Message après la suppression du compte */}
      <FlashToasts />
    </div>
  )
}
