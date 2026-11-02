import ErrorPage from '~/components/error_page'

export default function NotFound() {
  return (
    <ErrorPage code={404} title="Page introuvable" lead="Cette adresse ne mène nulle part.">
      La page que tu cherches n’existe pas ou a été déplacée. Vérifie l’adresse, ou utilise le menu
      pour repartir.
    </ErrorPage>
  )
}
