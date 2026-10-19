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

function Card({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
      <small>{label}</small>
      <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.25rem 0 0', color }}>{value}</p>
    </div>
  )
}

export default function Dashboard(props: Props) {
  const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <>
      <MainNav />
      <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Tableau de bord</h1>
        <p>Mois en cours : {month}</p>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
          }}
        >
          <Card
            label="Solde total"
            value={euros(props.totalBalance)}
            color={props.totalBalance < 0 ? 'crimson' : undefined}
          />
          <Card label="Revenus du mois" value={euros(props.income)} color="green" />
          <Card label="Dépenses du mois" value={euros(props.expenses)} color="crimson" />
          <Card label="Épargne du mois" value={euros(props.savings)} />
          <Card
            label="Taux de dépenses"
            value={props.spendingRate !== null ? `${props.spendingRate} %` : '—'}
          />
        </section>

        <h2>Répartition des dépenses</h2>
        <ExpensesChart items={props.budgets.filter((b) => b.spent > 0)} />

        <h2>Budgets du mois</h2>
        {props.budgets.length === 0 ? (
          <p>
            Aucun budget défini. <Link href="/categories">Ajouter un budget à une catégorie</Link>
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {props.budgets.map((b) => {
              const over = b.remaining !== null && b.remaining < 0
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{b.name}</strong>
                    <span style={{ color: over ? 'crimson' : undefined }}>
                      {euros(b.spent)}
                      {b.budget !== null && ` / ${euros(b.budget)}`}
                      {b.percent !== null && ` (${b.percent} %)`}
                    </span>
                  </div>
                  {b.budget !== null && (
                    <div
                      style={{ height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(b.percent ?? 0, 100)}%`,
                          background: over ? 'crimson' : (b.color ?? '#6366f1'),
                        }}
                      />
                    </div>
                  )}
                  {over && (
                    <small style={{ color: 'crimson' }}>
                      Budget dépassé de {euros(-b.remaining!)}
                    </small>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <h2>Dernières opérations</h2>
        {props.latest.length === 0 ? (
          <p>
            Aucune opération. <Link href="/transactions">Ajouter une opération</Link>
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {props.latest.map((t) => (
              <li
                key={t.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #eee',
                }}
              >
                <span>{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                <span style={{ flex: 1 }}>
                  {t.description}
                  {t.categoryName && <small> · {t.categoryName}</small>}
                </span>
                <strong style={{ color: t.type === 'income' ? 'green' : 'crimson' }}>
                  {t.type === 'income' ? '+' : '−'} {euros(t.amount)}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
