import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'

type Transaction = {
  id: number
  type: 'income' | 'expense'
  amount: number
  date: string
  description: string
  note: string | null
  accountId: number
  categoryId: number | null
  accountName: string
  categoryName: string | null
  categoryColor: string | null
}
type Option = { id: number; name: string }
type Filters = {
  month: string
  accountId: string
  categoryId: string
  type: string
  search: string
}
type Props = {
  transactions: Transaction[]
  accounts: Option[]
  categories: Option[]
  filters: Filters
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const today = () => new Date().toISOString().slice(0, 10)
const EMPTY_FILTERS: Filters = { month: '', accountId: '', categoryId: '', type: '', search: '' }

export default function TransactionsIndex({ transactions, accounts, categories, filters }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const emptyForm = {
    type: 'expense' as Transaction['type'],
    amount: '',
    date: today(),
    description: '',
    note: '',
    accountId: accounts[0]?.id.toString() ?? '',
    categoryId: '',
  }
  const form = useForm(emptyForm)
  const [filterValues, setFilterValues] = useState<Filters>(filters)

  const header = (
    <header className="page__header">
      <div>
        <h1 className="page__title">Opérations</h1>
        <p className="page__description">Tes revenus et dépenses, compte par compte.</p>
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
                Crée d'abord un compte pour ajouter des opérations :{' '}
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

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.transform((data) => ({
      ...data,
      amount: Number(data.amount),
      accountId: Number(data.accountId),
      categoryId: data.categoryId === '' ? null : Number(data.categoryId),
      note: data.note === '' ? null : data.note,
    }))
    const options = {
      onSuccess: () => {
        form.setData(emptyForm)
        setEditingId(null)
      },
    }
    if (editingId) form.put(`/transactions/${editingId}`, options)
    else form.post('/transactions', options)
  }

  function edit(t: Transaction) {
    setEditingId(t.id)
    form.setData({
      type: t.type,
      amount: t.amount.toString(),
      date: t.date,
      description: t.description,
      note: t.note ?? '',
      accountId: t.accountId.toString(),
      categoryId: t.categoryId?.toString() ?? '',
    })
  }

  function cancel() {
    setEditingId(null)
    form.setData(emptyForm)
  }

  function remove(t: Transaction) {
    if (confirm(`Supprimer « ${t.description} » ?`)) router.delete(`/transactions/${t.id}`)
  }

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault()
    const params = Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v !== ''))
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

  const setFilter = (key: keyof Filters, value: string) =>
    setFilterValues((prev) => ({ ...prev, [key]: value }))

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
                  <input
                    id="f-month"
                    type="month"
                    className="field__input"
                    value={filterValues.month}
                    onChange={(e) => setFilter('month', e.target.value)}
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
                  </select>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-search">
                    Recherche
                  </label>
                  <input
                    id="f-search"
                    className="field__input"
                    placeholder="Description…"
                    value={filterValues.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                  />
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
                        <th>Date</th>
                        <th>Description</th>
                        <th className="b-num">Montant</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td className="b-item__meta" style={{ whiteSpace: 'nowrap' }}>
                            {new Date(t.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td>
                            <div className="b-item__title">{t.description}</div>
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
                              {t.accountName}
                            </div>
                          </td>
                          <td
                            className={`b-num b-amount b-amount--${t.type === 'income' ? 'in' : 'out'}`}
                          >
                            {t.type === 'income' ? '+' : '−'} {euros(t.amount)}
                          </td>
                          <td>
                            <div className="b-actions" style={{ justifyContent: 'flex-end' }}>
                              <button className="b-link" onClick={() => edit(t)}>
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

            <form className="panel b-form" onSubmit={submit}>
              <h2 className="section__title">
                {editingId ? "Modifier l'opération" : 'Nouvelle opération'}
              </h2>

              <div className="b-toggle">
                <button
                  type="button"
                  aria-pressed={form.data.type === 'expense'}
                  onClick={() => form.setData('type', 'expense')}
                >
                  Dépense
                </button>
                <button
                  type="button"
                  aria-pressed={form.data.type === 'income'}
                  onClick={() => form.setData('type', 'income')}
                >
                  Revenu
                </button>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="description">
                  Description
                </label>
                <input
                  id="description"
                  className="field__input"
                  value={form.data.description}
                  onChange={(e) => form.setData('description', e.target.value)}
                />
                {form.errors.description && (
                  <p className="field__error">{form.errors.description}</p>
                )}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="amount">
                  Montant (€)
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="field__input"
                  value={form.data.amount}
                  onChange={(e) => form.setData('amount', e.target.value)}
                />
                {form.errors.amount && <p className="field__error">{form.errors.amount}</p>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className="field__input"
                  value={form.data.date}
                  onChange={(e) => form.setData('date', e.target.value)}
                />
                {form.errors.date && <p className="field__error">{form.errors.date}</p>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="account">
                  Compte
                </label>
                <select
                  id="account"
                  className="field__input"
                  value={form.data.accountId}
                  onChange={(e) => form.setData('accountId', e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="category">
                  Catégorie
                </label>
                <select
                  id="category"
                  className="field__input"
                  value={form.data.categoryId}
                  onChange={(e) => form.setData('categoryId', e.target.value)}
                >
                  <option value="">Aucune</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="note">
                  Note
                </label>
                <input
                  id="note"
                  className="field__input"
                  placeholder="Facultatif"
                  value={form.data.note}
                  onChange={(e) => form.setData('note', e.target.value)}
                />
              </div>

              <div className="b-row">
                <button type="submit" className="btn btn--primary" disabled={form.processing}>
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn--secondary" onClick={cancel}>
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
