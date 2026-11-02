import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import { DatabaseBackup, Download } from 'lucide-react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'
import FieldError, { fieldProps } from '~/components/field_error'
import PasswordInput from '~/components/password_input'

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
  backups: {
    // « iCloud Drive › Mon Budget › Sauvegardes »
    folder: string
    count: number
    // Date de la plus récente (ISO), null si aucune
    last: string | null
  }
}

const longDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

// « aujourd’hui à 12:05 », « hier à 09:00 », « le 3 octobre à 18:20 »
function when(iso: string) {
  const date = new Date(iso)
  const days = Math.round(
    (new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86_400_000
  )
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (days === 0) return `aujourd’hui à ${time}`
  if (days === 1) return `hier à ${time}`
  return `le ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${time}`
}

export default function SettingsShow({ profile, stats, backups }: Props) {
  const [backingUp, setBackingUp] = useState(false)
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
      <main id="contenu" tabIndex={-1} className="app-main">
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
                <p className="section__description">
                  Les champs marqués d’un astérisque (*) sont obligatoires.
                </p>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="s-name">
                  Nom <span className="b-item__meta">(facultatif, 100 caractères max.)</span>
                </label>
                <input
                  id="s-name"
                  maxLength={100}
                  {...fieldProps('s-name-error', profileForm.errors.fullName)}
                  className="field__input"
                  autoComplete="name"
                  value={profileForm.data.fullName}
                  onChange={(e) => profileForm.setData('fullName', e.target.value)}
                />
                <FieldError id="s-name-error" message={profileForm.errors.fullName} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="s-email">
                  Adresse email
                </label>
                <input
                  id="s-email"
                  required
                  {...fieldProps('s-email-error', profileForm.errors.email)}
                  type="email"
                  className="field__input"
                  autoComplete="email"
                  value={profileForm.data.email}
                  onChange={(e) => profileForm.setData('email', e.target.value)}
                />
                <FieldError id="s-email-error" message={profileForm.errors.email} />
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
                <p className="section__description">
                  Tous les champs sont obligatoires, et marqués d’un astérisque (*).
                </p>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="s-current">
                  Mot de passe actuel
                </label>
                <PasswordInput
                  id="s-current"
                  autoComplete="current-password"
                  required
                  error={passwordForm.errors.currentPassword}
                  value={passwordForm.data.currentPassword}
                  onChange={(value) => passwordForm.setData('currentPassword', value)}
                />
              </div>
              <div className="b-row">
                <div className="field">
                  <label className="field__label" htmlFor="s-password">
                    Nouveau mot de passe
                  </label>
                  <PasswordInput
                    id="s-password"
                    autoComplete="new-password"
                    required
                    showStrength
                    hint="Entre 8 et 128 caractères."
                    error={passwordForm.errors.password}
                    value={passwordForm.data.password}
                    onChange={(value) => passwordForm.setData('password', value)}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="s-confirmation">
                    Confirmation
                  </label>
                  <PasswordInput
                    id="s-confirmation"
                    autoComplete="new-password"
                    required
                    error={passwordForm.errors.passwordConfirmation}
                    value={passwordForm.data.passwordConfirmation}
                    onChange={(value) => passwordForm.setData('passwordConfirmation', value)}
                  />
                </div>
              </div>
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
                  <span>
                    Exporter mes opérations (
                    <abbr title="Valeurs séparées, à ouvrir dans un tableur">CSV</abbr>)
                  </span>
                </a>
              </div>
            </section>

            {/* Sauvegardes */}
            <section className="panel">
              <div className="b-settings__head">
                <h2 className="section__title">Sauvegardes</h2>
                <p className="section__description">
                  Une copie complète de l’app est faite chaque jour, et les 15 dernières sont
                  gardées. Ces copies ne sont pas chiffrées.
                </p>
              </div>
              <dl className="b-counts">
                <div>
                  <dt>Dernière sauvegarde</dt>
                  <dd className="b-counts__text">
                    {backups.last ? when(backups.last) : 'Aucune pour l’instant'}
                  </dd>
                </div>
                <div>
                  <dt>Sauvegardes gardées</dt>
                  <dd>{backups.count}</dd>
                </div>
              </dl>
              <p className="b-form__hint b-settings__folder">Dossier : {backups.folder}</p>
              <div className="b-row">
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={backingUp}
                  onClick={() =>
                    router.post(
                      '/settings/backup',
                      {},
                      {
                        preserveScroll: true,
                        onStart: () => setBackingUp(true),
                        onFinish: () => setBackingUp(false),
                      }
                    )
                  }
                >
                  <DatabaseBackup size={16} aria-hidden="true" />
                  {backingUp ? 'Sauvegarde…' : 'Sauvegarder maintenant'}
                </button>
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
                <PasswordInput
                  id="s-delete"
                  autoComplete="current-password"
                  required
                  error={deleteForm.errors.currentPassword}
                  value={deleteForm.data.currentPassword}
                  onChange={(value) => deleteForm.setData('currentPassword', value)}
                />
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
