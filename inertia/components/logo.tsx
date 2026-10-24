import { Link } from '@adonisjs/inertia/react'

/**
 * Logo de Mon Budget : un portefeuille avec une carte qui dépasse et un
 * fermoir dans la couleur des revenus.
 * Les couleurs suivent le thème clair / sombre.
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" style={{ fill: 'var(--ink)' }} />
      {/* carte */}
      <rect
        x="10"
        y="6.5"
        width="12"
        height="6"
        rx="1.8"
        transform="rotate(-10 16 9.5)"
        style={{ fill: 'var(--in-mark)' }}
      />
      {/* portefeuille et rabat */}
      <rect x="6.5" y="10" width="19" height="14" rx="3.5" style={{ fill: 'var(--paper)' }} />
      <rect x="17.5" y="14.25" width="8" height="5.5" rx="2.75" style={{ fill: 'var(--ink)' }} />
      {/* fermoir */}
      <circle cx="20.5" cy="17" r="1.4" style={{ fill: 'var(--in-mark)' }} />
    </svg>
  )
}

export default function Logo({ href = '/', size = 28 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="b-logo">
      <LogoMark size={size} />
      <span>Mon Budget</span>
    </Link>
  )
}
