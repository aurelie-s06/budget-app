import { Head, Link } from '@inertiajs/react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'
import Stat from '~/components/stat'
import ExpensesChart from '~/components/expenses_chart'
import MonthlyChart from '~/components/monthly_chart'
import BudgetList, { type Budget } from '~/components/budget_list'

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
  history: { month: string; income: number; expenses: number }[]
  latest: Latest[]
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function Dashboard(props: Props) {
  const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <>
      <Head title="Tableau de bord" />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <h1 className="page__title">Tableau de bord</h1>
              <p className="page__description">Vue d'ensemble de {month}</p>
            </div>
            <div className="page__actions">
              <Link href="/months" className="btn btn--secondary btn--sm">
                Détail du mois
              </Link>
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

          <section className="panel b-block">
            <header className="b-panel-head">
              <div>
                <h2 className="section__title">Revenus et dépenses</h2>
                <p className="section__description">
                  Les 6 derniers mois. Clique sur un mois pour voir son détail.
                </p>
              </div>
            </header>
            <MonthlyChart months={props.history} />
          </section>

          <div className="b-grid-2">
            <section className="panel">
              <h2 className="section__title b-section-title">Répartition des dépenses</h2>
              <ExpensesChart items={props.budgets.filter((b) => b.spent > 0)} />
            </section>

            <section className="panel">
              <h2 className="section__title b-section-title">Budgets du mois</h2>
              <BudgetList budgets={props.budgets} />
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
      <Footer />
    </>
  )
}
