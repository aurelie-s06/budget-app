import { Head, Link, router } from '@inertiajs/react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'
import MonthlyChart from '~/components/monthly_chart'
import BalanceChart from '~/components/balance_chart'
import SavingsChart from '~/components/savings_chart'
import SpendingCalendar from '~/components/spending_calendar'
import ExpensesChart from '~/components/expenses_chart'
import BudgetList, { type Budget } from '~/components/budget_list'
import SavingsGoal, { type Goal } from '~/components/savings_goal'

type Period = '6' | '12' | 'all'
type Props = {
  period: Period
  totalBalance: number
  accountCount: number
  income: number
  expenses: number
  savings: number
  spendingRate: number | null
  budgets: Budget[]
  uncategorized: number
  history: { month: string; income: number; expenses: number; savings: number; balance: number }[]
  days: { date: string; amount: number }[]
  goal: Goal | null
}

const PERIODS: { value: Period; label: string }[] = [
  { value: '6', label: '6 mois' },
  { value: '12', label: '12 mois' },
  { value: 'all', label: 'Tout' },
]

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function Dashboard(props: Props) {
  const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const periodLabel = PERIODS.find((p) => p.value === props.period)!.label.toLowerCase()

  // Seuls les graphiques par mois dépendent de la période
  function changePeriod(period: Period) {
    router.get('/dashboard', period === '12' ? {} : { period }, {
      only: ['period', 'history'],
      preserveScroll: true,
      preserveState: true,
      replace: true,
    })
  }

  const breakdown = [
    ...props.budgets.filter((b) => b.spent > 0),
    ...(props.uncategorized > 0
      ? [{ name: 'Sans catégorie', color: null, spent: props.uncategorized }]
      : []),
  ]
  const rate = props.spendingRate

  return (
    <>
      <Head title="Tableau de bord" />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <h1 className="page__title">Tableau de bord</h1>
              <p className="page__description">Ton argent en un coup d’œil.</p>
            </div>
            <div className="page__actions">
              <div className="b-segment" role="group" aria-label="Période des graphiques">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    aria-pressed={props.period === p.value}
                    onClick={() => changePeriod(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="b-dash">
            {/* Solde */}
            <section className="b-tile b-span-4">
              <h2 className="b-tile__label">Solde total</h2>
              <div className={`b-tile__value ${props.totalBalance < 0 ? 'b-amount--out' : ''}`}>
                {euros(props.totalBalance)}
              </div>
              <p className="b-tile__hint">
                Sur {props.accountCount} compte{props.accountCount > 1 ? 's' : ''} ·{' '}
                <Link href="/accounts" className="b-link">
                  Voir les comptes
                </Link>
              </p>
            </section>

            {/* Mois en cours */}
            <section className="b-tile b-span-4">
              <header className="b-tile__head">
                <h2 className="b-tile__label b-capitalize">{month}</h2>
                <Link href="/months" className="b-link">
                  Détail
                </Link>
              </header>
              <dl className="b-figures">
                <div>
                  <dt>Revenus</dt>
                  <dd className="b-amount--in">+ {euros(props.income)}</dd>
                </div>
                <div>
                  <dt>Dépenses</dt>
                  <dd className="b-amount--out">− {euros(props.expenses)}</dd>
                </div>
                <div className="b-figures__total">
                  <dt>Épargne</dt>
                  <dd className={props.savings < 0 ? 'b-amount--out' : ''}>
                    {euros(props.savings)}
                  </dd>
                </div>
              </dl>
              {rate !== null && (
                <div className="b-rate">
                  <div className="b-bar">
                    <div
                      className="b-bar__fill"
                      style={{
                        width: `${Math.min(rate, 100)}%`,
                        background: rate > 100 ? 'var(--out)' : 'var(--ink)',
                      }}
                    />
                  </div>
                  <span className="b-tile__hint">{rate} % des revenus dépensés</span>
                </div>
              )}
            </section>

            {/* Objectif d'épargne */}
            <section className="b-tile b-span-4">
              <h2 className="b-tile__label">Objectif d’épargne</h2>
              <SavingsGoal goal={props.goal} />
            </section>

            {/* Revenus / dépenses */}
            <section className="b-tile b-span-8">
              <header className="b-tile__head">
                <div>
                  <h2 className="section__title">Revenus et dépenses</h2>
                  <p className="section__description">
                    Sur {periodLabel === 'tout' ? 'tout l’historique' : periodLabel}. Clique sur un
                    mois pour voir son détail.
                  </p>
                </div>
              </header>
              <MonthlyChart months={props.history} />
            </section>

            {/* Budgets */}
            <section className="b-tile b-span-4">
              <header className="b-tile__head">
                <h2 className="section__title">Budgets du mois</h2>
                <Link href="/categories" className="b-link">
                  Gérer
                </Link>
              </header>
              <BudgetList budgets={props.budgets.filter((b) => b.budget !== null)} />
            </section>

            {/* Solde dans le temps */}
            <section className="b-tile b-span-6">
              <header className="b-tile__head">
                <div>
                  <h2 className="section__title">Évolution du solde</h2>
                  <p className="section__description">Solde de tous les comptes en fin de mois.</p>
                </div>
              </header>
              <BalanceChart months={props.history} />
            </section>

            {/* Épargne mensuelle */}
            <section className="b-tile b-span-6">
              <header className="b-tile__head">
                <div>
                  <h2 className="section__title">Épargne par mois</h2>
                  <p className="section__description">
                    Ce qu’il reste une fois les dépenses payées.
                  </p>
                </div>
              </header>
              <SavingsChart months={props.history} />
            </section>

            {/* Calendrier */}
            <section className="b-tile b-span-6">
              <header className="b-tile__head">
                <div>
                  <h2 className="section__title">Calendrier des dépenses</h2>
                  <p className="section__description b-capitalize">{month}</p>
                </div>
              </header>
              <SpendingCalendar days={props.days} />
            </section>

            {/* Répartition */}
            <section className="b-tile b-span-6">
              <header className="b-tile__head">
                <h2 className="section__title">Répartition des dépenses</h2>
              </header>
              <ExpensesChart items={breakdown} />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
