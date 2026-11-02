import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { type ReactNode } from 'react'
import Footer from '~/components/footer'
import Logo from '~/components/logo'
import SkipLinks from '~/components/skip_links'
import { links } from '~/components/main_nav'

/**
 * Page d'erreur : explique le problème et garde le menu principal pour repartir.
 */
export default function ErrorPage({
  code,
  title,
  lead,
  children,
}: {
  code: number
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <div className="b-landing">
      <Head title={title} />
      <SkipLinks />
      <header className="b-landing__header">
        <Logo />
        <nav id="navigation" tabIndex={-1} aria-label="Navigation principale">
          <ul className="b-error-nav">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="b-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="contenu" tabIndex={-1} className="home">
        <article className="prose-card">
          <p className="pc-status mono tag">Erreur {code}</p>
          <h1 className="pc-lead">
            <span>{title}.</span>
            <em>{lead}</em>
          </h1>
          <p className="pc-para">{children}</p>
          <a href="/" className="btn btn--primary pc-action">
            Retour à l’accueil
          </a>
        </article>
      </main>
      <Footer />
    </div>
  )
}
