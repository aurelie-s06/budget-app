import ErrorPage from '~/components/error_page'

export default function Forbidden() {
  return (
    <ErrorPage code={403} title="Accès refusé" lead="Cette page ne t’est pas accessible.">
      Tu n’as pas l’autorisation de voir cette page. Vérifie le compte que tu utilises, ou utilise
      le menu pour repartir.
    </ErrorPage>
  )
}
