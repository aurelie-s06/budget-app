import { Head, useForm, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'

type Type = 'income' | 'expense' | 'transfer'
type Frequency = 'weekly' | 'monthly' | 'yearly'
type Rule = {
  id: number
  type: Type
  amount: number
  description: string
  frequency: Frequency
  startDate: string
  endDate: string | null
  // null : récurrence terminée
  nextDate: string | null
  generatedCount: number
  accountId: number
  toAccountId: number | null
  categoryId: number | null
  accountName: string
  toAccountName: string | null
  categoryName: string | null
  categoryColor: string | null
}
type Option = { id: number; name: string }
type Props = {
  rules: Rule[]
  accounts: (Option & { type: string })[]
  categories: Option[]
}

const AMOUNT = {
  income: { sign: '+', className: 'b-amount--in' },
  expense: { sign: '−', className: 'b-amount--out' },
  transfer: { sign: '⇄', className: 'b-amount--move' },
}
const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'monthly', label: 'Tous les mois' },
  { value: 'weekly', label: 'Toutes les semaines' },
  { value: 'yearly', label: 'Tous les ans' },
]

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const today = () => new Date().toISOString().slice(0, 10)
const parse = (iso: string) => new Date(`${iso}T00:00`)
const longDate = (iso: string) =>
  parse(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// « Le 5 de chaque mois », « Chaque lundi », « Chaque année le 14 juillet »
function rhythm(frequency: Frequency, startDate: string) {
  const d = parse(startDate)
  if (frequency === 'weekly') return `Chaque ${d.toLocaleDateString('fr-FR', { weekday: 'long' })}`
  if (frequency === 'yearly')
    return `Chaque année le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
  return `Le ${d.getDate() === 1 ? '1er' : d.getDate()} de chaque mois`
}

// Compte d'arrivée proposé pour un virement : un compte épargne de préférence
function defaultTarget(accounts: Props['accounts'], fromId: string) {
  const others = accounts.filter((a) => a.id.toString() !== fromId)
  return (others.find((a) => a.type === 'epargne') ?? others[0])?.id.toString() ?? ''
}

export default function RecurringIndex({ rules, accounts, categories }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const editing = rules.find((r) => r.id === editingId) ?? null
  const form = useForm({
    type: 'expense' as Type,
    amount: '',
    description: '',
    frequency: 'monthly' as Frequency,
    startDate: today(),
    endDate: '',
    accountId: accounts[0]?.id.toString() ?? '',
    toAccountId: '',
    categoryId: '',
  })
  const isTransfer = form.data.type === 'transfer'

  function chooseType(type: Type) {
    form.setData((data) => ({
      ...data,
      type,
      toAccountId:
        type === 'transfer' && data.toAccountId === ''
          ? defaultTarget(accounts, data.accountId)
          : data.toAccountId,
    }))
  }

  function chooseAccount(accountId: string) {
    form.setData((data) => ({
      ...data,
      accountId,
      // Le compte d'arrivée ne peut pas être le compte de départ
      toAccountId:
        data.toAccountId === accountId ? defaultTarget(accounts, accountId) : data.toAccountId,
    }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.transform((data) => ({
      ...data,
      amount: Number(data.amount),
      accountId: Number(data.accountId),
      toAccountId: isTransfer ? Number(data.toAccountId) : null,
      categoryId: isTransfer || data.categoryId === '' ? null : Number(data.categoryId),
      endDate: data.endDate === '' ? null : data.endDate,
    }))
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        form.reset()
        setEditingId(null)
      },
    }
    if (editingId) form.put(`/recurring/${editingId}`, options)
    else form.post('/recurring', options)
  }

  function edit(r: Rule) {
    setEditingId(r.id)
    form.clearErrors()
    form.setData({
      type: r.type,
      amount: r.amount.toString(),
      description: r.description,
      frequency: r.frequency,
      startDate: r.startDate,
      endDate: r.endDate ?? '',
      accountId: r.accountId.toString(),
      toAccountId: r.toAccountId?.toString() ?? '',
      categoryId: r.categoryId?.toString() ?? '',
    })
  }

  function cancel() {
    setEditingId(null)
    form.reset()
    form.clearErrors()
  }

  function remove(r: Rule) {
    if (
      confirm(
        `Supprimer la récurrence « ${r.description} » ? Les opérations déjà créées sont conservées.`
      )
    )
      router.delete(`/recurring/${r.id}`, { preserveScroll: true })
  }

  // Total mensuel estimé des récurrences actives (hors virements)
  const perMonth = { weekly: 52 / 12, monthly: 1, yearly: 1 / 12 }
  const monthly = rules
    .filter((r) => r.nextDate !== null && r.type !== 'transfer')
    .reduce((sum, r) => sum + (r.type === 'income' ? 1 : -1) * r.amount * perMonth[r.frequency], 0)

  const startIsPast = !editing && form.data.startDate < today()

  return (
    <>
      <Head title="Opérations récurrentes" />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <Link href="/transactions" className="b-link b-back">
                <ArrowLeft size={14} aria-hidden="true" />
                Opérations
              </Link>
              <h1 className="page__title">Opérations récurrentes</h1>
              <p className="page__description">
                Loyer, abonnements, salaire… ajoutés automatiquement à chaque échéance.
              </p>
            </div>
          </header>

          {accounts.length === 0 ? (
            <section className="panel">
              <p className="b-empty">
                Crée d’abord un compte :{' '}
                <a href="/accounts" className="il">
                  gérer mes comptes
                </a>
                .
              </p>
            </section>
          ) : (
            <div className="b-split">
              <section className="panel">
                {rules.length === 0 ? (
                  <p className="b-empty">Aucune opération récurrente pour l’instant.</p>
                ) : (
                  <>
                    <p className="b-summary">
                      {rules.length} récurrence(s) · environ{' '}
                      <span className={monthly < 0 ? 'b-amount--out' : 'b-amount--in'}>
                        {monthly < 0 ? '−' : '+'} {euros(Math.abs(monthly))}
                      </span>{' '}
                      par mois
                    </p>
                    <ul className="b-list">
                      {rules.map((r) => (
                        <li
                          key={r.id}
                          className={`b-item ${r.nextDate === null ? 'b-item--ended' : ''}`}
                        >
                          <span
                            className="b-dot"
                            style={{ background: r.categoryColor ?? 'var(--subtle)' }}
                          />
                          <div className="b-item__main">
                            <div className="b-item__title">{r.description}</div>
                            <div className="b-item__meta">
                              {rhythm(r.frequency, r.startDate)} ·{' '}
                              {r.type === 'transfer'
                                ? `${r.accountName} → ${r.toAccountName}`
                                : [r.categoryName, r.accountName].filter(Boolean).join(' · ')}
                            </div>
                            <div className="b-item__meta">
                              {r.nextDate
                                ? `Prochaine le ${longDate(r.nextDate)}`
                                : `Terminée${r.endDate ? ` le ${longDate(r.endDate)}` : ''}`}
                            </div>
                          </div>
                          <span className={`b-amount ${AMOUNT[r.type].className}`}>
                            {AMOUNT[r.type].sign} {euros(r.amount)}
                          </span>
                          <div className="b-actions">
                            <button className="b-link" onClick={() => edit(r)}>
                              Modifier
                            </button>
                            <button className="b-link b-link--danger" onClick={() => remove(r)}>
                              Supprimer
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>

              <form className="panel b-form" onSubmit={submit}>
                <h2 className="section__title">
                  {editing ? 'Modifier la récurrence' : 'Nouvelle récurrence'}
                </h2>

                <div className="b-toggle b-toggle--3">
                  <button
                    type="button"
                    aria-pressed={form.data.type === 'expense'}
                    onClick={() => chooseType('expense')}
                  >
                    Dépense
                  </button>
                  <button
                    type="button"
                    aria-pressed={form.data.type === 'income'}
                    onClick={() => chooseType('income')}
                  >
                    Revenu
                  </button>
                  <button
                    type="button"
                    aria-pressed={isTransfer}
                    disabled={accounts.length < 2}
                    title={accounts.length < 2 ? 'Il faut au moins deux comptes' : undefined}
                    onClick={() => chooseType('transfer')}
                  >
                    Virement
                  </button>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="r-description">
                    Description
                  </label>
                  <input
                    id="r-description"
                    className="field__input"
                    placeholder={isTransfer ? 'Épargne du mois' : 'Loyer, Netflix, Salaire…'}
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                  />
                  {form.errors.description && (
                    <p className="field__error">{form.errors.description}</p>
                  )}
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="r-amount">
                    Montant (€)
                  </label>
                  <input
                    id="r-amount"
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
                  <label className="field__label" htmlFor="r-frequency">
                    Fréquence
                  </label>
                  <select
                    id="r-frequency"
                    className="field__input"
                    value={form.data.frequency}
                    onChange={(e) => form.setData('frequency', e.target.value as Frequency)}
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="b-row">
                  <div className="field">
                    <label className="field__label" htmlFor="r-start">
                      Première fois le
                    </label>
                    <input
                      id="r-start"
                      type="date"
                      className="field__input"
                      value={form.data.startDate}
                      onChange={(e) => form.setData('startDate', e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="r-end">
                      Jusqu’au
                    </label>
                    <input
                      id="r-end"
                      type="date"
                      className="field__input"
                      value={form.data.endDate}
                      onChange={(e) => form.setData('endDate', e.target.value)}
                    />
                  </div>
                </div>
                {form.errors.startDate && <p className="field__error">{form.errors.startDate}</p>}
                {form.errors.endDate && <p className="field__error">{form.errors.endDate}</p>}
                <p className="b-form__hint">
                  {editing
                    ? 'Les changements s’appliquent aux prochaines échéances ; les opérations déjà créées ne bougent pas.'
                    : startIsPast
                      ? 'Date passée : les échéances depuis cette date seront créées tout de suite.'
                      : 'Laisse « Jusqu’au » vide pour une récurrence sans fin.'}
                </p>

                <div className="field">
                  <label className="field__label" htmlFor="r-account">
                    {isTransfer ? 'Depuis le compte' : 'Compte'}
                  </label>
                  <select
                    id="r-account"
                    className="field__input"
                    value={form.data.accountId}
                    onChange={(e) => chooseAccount(e.target.value)}
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isTransfer ? (
                  <div className="field">
                    <label className="field__label" htmlFor="r-to-account">
                      Vers le compte
                    </label>
                    <select
                      id="r-to-account"
                      className="field__input"
                      value={form.data.toAccountId}
                      onChange={(e) => form.setData('toAccountId', e.target.value)}
                    >
                      {accounts
                        .filter((a) => a.id.toString() !== form.data.accountId)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                            {a.type === 'epargne' ? ' (épargne)' : ''}
                          </option>
                        ))}
                    </select>
                    {form.errors.toAccountId && (
                      <p className="field__error">{form.errors.toAccountId}</p>
                    )}
                  </div>
                ) : (
                  <div className="field">
                    <label className="field__label" htmlFor="r-category">
                      Catégorie
                    </label>
                    <select
                      id="r-category"
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
                )}

                <div className="b-row">
                  <button type="submit" className="btn btn--primary" disabled={form.processing}>
                    {editing ? 'Enregistrer' : 'Ajouter'}
                  </button>
                  {editing && (
                    <button type="button" className="btn btn--secondary" onClick={cancel}>
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
