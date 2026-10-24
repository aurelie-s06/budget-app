import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'
import Stat from '~/components/stat'

type Month = { month: string; income: number; expenses: number; savings: number; rest: number }
type CategoryRow = {
  id: number | null
  name: string
  color: string | null
  monthlyBudget: number | null
  months: number[]
  total: number
}
type Props = {
  year: number
  years: number[]
  months: Month[]
  categories: CategoryRow[]
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
// Dans le tableau : sans centimes, pour que les 12 mois tiennent
const short = (n: number) =>
  n === 0
    ? '—'
    : n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const monthName = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'short' })

export default function YearShow({ year, months, categories }: Props) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  // Mois écoulés : sert aux moyennes (toute l'année si elle est passée)
  const elapsed = months.filter((m) => m.month <= currentMonth).length || 12
  const sum = (key: keyof Omit<Month, 'month'>) => months.reduce((s, m) => s + m[key], 0)
  const income = sum('income')
  const expenses = sum('expenses')
  const savings = sum('savings')
  const rest = sum('rest')
  const empty = income === 0 && expenses === 0 && savings === 0

  // Ligne de totaux sous le tableau des catégories
  const totals: { label: string; key: keyof Omit<Month, 'month'>; className?: string }[] = [
    { label: 'Total dépenses', key: 'expenses', className: 'b-amount--out' },
    { label: 'Revenus', key: 'income', className: 'b-amount--in' },
    { label: 'Épargne', key: 'savings', className: 'b-amount--move' },
    { label: 'Reste', key: 'rest' },
  ]

  return (
    <>
      <Head title={`Année ${year}`} />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <h1 className="page__title">{year}</h1>
              <p className="page__description">Ton année mois par mois, catégorie par catégorie.</p>
            </div>
            <div className="page__actions b-month-nav">
              <Link
                href={`/years?year=${year - 1}`}
                className="iconbtn"
                aria-label="Année précédente"
                preserveScroll
              >
                <ChevronLeft size={16} />
              </Link>
              <Link
                href={`/years?year=${year + 1}`}
                className="iconbtn"
                aria-label="Année suivante"
                preserveScroll
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </header>

          <section className="b-stats">
            <Stat
              label="Revenus"
              value={euros(income)}
              tone="in"
              hint={`${euros(income / elapsed)} / mois en moyenne`}
            />
            <Stat
              label="Dépenses"
              value={euros(expenses)}
              tone="out"
              hint={`${euros(expenses / elapsed)} / mois en moyenne`}
            />
            <Stat
              label="Épargne"
              value={euros(savings)}
              tone={savings < 0 ? 'out' : undefined}
              hint={
                income > 0
                  ? `${Math.round((savings / income) * 100)} % des revenus`
                  : 'Virée sur tes comptes épargne'
              }
            />
            <Stat
              label="Reste"
              value={euros(rest)}
              tone={rest < 0 ? 'out' : undefined}
              hint="Revenus − dépenses − épargne"
            />
          </section>

          <section className="panel">
            <header className="b-panel-head">
              <div>
                <h2 className="section__title">Dépenses par catégorie</h2>
                <p className="section__description">
                  Plus la case est colorée, plus tu as dépensé ce mois-là dans la catégorie. Les
                  montants en rouge dépassent le budget mensuel. Clique sur un mois pour son détail.
                </p>
              </div>
            </header>

            {empty ? (
              <p className="b-empty">Aucune opération en {year}.</p>
            ) : (
              <div className="b-table-wrap">
                <table className="b-table b-year">
                  <thead>
                    <tr>
                      <th scope="col">Catégorie</th>
                      {months.map((m) => (
                        <th
                          key={m.month}
                          scope="col"
                          className={[
                            'b-num',
                            m.month === currentMonth && 'b-year__current',
                            m.month > currentMonth && 'b-year__future',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <Link href={`/months?month=${m.month}`}>{monthName(m.month)}</Link>
                        </th>
                      ))}
                      <th scope="col" className="b-num">
                        Total
                      </th>
                      <th scope="col" className="b-num">
                        Moy.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => {
                      const max = Math.max(...c.months)
                      return (
                        <tr key={c.id ?? 'none'}>
                          <th scope="row">
                            <span className="b-year__cat">
                              <span
                                className="b-dot"
                                style={{ background: c.color ?? 'var(--subtle)' }}
                              />
                              {c.name}
                            </span>
                          </th>
                          {c.months.map((v, i) => {
                            const over = c.monthlyBudget !== null && v > c.monthlyBudget
                            return (
                              <td
                                key={i}
                                className={`b-num ${over ? 'b-amount--out' : ''}`}
                                style={
                                  v > 0
                                    ? {
                                        // Intensité relative au mois le plus élevé de la catégorie
                                        background: `color-mix(in srgb, ${c.color ?? 'var(--muted)'} ${Math.round(8 + (v / max) * 30)}%, transparent)`,
                                      }
                                    : undefined
                                }
                                title={
                                  over ? `Budget de ${euros(c.monthlyBudget!)} dépassé` : undefined
                                }
                              >
                                {short(v)}
                              </td>
                            )
                          })}
                          <td className="b-num b-year__total">{short(c.total)}</td>
                          <td className="b-num b-year__avg">{short(c.total / elapsed)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    {totals.map(({ label, key, className }) => {
                      const total = sum(key)
                      return (
                        <tr key={key}>
                          <th scope="row">{label}</th>
                          {months.map((m) => (
                            <td key={m.month} className={`b-num ${className ?? ''}`}>
                              {short(m[key])}
                            </td>
                          ))}
                          <td className={`b-num b-year__total ${className ?? ''}`}>
                            {short(total)}
                          </td>
                          <td className="b-num b-year__avg">{short(total / elapsed)}</td>
                        </tr>
                      )
                    })}
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
