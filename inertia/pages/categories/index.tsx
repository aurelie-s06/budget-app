import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'
import FieldError, { fieldProps } from '~/components/field_error'

type Category = {
  id: number
  name: string
  color: string | null
  monthlyBudget: number | string | null
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function CategoriesIndex({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const form = useForm({ name: '', color: '#6b6f76', monthlyBudget: '' })

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
      color: c.color ?? '#6b6f76',
      monthlyBudget: c.monthlyBudget?.toString() ?? '',
    })
    document.getElementById('name')?.focus()
  }

  function cancel() {
    setEditingId(null)
    form.reset()
  }

  function remove(c: Category) {
    if (confirm(`Supprimer la catégorie « ${c.name} » ?`)) router.delete(`/categories/${c.id}`)
  }

  return (
    <>
      <Head title="Catégories" />
      <MainNav />
      <main id="contenu" tabIndex={-1} className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <h1 className="page__title">Catégories</h1>
              <p className="page__description">Classe tes dépenses et fixe un budget mensuel.</p>
            </div>
          </header>

          <div className="b-split">
            <section className="panel">
              {categories.length === 0 ? (
                <p className="b-empty">Aucune catégorie pour l’instant.</p>
              ) : (
                <ul className="b-list">
                  {categories.map((c) => (
                    <li key={c.id} className="b-item">
                      <span className="b-dot" style={{ background: c.color ?? 'var(--subtle)' }} />
                      <div className="b-item__main">
                        <div className="b-item__title">{c.name}</div>
                        <div className="b-item__meta">
                          {c.monthlyBudget !== null
                            ? `Budget : ${euros(Number(c.monthlyBudget))} / mois`
                            : 'Pas de budget'}
                        </div>
                      </div>
                      <div className="b-actions">
                        <button type="button" className="b-link" onClick={() => edit(c)}>
                          Modifier<span className="sr-only"> {c.name}</span>
                        </button>
                        <button
                          type="button"
                          className="b-link b-link--danger"
                          onClick={() => remove(c)}
                        >
                          Supprimer<span className="sr-only"> {c.name}</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <form className="panel b-form" onSubmit={submit}>
              <h2 className="section__title">
                {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <p className="field__hint">
                Les champs marqués d’un astérisque (*) sont obligatoires.
              </p>

              <div className="field">
                <label className="field__label" htmlFor="name">
                  Nom <span className="b-item__meta">(50 caractères max.)</span>
                </label>
                <input
                  id="name"
                  required
                  maxLength={50}
                  {...fieldProps('name-error', form.errors.name)}
                  className="field__input"
                  value={form.data.name}
                  onChange={(e) => form.setData('name', e.target.value)}
                />
                <FieldError id="name-error" message={form.errors.name} />
              </div>

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

              <div className="field">
                <label className="field__label" htmlFor="budget">
                  Budget mensuel (€) <span className="b-item__meta">(facultatif)</span>
                </label>
                <input
                  id="budget"
                  {...fieldProps('budget-error', form.errors.monthlyBudget)}
                  type="number"
                  step="0.01"
                  min="0"
                  className="field__input"
                  value={form.data.monthlyBudget}
                  onChange={(e) => form.setData('monthlyBudget', e.target.value)}
                />
                <FieldError id="budget-error" message={form.errors.monthlyBudget} />
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
