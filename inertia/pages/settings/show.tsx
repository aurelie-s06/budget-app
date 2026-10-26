import { Head, useForm } from '@inertiajs/react'
import { Download } from 'lucide-react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'

type Props = {
  profile: { fullName: string | null; email: string }
  stats: {
    memberSince: string
    accounts: number
    categories: number
    transactions: number
    // Date de la plus ancienne opération
    firstDate: string | null
  }
}

const longDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export default function SettingsShow({ profile, stats }: Props) {
  const profileForm = useForm({ fullName: profile.fullName ?? '', email: profile.email })
  const passwordForm = useForm({ currentPassword: '', password: '', passwordConfirmation: '' })
  const deleteForm = useForm({ currentPassword: '' })

  function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    profileForm.put('/settings/profile', { preserveScroll: true })
  }

  function savePassword(e: React.FormEvent) {
    e.preventDefault()
    passwordForm.put('/settings/password', {
      preserveScroll: true,
      onSuccess: () => passwordForm.reset(),
      onError: () => passwordForm.reset('password', 'passwordConfirmation'),
    })
  }

  function deleteAccount(e: React.FormEvent) {
    e.preventDefault()
    if (
      !confirm(
        'Supprimer définitivement ton compte ? Tous tes comptes, opérations et catégories seront effacés. Cette action est irréversible.'
      )
    )
      return
    deleteForm.delete('/settings', { onError: () => deleteForm.reset() })
  }

  return (
    <>
      <Head title="Mon profil" />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <h1 className="page__title">Mon profil</h1>
              <p className="page__description">Membre depuis le {longDate(stats.memberSince)}.</p>
            </div>
          </header>

          <div className="b-settings">
            {/* Profil */}
            <form className="panel" onSubmit={saveProfile}>
              <div className="b-settings__head">
                <h2 className="section__title">Informations</h2>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="s-name">
                  Nom
                </label>
                <input
                  id="s-name"
                  className="field__input"
                  autoComplete="name"
                  value={profileForm.data.fullName}
                  onChange={(e) => profileForm.setData('fullName', e.target.value)}
                />
                {profileForm.errors.fullName && (
                  <p className="field__error">{profileForm.errors.fullName}</p>
                )}
              </div>
              <div className="field">
                <label className="field__label" htmlFor="s-email">
                  Adresse email
                </label>
                <input
                  id="s-email"
                  type="email"
                  className="field__input"
                  autoComplete="email"
                  value={profileForm.data.email}
                  onChange={(e) => profileForm.setData('email', e.target.value)}
                />
                {profileForm.errors.email && (
                  <p className="field__error">{profileForm.errors.email}</p>
                )}
              </div>
              <div className="b-row">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={profileForm.processing || !profileForm.isDirty}
                >
                  Enregistrer
                </button>
              </div>
            </form>

            {/* Mot de passe */}
            <form className="panel" onSubmit={savePassword}>
              <div className="b-settings__head">
                <h2 className="section__title">Mot de passe</h2>
                <p className="section__description">Entre 8 et 32 caractères.</p>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="s-current">
                  Mot de passe actuel
                </label>
                <input
                  id="s-current"
                  type="password"
                  className="field__input"
                  autoComplete="current-password"
                  value={passwordForm.data.currentPassword}
                  onChange={(e) => passwordForm.setData('currentPassword', e.target.value)}
                />
                {passwordForm.errors.currentPassword && (
                  <p className="field__error">{passwordForm.errors.currentPassword}</p>
                )}
              </div>
              <div className="b-row">
                <div className="field">
                  <label className="field__label" htmlFor="s-password">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="s-password"
                    type="password"
                    className="field__input"
                    autoComplete="new-password"
                    value={passwordForm.data.password}
                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="s-confirmation">
                    Confirmation
                  </label>
                  <input
                    id="s-confirmation"
                    type="password"
                    className="field__input"
                    autoComplete="new-password"
                    value={passwordForm.data.passwordConfirmation}
                    onChange={(e) => passwordForm.setData('passwordConfirmation', e.target.value)}
                  />
                </div>
              </div>
              {passwordForm.errors.password && (
                <p className="field__error">{passwordForm.errors.password}</p>
              )}
              {passwordForm.errors.passwordConfirmation && (
                <p className="field__error">{passwordForm.errors.passwordConfirmation}</p>
              )}
              <div className="b-row">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={passwordForm.processing}
                >
                  Changer le mot de passe
                </button>
              </div>
            </form>

            {/* Données */}
            <section className="panel">
              <div className="b-settings__head">
                <h2 className="section__title">Mes données</h2>
                <p className="section__description">
                  {stats.firstDate
                    ? `Opérations suivies depuis le ${longDate(stats.firstDate)}.`
                    : 'Aucune opération pour l’instant.'}
                </p>
              </div>
              <dl className="b-counts">
                <div>
                  <dt>Opérations</dt>
                  <dd>{stats.transactions}</dd>
                </div>
                <div>
                  <dt>Comptes</dt>
                  <dd>{stats.accounts}</dd>
                </div>
                <div>
                  <dt>Catégories</dt>
                  <dd>{stats.categories}</dd>
                </div>
              </dl>
              <div className="b-row">
                {/* Lien classique (pas Inertia) : le navigateur télécharge le fichier */}
                <a href="/settings/export" className="btn btn--secondary" download>
                  <Download size={16} aria-hidden="true" />
                  Exporter mes opérations (CSV)
                </a>
              </div>
            </section>

            {/* Suppression */}
            <form className="panel b-danger" onSubmit={deleteAccount}>
              <div className="b-settings__head">
                <h2 className="section__title">Supprimer mon compte</h2>
                <p className="section__description">
                  Efface définitivement ton compte et toutes tes données. Pense à exporter tes
                  opérations avant.
                </p>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="s-delete">
                  Mot de passe
                </label>
                <input
                  id="s-delete"
                  type="password"
                  className="field__input"
                  autoComplete="current-password"
                  value={deleteForm.data.currentPassword}
                  onChange={(e) => deleteForm.setData('currentPassword', e.target.value)}
                />
                {deleteForm.errors.currentPassword && (
                  <p className="field__error">{deleteForm.errors.currentPassword}</p>
                )}
              </div>
              <div className="b-row">
                <button
                  type="submit"
                  className="btn btn--danger"
                  disabled={deleteForm.processing || deleteForm.data.currentPassword === ''}
                >
                  Supprimer mon compte
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
