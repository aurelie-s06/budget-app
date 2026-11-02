/**
 * Message d'erreur d'un champ. `fieldProps` le relie au champ dans le code source :
 * il est restitué par les lecteurs d'écran quand le champ prend le focus.
 */
export default function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="field__error" role="alert">
      {message}
    </p>
  )
}

export function fieldProps(errorId: string, message?: string) {
  return message ? { 'aria-invalid': true, 'aria-describedby': errorId } : {}
}
