import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import Footer from '~/components/footer'
import Logo from '~/components/logo'
import MainNav from '~/components/main_nav'
import SkipLinks from '~/components/skip_links'

export default function Privacy() {
  const { user } = usePage().props

  return (
    <>
      <Head title="Confidentialité et informations légales" />
      {user ? (
        <MainNav />
      ) : (
        <>
          <SkipLinks navigation={false} />
          <header className="b-landing__header">
            <Logo />
          </header>
        </>
      )}
      <main id="contenu" tabIndex={-1} className="app-main">
        <div className="page b-legal">
          <header className="page__header">
            <div>
              <h1 className="page__title">Confidentialité et informations légales</h1>
              <p className="page__description">
                Ce que Mon Budget enregistre, pourquoi, et comment garder la main sur tes données.
              </p>
            </div>
          </header>

          <section className="panel">
            <h2 className="section__title">Données enregistrées</h2>
            <ul>
              <li>Ton adresse email et, si tu le renseignes, ton nom.</li>
              <li>Ton mot de passe, sous une forme hachée qui ne permet pas de le relire.</li>
              <li>Tes comptes, catégories, opérations, récurrences et objectif d’épargne.</li>
            </ul>
            <p>
              Ces données servent uniquement à faire fonctionner ton budget. Elles ne sont ni
              vendues ni transmises à des tiers, et l’application ne contient ni publicité ni mesure
              d’audience.
            </p>
            <p>
              Un relevé PDF importé est lu puis effacé aussitôt : seules les opérations que tu
              valides sont gardées.
            </p>
          </section>

          <section className="panel">
            <h2 className="section__title">Conservation et sauvegardes</h2>
            <p>
              Les données sont stockées dans une base locale, sur l’ordinateur qui fait tourner
              l’application. Une copie complète est faite chaque jour et les 15 dernières sont
              gardées, dans iCloud Drive quand il est disponible. Ces copies ne sont pas chiffrées
              par l’application et contiennent les données de tous les comptes créés sur cet
              ordinateur.
            </p>
            <p>
              Après la suppression d’un compte, ses données disparaissent de l’application tout de
              suite et des sauvegardes au bout de 15 jours environ.
            </p>
          </section>

          <section className="panel">
            <h2 className="section__title">Cookies</h2>
            <div className="b-table-wrap">
              <table className="b-table">
                <caption className="sr-only">Cookies utilisés par Mon Budget</caption>
                <thead>
                  <tr>
                    <th scope="col">Cookie</th>
                    <th scope="col">Rôle</th>
                    <th scope="col">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Session (adonis-session)</th>
                    <td>Te garder connecté</td>
                    <td>2 h sans activité</td>
                  </tr>
                  <tr>
                    <th scope="row">XSRF-TOKEN</th>
                    <td>Protéger tes formulaires contre les envois frauduleux</td>
                    <td>2 h sans activité</td>
                  </tr>
                  <tr>
                    <th scope="row">app_theme</th>
                    <td>Retenir le thème clair ou sombre</td>
                    <td>1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Tous sont nécessaires ou liés à ton choix de thème ; aucun ne sert au suivi. Sans les
              cookies de session, la connexion est impossible. Sans le cookie de thème, le thème
              clair s’affiche.
            </p>
          </section>

          <section className="panel">
            <h2 className="section__title">Accéder à tes données, les corriger, les supprimer</h2>
            <p>
              Depuis{' '}
              <Link href="/settings" className="il">
                Mon profil
              </Link>
              , tu peux corriger ton nom et ton adresse email, changer ton mot de passe, exporter
              tes opérations et supprimer ton compte. Tes opérations, comptes et catégories se
              modifient directement dans leurs pages.
            </p>
          </section>

          <section className="panel">
            <h2 className="section__title">Édition et droits</h2>
            <p>
              Mon Budget est un projet de BUT Métiers du Multimédia et de l’Internet (Université
              Gustave Eiffel), réalisé et publié par Aurélie Sirot. Le code et les contenus de
              l’application ne peuvent pas être réutilisés sans son accord.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
