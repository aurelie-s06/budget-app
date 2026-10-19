import { useForm, router } from '@inertiajs/react'
import { useState } from 'react'

type Account = {
  id: number
  name: string
  type: 'courant' | 'epargne' | 'especes' | 'autre'
  color: string | null
  initialBalance: number
  balance: number
}

const TYPE_LABELS = {
  courant: 'Compte courant',
  epargne: 'Épargne',
  especes: 'Espèces',
  autre: 'Autre',
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function AccountsIndex({ accounts }: { accounts: Account[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const form = useForm({
    name: '',
    type: 'courant' as Account['type'],
    initialBalance: '0',
    color: '#6366f1',
  })

  const total = accounts.reduce((sum, a) => sum + a.balance, 0)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.transform((data) => ({ ...data, initialBalance: Number(data.initialBalance) }))
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
      color: a.color ?? '#6366f1',
    })
  }

  function cancel() {
    setEditingId(null)
    form.reset()
  }

  function remove(a: Account) {
    if (confirm(`Supprimer « ${a.name} » ? Toutes ses opérations seront aussi supprimées.`)) {
      router.delete(`/accounts/${a.id}`)
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Mes comptes</h1>
      <p>
        Solde total : <strong>{euros(total)}</strong>
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
        <h2>{editingId ? 'Modifier le compte' : 'Nouveau compte'}</h2>

        <label>
          Nom
          <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
        </label>
        {form.errors.name && <p style={{ color: 'crimson' }}>{form.errors.name}</p>}

        <label>
          Type
          <select
            value={form.data.type}
            onChange={(e) => form.setData('type', e.target.value as Account['type'])}
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Solde initial (€)
          <input
            type="number"
            step="0.01"
            value={form.data.initialBalance}
            onChange={(e) => form.setData('initialBalance', e.target.value)}
          />
        </label>
        {form.errors.initialBalance && (
          <p style={{ color: 'crimson' }}>{form.errors.initialBalance}</p>
        )}

        <label>
          Couleur
          <input
            type="color"
            value={form.data.color}
            onChange={(e) => form.setData('color', e.target.value)}
          />
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

      {accounts.length === 0 ? (
        <p>Aucun compte pour l'instant.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {accounts.map((a) => (
            <li
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0',
                borderBottom: '1px solid #ddd',
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: a.color ?? '#6366f1',
                }}
              />
              <div style={{ flex: 1 }}>
                <strong>{a.name}</strong>
                <br />
                <small>{TYPE_LABELS[a.type]}</small>
              </div>
              <strong style={{ color: a.balance < 0 ? 'crimson' : undefined }}>
                {euros(a.balance)}
              </strong>
              <button onClick={() => edit(a)}>Modifier</button>
              <button onClick={() => remove(a)}>Supprimer</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
