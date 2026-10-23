export default function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`b-footer ${compact ? 'b-footer--compact' : ''}`}>
      Mon Budget · Projet BUT MMI · Université Gustave Eiffel
    </footer>
  )
}
