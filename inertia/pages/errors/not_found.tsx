import Footer from '~/components/footer'

export default function NotFound() {
  return (
    <div className="b-landing">
      <main className="home">
        <article className="prose-card">
          <div className="pc-top">
            <span className="pc-status mono tag" style={{ color: 'var(--subtle)' }}>
              <span className="dot" /> 404
            </span>
          </div>
          <div className="pc-lead">
            <span>Page introuvable.</span>
            <em>Cette adresse ne mène nulle part.</em>
          </div>
          <p className="pc-para">
            La page que tu cherches n&apos;existe pas ou a été déplacée. Vérifie l&apos;adresse ou
            reviens à l&apos;accueil.
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
