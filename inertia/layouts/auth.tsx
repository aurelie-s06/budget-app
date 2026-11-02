import { type ReactNode } from 'react'
import Logo from '~/components/logo'
import Footer from '~/components/footer'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'
import SkipLinks from '~/components/skip_links'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLinks navigation={false} />
      <div className="auth">
        <div className="auth__form-col">
          <header className="auth__form-top">
            <Logo />
            <span className="auth__toggle-mobile">
              <ThemeToggle />
            </span>
          </header>
          <main id="contenu" tabIndex={-1} className="auth__form-wrap">
            {children}
          </main>
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
