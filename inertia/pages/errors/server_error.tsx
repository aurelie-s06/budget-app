import Footer from '~/components/footer'

export default function ServerError() {
  return (
    <div className="b-landing">
      <main className="home">
        <article className="prose-card">
          <div className="pc-top">
            <span className="pc-status mono tag" style={{ color: 'var(--out)' }}>
              <span className="dot" /> 500
            </span>
          </div>
          <div className="pc-lead">
            <span>Une erreur est survenue.</span>
            <em>Le serveur n&apos;a pas pu traiter la demande.</em>
          </div>
          <p className="pc-para">
            Réessaie dans un instant. Si le problème persiste, consulte les logs du serveur.
          </p>
          <a href="/" className="btn btn--primary pc-action">
            Retour à l&apos;accueil
          </a>
        </article>
      </main>
      <Footer />
    </div>
  )
}
