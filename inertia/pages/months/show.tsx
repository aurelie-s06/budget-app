import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'
import Stat from '~/components/stat'
import ExpensesChart from '~/components/expenses_chart'
import BudgetList, { type Budget } from '~/components/budget_list'
import TransactionForm, { type EditableTransaction } from '~/components/transaction_form'

type Transaction = EditableTransaction & {
  categoryName: string | null
  categoryColor: string | null
}
type Option = { id: number; name: string }
type Props = {
  month: string
  previous: string
  next: string
  income: number
  salary: number
  otherIncome: number
  expenses: number
  savings: number
  spendingRate: number | null
  budgets: Budget[]
  uncategorized: number
  transactions: Transaction[]
  accounts: Option[]
  categories: Option[]
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function MonthShow(props: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  // On referme les formulaires quand on change de mois
  const [shownMonth, setShownMonth] = useState(props.month)
  if (shownMonth !== props.month) {
    setShownMonth(props.month)
    setEditingId(null)
    setAdding(false)
  }

  // Nouvelle opération : aujourd'hui si c'est le mois affiché, sinon le 1er du mois
  const todayIso = new Date().toISOString().slice(0, 10)
  const defaultDate = todayIso.startsWith(props.month) ? todayIso : `${props.month}-01`

  function startEdit(id: number) {
    setAdding(false)
    setEditingId(id)
  }

  function startAdd() {
    setEditingId(null)
    setAdding(true)
  }

  function remove(t: Transaction) {
    if (confirm(`Supprimer « ${t.description} » ?`)) {
      router.delete(`/transactions/${t.id}`, { preserveScroll: true })
    }
  }

  const title = new Date(`${props.month}-01`).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  // Répartition : catégories avec dépenses + dépenses sans catégorie
  const breakdown = [
    ...props.budgets.filter((b) => b.spent > 0),
    ...(props.uncategorized > 0
      ? [{ name: 'Sans catégorie', color: null, spent: props.uncategorized }]
      : []),
  ]

  return (
    <>
      <Head title={title} />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <h1 className="page__title b-capitalize">{title}</h1>
              <p className="page__description">
                {props.transactions.length} opération{props.transactions.length > 1 ? 's' : ''} ce
                mois-ci
              </p>
            </div>
            <div className="page__actions b-month-nav">
              <Link
                href={`/months?month=${props.previous}`}
                className="iconbtn"
                aria-label="Mois précédent"
                preserveScroll
              >
                <ChevronLeft size={16} />
              </Link>
              <Link
                href={`/months?month=${props.next}`}
                className="iconbtn"
                aria-label="Mois suivant"
                preserveScroll
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </header>

          <section className="b-stats">
            <Stat
              label="Revenus"
              value={euros(props.income)}
              tone="in"
              hint={
                <>
                  <span>Salaire {euros(props.salary)}</span>
                  <span>Autres {euros(props.otherIncome)}</span>
                </>
              }
            />
            <Stat label="Dépenses" value={euros(props.expenses)} tone="out" />
            <Stat
              label="Épargne"
              value={euros(props.savings)}
              tone={props.savings < 0 ? 'out' : undefined}
            />
            <Stat
              label="Taux de dépenses"
              value={props.spendingRate !== null ? `${props.spendingRate} %` : '—'}
            />
          </section>

          <div className="b-grid-2">
            <section className="panel">
              <h2 className="section__title b-section-title">Répartition des dépenses</h2>
              <ExpensesChart items={breakdown} />
            </section>

            <section className="panel">
              <h2 className="section__title b-section-title">Budgets</h2>
              <BudgetList budgets={props.budgets} />
            </section>
          </div>

          <section className="panel">
            <header className="b-panel-head">
              <h2 className="section__title">Opérations du mois</h2>
              <div className="b-actions">
                <Link href={`/transactions?month=${props.month}`} className="b-link">
                  Gérer les opérations
                </Link>
                {!adding && props.accounts.length > 0 && (
                  <button className="btn btn--primary btn--sm" onClick={startAdd}>
                    <Plus size={14} /> Ajouter
                  </button>
                )}
              </div>
            </header>
            {adding && (
              <div className="b-add-form">
                <TransactionForm
                  defaultDate={defaultDate}
                  accounts={props.accounts}
                  categories={props.categories}
                  className="b-form b-form--inline"
                  onDone={() => setAdding(false)}
                  onCancel={() => setAdding(false)}
                />
              </div>
            )}
            {props.transactions.length === 0 ? (
              <p className="b-empty">Aucune opération ce mois-ci.</p>
            ) : (
              <ul className="b-list">
                {props.transactions.map((t) =>
                  t.id === editingId ? (
                    <li key={t.id} className="b-item b-item--edit">
                      <TransactionForm
                        transaction={t}
                        accounts={props.accounts}
                        categories={props.categories}
                        className="b-form b-form--inline"
                        onDone={() => setEditingId(null)}
                        onCancel={() => setEditingId(null)}
                      />
                    </li>
                  ) : (
                    <li key={t.id} className="b-item">
                      <span
                        className="b-dot"
                        style={{ background: t.categoryColor ?? 'var(--line-2)' }}
                      />
                      <div className="b-item__main">
                        <div className="b-item__title">{t.description}</div>
                        <div className="b-item__meta">
                          {new Date(t.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                          })}
                          {t.categoryName && ` · ${t.categoryName}`}
                        </div>
                      </div>
                      <span className={`b-amount b-amount--${t.type === 'income' ? 'in' : 'out'}`}>
                        {t.type === 'income' ? '+' : '−'} {euros(t.amount)}
                      </span>
                      <div className="b-actions">
                        <button className="b-link" onClick={() => startEdit(t.id)}>
                          Modifier
                        </button>
                        <button className="b-link b-link--danger" onClick={() => remove(t)}>
                          Supprimer
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
