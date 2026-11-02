import { Link } from '@adonisjs/inertia/react'

export default function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`b-footer ${compact ? 'b-footer--compact' : ''}`}>
      Mon Budget · Projet <abbr title="Bachelor universitaire de technologie">BUT</abbr>{' '}
      <abbr title="Métiers du Multimédia et de l’Internet">MMI</abbr> · Université Gustave Eiffel ·
      © Aurélie Sirot ·{' '}
      <Link href="/confidentialite" className="il">
        Confidentialité et informations légales
      </Link>
    </footer>
  )
}
