import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'
import { ArrowDown, ArrowUp, ArrowUpDown, FileUp, Repeat } from 'lucide-react'
import TransactionForm, { type EditableTransaction } from '~/components/transaction_form'

type Transaction = EditableTransaction & {
  accountName: string
  toAccountName: string | null
  categoryName: string | null
  categoryColor: string | null
  // Créée automatiquement par une opération récurrente
  recurring: boolean
}
type Option = { id: number; name: string }
type Filters = {
  month: string
  day: string
  accountId: string
  categoryId: string
  type: string
  search: string
  minAmount: string
  maxAmount: string
  sort: string
}
type Props = {
  transactions: Transaction[]
  accounts: (Option & { type: string })[]
  categories: Option[]
  months: string[]
  filters: Filters
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
// "2026-04" -> "avril 2026"
const monthLabel = (m: string) =>
  new Date(`${m}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
// Signe et couleur du montant selon le type d'opération
const AMOUNT = {
  income: { sign: '+', className: 'b-amount--in' },
  expense: { sign: '−', className: 'b-amount--out' },
  transfer: { sign: '⇄', className: 'b-amount--move' },
}
const EMPTY_FILTERS: Filters = {
  month: '',
  day: '',
  accountId: '',
  categoryId: '',
  type: '',
  search: '',
  minAmount: '',
  maxAmount: '',
  sort: '',
}

export default function TransactionsIndex({
  transactions,
  accounts,
  categories,
  months,
  filters,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filterValues, setFilterValues] = useState<Filters>(filters)

  const header = (
    <header className="page__header">
      <div>
        <h1 className="page__title">Opérations</h1>
        <p className="page__description">Tes revenus, dépenses et virements, compte par compte.</p>
      </div>
      <div className="page__actions">
        <Link href="/imports" className="btn btn--secondary">
          <FileUp size={16} aria-hidden="true" />
          Importer un relevé
        </Link>
        <Link href="/recurring" className="btn btn--secondary">
          <Repeat size={16} aria-hidden="true" />
          Récurrentes
        </Link>
      </div>
    </header>
  )

  if (accounts.length === 0) {
    return (
      <>
        <Head title="Opérations" />
        <MainNav />
        <main className="app-main">
          <div className="page">
            {header}
            <section className="panel">
              <p className="b-empty">
                Crée d’abord un compte pour ajouter des opérations :{' '}
                <a href="/accounts" className="il">
                  gérer mes comptes
                </a>
                .
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  function remove(t: Transaction) {
    if (confirm(`Supprimer « ${t.description} » ?`)) router.delete(`/transactions/${t.id}`)
  }

  function applyFilters(e?: React.FormEvent, values = filterValues) {
    e?.preventDefault()
    const params = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''))
    router.get('/transactions', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    })
  }

  function resetFilters() {
    setFilterValues(EMPTY_FILTERS)
    router.get('/transactions', {}, { preserveState: true, preserveScroll: true, replace: true })
  }

  // Clic sur l'en-tête Date ou Montant : trie, puis inverse l'ordre au clic suivant
  const sort = filterValues.sort || 'date_desc'
  function sortBy(column: 'date' | 'amount') {
    const next = sort === `${column}_desc` ? `${column}_asc` : `${column}_desc`
    const values = { ...filterValues, sort: next === 'date_desc' ? '' : next }
    setFilterValues(values)
    applyFilters(undefined, values)
  }
  const sortHeader = (column: 'date' | 'amount', label: string) => {
    const active = sort.startsWith(column)
    const Icon = !active ? ArrowUpDown : sort.endsWith('asc') ? ArrowUp : ArrowDown
    return (
      <button
        type="button"
        className={`b-sort ${active ? 'b-sort--active' : ''}`}
        onClick={() => sortBy(column)}
      >
        {label}
        <Icon size={12} aria-hidden="true" />
      </button>
    )
  }

  // Mois et jour s'excluent : choisir l'un vide l'autre
  const setFilter = (key: keyof Filters, value: string) =>
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'month' && value !== '' ? { day: '' } : {}),
      ...(key === 'day' && value !== '' ? { month: '' } : {}),
    }))

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <>
      <Head title="Opérations" />
      <MainNav />
      <main className="app-main">
        <div className="page">
          {header}

          <div className="b-split">
            <section className="panel">
              <form className="b-filters" onSubmit={applyFilters}>
                <div className="field">
                  <label className="field__label" htmlFor="f-month">
                    Mois
                  </label>
                  {/* Liste plutôt que <input type="month">, non géré par Safari */}
                  <select
                    id="f-month"
                    className="field__input"
                    value={filterValues.month}
                    onChange={(e) => setFilter('month', e.target.value)}
                  >
                    <option value="">Tous</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {monthLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-day">
                    Jour
                  </label>
                  <input
                    id="f-day"
                    type="date"
                    className="field__input"
                    value={filterValues.day}
                    onChange={(e) => setFilter('day', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-account">
                    Compte
                  </label>
                  <select
                    id="f-account"
                    className="field__input"
                    value={filterValues.accountId}
                    onChange={(e) => setFilter('accountId', e.target.value)}
                  >
                    <option value="">Tous</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-category">
                    Catégorie
                  </label>
                  <select
                    id="f-category"
                    className="field__input"
                    value={filterValues.categoryId}
                    onChange={(e) => setFilter('categoryId', e.target.value)}
                  >
                    <option value="">Toutes</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-type">
                    Type
                  </label>
                  <select
                    id="f-type"
                    className="field__input"
                    value={filterValues.type}
                    onChange={(e) => setFilter('type', e.target.value)}
                  >
                    <option value="">Tous</option>
                    <option value="expense">Dépenses</option>
                    <option value="income">Revenus</option>
                    <option value="transfer">Virements</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-search">
                    Recherche
                  </label>
                  <input
                    id="f-search"
                    className="field__input"
                    placeholder="Description ou note…"
                    value={filterValues.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-min">
                    Montant min (€)
                  </label>
                  <input
                    id="f-min"
                    type="number"
                    min="0"
                    step="0.01"
                    className="field__input"
                    value={filterValues.minAmount}
                    onChange={(e) => setFilter('minAmount', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-max">
                    Montant max (€)
                  </label>
                  <input
                    id="f-max"
                    type="number"
                    min="0"
                    step="0.01"
                    className="field__input"
                    value={filterValues.maxAmount}
                    onChange={(e) => setFilter('maxAmount', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-sort">
                    Trier par
                  </label>
                  <select
                    id="f-sort"
                    className="field__input"
                    value={filterValues.sort}
                    onChange={(e) => setFilter('sort', e.target.value)}
                  >
                    <option value="">Plus récentes</option>
                    <option value="date_asc">Plus anciennes</option>
                    <option value="amount_desc">Montant décroissant</option>
                    <option value="amount_asc">Montant croissant</option>
                  </select>
                </div>
                <div className="b-row">
                  <button type="submit" className="btn btn--primary">
                    Filtrer
                  </button>
                  <button type="button" className="btn btn--secondary" onClick={resetFilters}>
                    Réinitialiser
                  </button>
                </div>
              </form>

              <p className="b-summary">
                {transactions.length} opération(s) ·{' '}
                <span className="b-amount--in">+ {euros(totalIncome)}</span> ·{' '}
                <span className="b-amount--out">− {euros(totalExpense)}</span>
              </p>

              {transactions.length === 0 ? (
                <p className="b-empty">Aucune opération.</p>
              ) : (
                <div className="b-table-wrap">
                  <table className="b-table">
                    <thead>
                      <tr>
                        <th
                          aria-sort={
                            sort.startsWith('date')
                              ? sort.endsWith('asc')
                                ? 'ascending'
                                : 'descending'
                              : undefined
                          }
                        >
                          {sortHeader('date', 'Date')}
                        </th>
                        <th>Description</th>
                        <th
                          className="b-num"
                          aria-sort={
                            sort.startsWith('amount')
                              ? sort.endsWith('asc')
                                ? 'ascending'
                                : 'descending'
                              : undefined
                          }
                        >
                          {sortHeader('amount', 'Montant')}
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td className="b-item__meta" style={{ whiteSpace: 'nowrap' }}>
                            {new Date(t.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td>
                            <div className="b-item__title">
                              {t.description}
                              {t.recurring && (
                                <Repeat
                                  size={12}
                                  className="b-recurring"
                                  aria-label="Opération récurrente"
                                />
                              )}
                            </div>
                            <div
                              className="b-item__meta"
                              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              {t.categoryName && (
                                <>
                                  <span
                                    className="b-dot"
                                    style={{
                                      width: 8,
                                      height: 8,
                                      background: t.categoryColor ?? 'var(--subtle)',
                                    }}
                                  />
                                  {t.categoryName} ·
                                </>
                              )}
                              {t.type === 'transfer'
                                ? `${t.accountName} → ${t.toAccountName}`
                                : t.accountName}
                            </div>
                          </td>
                          <td className={`b-num b-amount ${AMOUNT[t.type].className}`}>
                            {AMOUNT[t.type].sign} {euros(t.amount)}
                          </td>
                          <td>
                            <div className="b-actions" style={{ justifyContent: 'flex-end' }}>
                              <button className="b-link" onClick={() => setEditingId(t.id)}>
                                Modifier
                              </button>
                              <button className="b-link b-link--danger" onClick={() => remove(t)}>
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <TransactionForm
              key={editingId ?? 'new'}
              transaction={transactions.find((t) => t.id === editingId)}
              accounts={accounts}
              categories={categories}
              className="panel b-form"
              onDone={() => setEditingId(null)}
              onCancel={editingId ? () => setEditingId(null) : undefined}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
