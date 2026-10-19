import { useForm, router } from '@inertiajs/react'
import { useState } from 'react'
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

type Props = { transactions: Transaction[]; accounts: Option[]; categories: Option[] }

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const today = () => new Date().toISOString().slice(0, 10)

export default function TransactionsIndex({ transactions, accounts, categories }: Props) {
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

  if (accounts.length === 0) {
    return (
      <>
        <MainNav />
        <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
          <h1>Mes opérations</h1>
          <p>
            Crée d'abord un compte pour pouvoir ajouter des opérations :{' '}
            <a href="/accounts">gérer mes comptes</a>.
          </p>
        </main>
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
    if (confirm(`Supprimer « ${t.description} » ?`)) {
      router.delete(`/transactions/${t.id}`)
    }
  }

  const error = (field: keyof typeof form.errors) =>
    form.errors[field] && <p style={{ color: 'crimson', margin: 0 }}>{form.errors[field]}</p>

  return (
    <>
      <MainNav />
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Mes opérations</h1>

        <form onSubmit={submit} style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
          <h2>{editingId ? "Modifier l'opération" : 'Nouvelle opération'}</h2>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <label>
              <input
                type="radio"
                checked={form.data.type === 'expense'}
                onChange={() => form.setData('type', 'expense')}
              />{' '}
              Dépense
            </label>
            <label>
              <input
                type="radio"
                checked={form.data.type === 'income'}
                onChange={() => form.setData('type', 'income')}
              />{' '}
              Revenu
            </label>
          </div>

          <label>
            Description
            <input
              value={form.data.description}
              onChange={(e) => form.setData('description', e.target.value)}
            />
          </label>
          {error('description')}

          <label>
            Montant (€)
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.data.amount}
              onChange={(e) => form.setData('amount', e.target.value)}
            />
          </label>
          {error('amount')}

          <label>
            Date
            <input
              type="date"
              value={form.data.date}
              onChange={(e) => form.setData('date', e.target.value)}
            />
          </label>
          {error('date')}

          <label>
            Compte
            <select
              value={form.data.accountId}
              onChange={(e) => form.setData('accountId', e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Catégorie
            <select
              value={form.data.categoryId}
              onChange={(e) => form.setData('categoryId', e.target.value)}
            >
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Note (facultatif)
            <input value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} />
          </label>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" disabled={form.processing}>
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
            {editingId && (
              <button type="button" onClick={cancel}>
                Annuler
              </button>
            )}
          </div>
        </form>

        {transactions.length === 0 ? (
          <p>Aucune opération pour l'instant.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                <th>Date</th>
                <th>Description</th>
                <th>Catégorie</th>
                <th>Compte</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                  <td>{t.description}</td>
                  <td>
                    {t.categoryName ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: t.categoryColor ?? '#6b7280',
                          }}
                        />
                        {t.categoryName}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{t.accountName}</td>
                  <td
                    style={{ textAlign: 'right', color: t.type === 'income' ? 'green' : 'crimson' }}
                  >
                    {t.type === 'income' ? '+' : '−'} {euros(t.amount)}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button onClick={() => edit(t)}>Modifier</button>
                    <button onClick={() => remove(t)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  )
}
