import { Link } from '@inertiajs/react'
import MainNav from '~/components/main_nav'
import ExpensesChart from '~/components/expenses_chart'

type Budget = {
  id: number
  name: string
  color: string | null
  spent: number
  budget: number | null
  remaining: number | null
  percent: number | null
}
type Latest = {
  id: number
  type: 'income' | 'expense'
  amount: number
  date: string
  description: string
  categoryName: string | null
}
type Props = {
  totalBalance: number
  income: number
  expenses: number
  savings: number
  spendingRate: number | null
  budgets: Budget[]
  latest: Latest[]
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'in' | 'out' }) {
  return (
    <div className="b-stat">
      <div className="b-stat__label">{label}</div>
      <div className={`b-stat__value ${tone ? `b-amount--${tone}` : ''}`}>{value}</div>
    </div>
  )
}

export default function Dashboard(props: Props) {
  const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <>
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <h1 className="page__title">Tableau de bord</h1>
              <p className="page__description">Vue d'ensemble de {month}</p>
            </div>
          </header>

          <section className="b-stats">
            <Stat
              label="Solde total"
              value={euros(props.totalBalance)}
              tone={props.totalBalance < 0 ? 'out' : undefined}
            />
            <Stat label="Revenus du mois" value={euros(props.income)} tone="in" />
            <Stat label="Dépenses du mois" value={euros(props.expenses)} tone="out" />
            <Stat label="Épargne du mois" value={euros(props.savings)} />
            <Stat
              label="Taux de dépenses"
              value={props.spendingRate !== null ? `${props.spendingRate} %` : '—'}
            />
          </section>

          <div className="b-grid-2">
            <section className="panel">
              <h2 className="section__title b-section-title">Répartition des dépenses</h2>
              <ExpensesChart items={props.budgets.filter((b) => b.spent > 0)} />
            </section>

            <section className="panel">
              <h2 className="section__title b-section-title">Budgets du mois</h2>
              {props.budgets.length === 0 ? (
                <p className="b-empty">
                  Aucun budget défini.{' '}
                  <Link href="/categories" className="il">
                    Ajouter un budget
                  </Link>
                </p>
              ) : (
                <ul className="b-list">
                  {props.budgets.map((b) => {
                    const over = b.remaining !== null && b.remaining < 0
                    return (
                      <li key={b.id} className="b-item">
                        <div className="b-item__main">
                          <div
                            style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
                          >
                            <span className="b-item__title">{b.name}</span>
                            <span className={`b-amount ${over ? 'b-amount--out' : ''}`}>
                              {euros(b.spent)}
                              {b.budget !== null && (
                                <span className="b-item__meta"> / {euros(b.budget)}</span>
                              )}
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
                            <div className="b-item__meta b-amount--out">
                              Dépassé de {euros(-b.remaining!)}
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          <section className="panel">
            <h2 className="section__title b-section-title">Dernières opérations</h2>
            {props.latest.length === 0 ? (
              <p className="b-empty">
                Aucune opération.{' '}
                <Link href="/transactions" className="il">
                  Ajouter une opération
                </Link>
              </p>
            ) : (
              <ul className="b-list">
                {props.latest.map((t) => (
                  <li key={t.id} className="b-item">
                    <div className="b-item__main">
                      <div className="b-item__title">{t.description}</div>
                      <div className="b-item__meta">
                        {new Date(t.date).toLocaleDateString('fr-FR')}
                        {t.categoryName && ` · ${t.categoryName}`}
                      </div>
                    </div>
                    <span className={`b-amount b-amount--${t.type === 'income' ? 'in' : 'out'}`}>
                      {t.type === 'income' ? '+' : '−'} {euros(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
