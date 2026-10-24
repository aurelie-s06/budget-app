import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'

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
      <main className="app-main">
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
                        <button className="b-link" onClick={() => edit(c)}>
                          Modifier
                        </button>
                        <button className="b-link b-link--danger" onClick={() => remove(c)}>
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
                {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
                  Budget mensuel (€)
                </label>
                <input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Facultatif"
                  className="field__input"
                  value={form.data.monthlyBudget}
                  onChange={(e) => form.setData('monthlyBudget', e.target.value)}
                />
                {form.errors.monthlyBudget && (
                  <p className="field__error">{form.errors.monthlyBudget}</p>
                )}
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
