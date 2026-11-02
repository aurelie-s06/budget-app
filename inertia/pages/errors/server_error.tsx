import ErrorPage from '~/components/error_page'

export default function ServerError() {
  return (
    <ErrorPage
      code={500}
      title="Une erreur est survenue"
      lead="Le serveur n’a pas pu traiter la demande."
    >
      Tes données n’ont pas été perdues. Réessaie dans un instant ; si le problème continue,
      recharge la page plus tard.
    </ErrorPage>
  )
}
