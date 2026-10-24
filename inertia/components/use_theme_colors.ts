import { useMemo, useSyncExternalStore } from 'react'

const TOKENS = ['in', 'out', 'card', 'muted', 'line', 'ink'] as const
type Colors = Record<(typeof TOKENS)[number], string>

// Valeurs claires par défaut (rendu serveur, avant lecture du CSS)
const FALLBACK: Colors = {
  in: '#18794e',
  out: '#c0392b',
  card: '#ffffff',
  muted: '#6b6f76',
  line: '#ededee',
  ink: '#0a0a0b',
}

function read(): Colors {
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    TOKENS.map((t) => [t, style.getPropertyValue(`--${t}`).trim() || FALLBACK[t]])
  ) as Colors
}

// Prévient React quand l'attribut data-theme de <html> change
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}
const currentTheme = () => document.documentElement.getAttribute('data-theme') ?? 'light'

/**
 * Chart.js dessine sur un canvas et ne lit pas les variables CSS :
 * on les récupère ici et on les relit quand le thème change.
 */
export default function useThemeColors() {
  // null côté serveur : pas de document, on garde les couleurs par défaut
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null)
  return useMemo(() => (theme === null ? FALLBACK : read()), [theme])
}
