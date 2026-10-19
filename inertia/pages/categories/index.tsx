import { useForm, router } from '@inertiajs/react'
import { useState } from 'react'

type Category = {
  id: number
  name: string
  color: string | null
  monthlyBudget: number | string | null
}

export default function CategoriesIndex({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const form = useForm({ name: '', color: '#6b7280', monthlyBudget: '' })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.transform((data) => ({
      ...data,
      monthlyBudget: data.monthlyBudget === '' ? null : Number(data.monthlyBudget),
    }))
    const options = {
      onSuccess: () => {
        form.reset()
        setEditingId(null)
      },
    }
    if (editingId) form.put(`/categories/${editingId}`, options)
    else form.post('/categories', options)
  }

  function edit(c: Category) {
    setEditingId(c.id)
    form.setData({
      name: c.name,
      color: c.color ?? '#6b7280',
      monthlyBudget: c.monthlyBudget?.toString() ?? '',
    })
  }

  function cancel() {
    setEditingId(null)
    form.reset()
  }

  function remove(c: Category) {
    if (confirm(`Supprimer la catégorie « ${c.name} » ?`)) {
      router.delete(`/categories/${c.id}`)
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Mes catégories</h1>

      <form onSubmit={submit} style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
        <h2>{editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>

        <label>
          Nom
          <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
        </label>
        {form.errors.name && <p style={{ color: 'crimson' }}>{form.errors.name}</p>}

        <label>
          Couleur
          <input
            type="color"
            value={form.data.color}
            onChange={(e) => form.setData('color', e.target.value)}
          />
        </label>

        <label>
          Budget mensuel (€, facultatif)
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.data.monthlyBudget}
            onChange={(e) => form.setData('monthlyBudget', e.target.value)}
          />
        </label>
        {form.errors.monthlyBudget && (
          <p style={{ color: 'crimson' }}>{form.errors.monthlyBudget}</p>
        )}

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

      {categories.length === 0 ? (
        <p>Aucune catégorie pour l'instant.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categories.map((c) => (
            <li
              key={c.id}
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
                  background: c.color ?? '#6b7280',
                }}
              />
              <strong style={{ flex: 1 }}>{c.name}</strong>
              <span>
                {c.monthlyBudget !== null ? `${Number(c.monthlyBudget).toFixed(2)} € / mois` : '—'}
              </span>
              <button onClick={() => edit(c)}>Modifier</button>
              <button onClick={() => remove(c)}>Supprimer</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
