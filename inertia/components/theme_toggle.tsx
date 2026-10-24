import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { usePage } from '@inertiajs/react'

const COOKIE = 'app_theme'
const ONE_YEAR = 60 * 60 * 24 * 365

export default function ThemeToggle() {
  const page = usePage()
  const [theme, setTheme] = useState<'light' | 'dark'>(page.props.preferences?.theme ?? 'light')

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    // Barre de titre de l'app installée, assortie au thème
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#111114' : '#ffffff')
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`
  }

  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="iconbtn"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <Sun size={16} className={`themetoggle__icon ${isDark ? 'themetoggle__icon--on' : ''}`} />
      <Moon size={16} className={`themetoggle__icon ${isDark ? '' : 'themetoggle__icon--on'}`} />
    </button>
  )
}
