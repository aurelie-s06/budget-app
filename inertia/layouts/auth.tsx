import { type ReactNode } from 'react'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'

const features = [
  'Suivre le solde de chacun de tes comptes',
  'Fixer un budget mensuel par catégorie',
  'Visualiser où part ton argent chaque mois',
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="auth">
        <div className="auth__form-col">
          <span className="b-brand b-brand--lg">Mon Budget</span>
          <div className="auth__form-wrap">{children}</div>
          <div style={{ height: 20 }} />
        </div>

        <aside className="auth__aside">
          <div className="auth__aside-top">
            <ThemeToggle />
          </div>

          <p className="auth__quote">
            Tous tes comptes, tes dépenses et ton budget au même endroit.
          </p>

          <div>
            <div className="pitch__t">Ce que tu peux faire</div>
            <ul className="b-features">
              {features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="pitch__p" style={{ marginTop: 14 }}>
              Tes données restent privées : chaque utilisateur ne voit que ses propres comptes et
              opérations.
            </p>
          </div>
        </aside>
      </div>
      <FlashToasts />
    </>
  )
}
