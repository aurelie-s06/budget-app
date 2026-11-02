import AuthLayout from '~/layouts/auth'
import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import FieldError, { fieldProps } from '~/components/field_error'
import PasswordInput from '~/components/password_input'

export default function Login() {
  return (
    <>
      <Head title="Connexion" />
      <h1 className="auth__title">Bon retour</h1>
      <p className="auth__sub">Connecte-toi pour suivre ton budget.</p>

      <Form route="session.store">
        {({ errors, processing }) => (
          <div className="auth__form">
            <p className="field__hint">Les champs marqués d’un astérisque (*) sont obligatoires.</p>
            <div className="field">
              <label className="field__label" htmlFor="email">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="field__input"
                autoComplete="username"
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
                autoComplete="current-password"
                required
                hint="Attention aux majuscules et aux minuscules."
                error={errors.password}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={processing}
              style={{ marginTop: 4 }}
            >
              {processing ? 'Connexion…' : 'Se connecter'}
            </button>
          </div>
        )}
      </Form>

      <p className="auth__foot">Par sécurité, la session se ferme après 2 h sans activité.</p>
      <p className="auth__foot">
        Pas encore de compte ?{' '}
        <Link route="new_account.create" className="il">
          Créer un compte
        </Link>
      </p>
    </>
  )
}

Login.layout = [AuthLayout]
