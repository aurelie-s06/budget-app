import './css/app.css'
import { client } from './client'
import { createRoot } from 'react-dom/client'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/react'

const appName = import.meta.env.VITE_APP_NAME || 'Mon Budget'

// Changement de page : le focus va au contenu, sinon le clavier et les lecteurs
// d'écran restent sur un élément qui n'existe plus. Un filtre ou une pagination
// (même adresse, paramètres différents) ne déplace rien.
let currentPath = window.location.pathname
router.on('navigate', () => {
  if (window.location.pathname === currentPath) return
  currentPath = window.location.pathname
  document.getElementById('contenu')?.focus({ preventScroll: true })
})

// Formulaire refusé : le focus va au premier champ en erreur
router.on('error', () => {
  setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50)
})

createInertiaApp({
  title: (title) => (title ? `${title} · ${appName}` : appName),
  resolve: async (name) => {
    const page = await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx')
    )
    return page.default
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <App {...props} />
      </TuyauProvider>
    )
  },
  progress: {
    color: '#4B5563',
  },
})
