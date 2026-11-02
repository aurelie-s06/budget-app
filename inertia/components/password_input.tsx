import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import FieldError from '~/components/field_error'

type Props = {
  id: string
  name?: string
  autoComplete: string
  required?: boolean
  error?: string
  // Texte d'aide relié au champ
  hint?: string
  // Création d'un mot de passe : indique sa solidité
  showStrength?: boolean
  // Absents dans un formulaire non contrôlé
  value?: string
  onChange?: (value: string) => void
}

const LEVELS = ['Trop court', 'Faible', 'Correct', 'Solide'] as const

// La longueur compte plus que la variété des caractères
function strength(password: string) {
  if (password.length < 8) return 0
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(password)).length
  if (password.length >= 16 || (password.length >= 12 && kinds >= 3)) return 3
  return password.length >= 12 || kinds >= 3 ? 2 : 1
}

/**
 * Champ de mot de passe avec un bouton pour afficher les caractères saisis.
 */
export default function PasswordInput({
  id,
  name,
  autoComplete,
  required,
  error,
  hint,
  showStrength,
  value,
  onChange,
}: Props) {
  const [visible, setVisible] = useState(false)
  const [typed, setTyped] = useState('')
  const current = value ?? typed
  const level = strength(current)

  const describedBy = [
    hint && `${id}-hint`,
    showStrength && current !== '' && `${id}-strength`,
    error && `${id}-error`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      <div className="b-password">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          className="field__input"
          autoComplete={autoComplete}
          // Pas de correction automatique quand le mot de passe est affiché
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required={required}
          maxLength={128}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          value={value}
          onChange={(e) => {
            setTyped(e.target.value)
            onChange?.(e.target.value)
          }}
        />
        <button
          type="button"
          className="b-password__toggle"
          aria-controls={id}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
          {visible ? 'Masquer' : 'Afficher'}
          <span className="sr-only"> le mot de passe</span>
        </button>
      </div>
      {showStrength && current !== '' && (
        <p id={`${id}-strength`} className="b-strength" data-level={level} aria-live="polite">
          <span className="b-strength__bar" aria-hidden="true" />
          Solidité : {LEVELS[level].toLowerCase()}
        </p>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </>
  )
}
