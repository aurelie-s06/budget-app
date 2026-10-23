import { Link } from '@inertiajs/react'

export type Budget = {
  id: number
  name: string
  color: string | null
  spent: number
  budget: number | null
  remaining: number | null
  percent: number | null
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function BudgetList({ budgets }: { budgets: Budget[] }) {
  if (budgets.length === 0) {
    return (
      <p className="b-empty">
        Aucun budget défini.{' '}
        <Link href="/categories" className="il">
          Ajouter un budget
        </Link>
      </p>
    )
  }

  return (
    <ul className="b-list">
      {budgets.map((b) => {
        const over = b.remaining !== null && b.remaining < 0
        return (
          <li key={b.id} className="b-item">
            <div className="b-item__main">
              <div className="b-item__head">
                <span className="b-item__title">
                  <span className="b-dot" style={{ background: b.color ?? 'var(--muted)' }} />
                  {b.name}
                </span>
                <span className={`b-amount ${over ? 'b-amount--out' : ''}`}>
                  {euros(b.spent)}
                  {b.budget !== null && <span className="b-item__meta"> / {euros(b.budget)}</span>}
                </span>
              </div>
              {b.budget !== null && (
                <div className="b-bar">
                  <div
                    className="b-bar__fill"
                    style={{
                      width: `${Math.min(b.percent ?? 0, 100)}%`,
                      background: over ? 'var(--out)' : (b.color ?? 'var(--ink)'),
                    }}
                  />
                </div>
              )}
              {over && (
                <div className="b-item__meta b-amount--out">Dépassé de {euros(-b.remaining!)}</div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
