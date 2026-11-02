import AuthLayout from '~/layouts/auth'
import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import FieldError, { fieldProps } from '~/components/field_error'
import PasswordInput from '~/components/password_input'

export default function Signup() {
  return (
    <>
      <Head title="Inscription" />
      <h1 className="auth__title">Crée ton compte</h1>
      <p className="auth__sub">Quelques secondes suffisent pour commencer à suivre ton budget.</p>

      <Form route="new_account.store">
        {({ errors, processing }) => (
          <div className="auth__form">
            <p className="field__hint">Les champs marqués d’un astérisque (*) sont obligatoires.</p>
            <div className="field">
              <label className="field__label" htmlFor="fullName">
                Nom complet <span className="b-item__meta">(facultatif, 100 caractères max.)</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="field__input"
                autoComplete="name"
                placeholder="Camille Martin"
                maxLength={100}
                {...fieldProps('fullName-error', errors.fullName)}
              />
              <FieldError id="fullName-error" message={errors.fullName} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="email">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="field__input"
                autoComplete="email"
                placeholder="prenom@exemple.fr"
                required
                {...fieldProps('email-error', errors.email)}
              />
              <FieldError id="email-error" message={errors.email} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">
                Mot de passe
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                required
                showStrength
                hint="Entre 8 et 128 caractères. Une longue phrase est plus solide qu’un mot compliqué."
                error={errors.password}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="passwordConfirmation">
                Confirmer le mot de passe
              </label>
              <PasswordInput
                id="passwordConfirmation"
                name="passwordConfirmation"
                autoComplete="new-password"
                required
                error={errors.passwordConfirmation}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={processing}
              style={{ marginTop: 4 }}
            >
              {processing ? 'Création…' : 'Créer mon compte'}
            </button>
          </div>
        )}
      </Form>

      <p className="auth__foot">
        En créant un compte, tes données sont traitées comme décrit dans la page{' '}
        <Link href="/confidentialite" className="il">
          Confidentialité
        </Link>
        .
      </p>
      <p className="auth__foot">
        Déjà un compte ?{' '}
        <Link route="session.create" className="il">
          Se connecter
        </Link>
      </p>
    </>
  )
}

Signup.layout = [AuthLayout]
