import { type ReactNode } from 'react'
import { Link } from '@inertiajs/react'
import Footer from '~/components/footer'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="auth">
        <div className="auth__form-col">
          <div className="auth__form-top">
            <Link href="/" className="b-brand b-brand--lg">
              Mon Budget
            </Link>
            <span className="auth__toggle-mobile">
              <ThemeToggle />
            </span>
          </div>
          <div className="auth__form-wrap">{children}</div>
          <Footer compact />
        </div>

        <aside className="auth__aside">
          <div className="auth__aside-top">
            <ThemeToggle />
          </div>

          <div className="auth__aside-body">
            <span className="tag">Gestionnaire de budget personnel</span>
            <p className="auth__quote">
              Tous tes comptes, tes dépenses et ton budget au même endroit.
            </p>
            <p className="pitch__p">
              Tes données restent privées : chaque utilisateur ne voit que ses propres comptes et
              opérations.
            </p>
          </div>

          <div className="auth__aside-bottom" aria-hidden="true" />
        </aside>
      </div>
      <FlashToasts />
    </>
  )
}
