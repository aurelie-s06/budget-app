import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'

type Account = {
  id: number
  name: string
  type: 'courant' | 'epargne' | 'especes' | 'autre'
  color: string | null
  initialBalance: number
  // Rempli : initialBalance est le solde connu ce jour-là
  balanceDate: string | null
  balance: number
}

const TYPE_LABELS = {
  courant: 'Compte courant',
  epargne: 'Épargne',
  especes: 'Espèces',
  autre: 'Autre',
}
const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const today = () => new Date().toISOString().slice(0, 10)
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export default function AccountsIndex({ accounts }: { accounts: Account[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const form = useForm({
    name: '',
    type: 'courant' as Account['type'],
    initialBalance: '0',
    // Par défaut on saisit le solde d'aujourd'hui, celui qu'on connaît
    knownAtDate: true,
    balanceDate: today(),
    color: '#0a0a0b',
  })

  const total = accounts.reduce((sum, a) => sum + a.balance, 0)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.transform(({ knownAtDate, ...data }) => ({
      ...data,
      initialBalance: Number(data.initialBalance),
      balanceDate: knownAtDate ? data.balanceDate : null,
    }))
    const options = {
      onSuccess: () => {
        form.reset()
        setEditingId(null)
      },
    }
    if (editingId) form.put(`/accounts/${editingId}`, options)
    else form.post('/accounts', options)
  }

  function edit(a: Account) {
    setEditingId(a.id)
    form.setData({
      name: a.name,
      type: a.type,
      initialBalance: a.initialBalance.toString(),
      knownAtDate: a.balanceDate !== null,
      balanceDate: a.balanceDate ?? today(),
      color: a.color ?? '#0a0a0b',
    })
  }

  function cancel() {
    setEditingId(null)
    form.reset()
  }

  function remove(a: Account) {
    if (confirm(`Supprimer « ${a.name} » ? Toutes ses opérations seront aussi supprimées.`))
      router.delete(`/accounts/${a.id}`)
  }

  return (
    <>
      <Head title="Comptes" />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <h1 className="page__title">Comptes</h1>
              <p className="page__description">Solde total : {euros(total)}</p>
            </div>
          </header>

          <div className="b-split">
            <section className="panel">
              {accounts.length === 0 ? (
                <p className="b-empty">Aucun compte pour l’instant.</p>
              ) : (
                <ul className="b-list">
                  {accounts.map((a) => (
                    <li key={a.id} className="b-item">
                      <span className="b-dot" style={{ background: a.color ?? 'var(--ink)' }} />
                      <div className="b-item__main">
                        <div className="b-item__title">{a.name}</div>
                        <div className="b-item__meta">
                          {TYPE_LABELS[a.type]}
                          {a.balanceDate &&
                            ` · solde de ${euros(a.initialBalance)} le ${shortDate(a.balanceDate)}`}
                        </div>
                      </div>
                      <span className={`b-amount ${a.balance < 0 ? 'b-amount--out' : ''}`}>
                        {euros(a.balance)}
                      </span>
                      <div className="b-actions">
                        <button className="b-link" onClick={() => edit(a)}>
                          Modifier
                        </button>
                        <button className="b-link b-link--danger" onClick={() => remove(a)}>
                          Supprimer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <form className="panel b-form" onSubmit={submit}>
              <h2 className="section__title">
                {editingId ? 'Modifier le compte' : 'Nouveau compte'}
              </h2>

              <div className="field">
                <label className="field__label" htmlFor="name">
                  Nom
                </label>
                <input
                  id="name"
                  className="field__input"
                  value={form.data.name}
                  onChange={(e) => form.setData('name', e.target.value)}
                />
                {form.errors.name && <p className="field__error">{form.errors.name}</p>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="type">
                  Type
                </label>
                <select
                  id="type"
                  className="field__input"
                  value={form.data.type}
                  onChange={(e) => form.setData('type', e.target.value as Account['type'])}
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <span className="field__label">Solde</span>
                <div className="b-toggle">
                  <button
                    type="button"
                    aria-pressed={form.data.knownAtDate}
                    onClick={() => form.setData('knownAtDate', true)}
                  >
                    Connu à une date
                  </button>
                  <button
                    type="button"
                    aria-pressed={!form.data.knownAtDate}
                    onClick={() => form.setData('knownAtDate', false)}
                  >
                    Solde de départ
                  </button>
                </div>
                <p className="field__hint">
                  {form.data.knownAtDate
                    ? 'Le solde affiché par ta banque ce jour-là. Les opérations plus anciennes que tu ajoutes ne le modifient pas.'
                    : 'Le solde avant toutes les opérations du compte.'}
                </p>
              </div>

              <div className="b-row">
                <div className="field">
                  <label className="field__label" htmlFor="balance">
                    Montant (€)
                  </label>
                  <input
                    id="balance"
                    type="number"
                    step="0.01"
                    className="field__input"
                    value={form.data.initialBalance}
                    onChange={(e) => form.setData('initialBalance', e.target.value)}
                  />
                </div>
                {form.data.knownAtDate && (
                  <div className="field">
                    <label className="field__label" htmlFor="balance-date">
                      Le
                    </label>
                    <input
                      id="balance-date"
                      type="date"
                      className="field__input"
                      value={form.data.balanceDate}
                      onChange={(e) => form.setData('balanceDate', e.target.value)}
                    />
                  </div>
                )}
              </div>
              {form.errors.initialBalance && (
                <p className="field__error">{form.errors.initialBalance}</p>
              )}
              {form.errors.balanceDate && <p className="field__error">{form.errors.balanceDate}</p>}

              <div className="field">
                <label className="field__label" htmlFor="color">
                  Couleur
                </label>
                <input
                  id="color"
                  type="color"
                  className="field__input b-color"
                  value={form.data.color}
                  onChange={(e) => form.setData('color', e.target.value)}
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
