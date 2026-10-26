import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CircleCheck, Plus } from 'lucide-react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'

type Kind = 'expense' | 'income'
type Item = {
  id: number
  date: string
  description: string
  amount: number
  note: string | null
  bankLabel: string | null
  accountName: string
  categoryId: number | null
}
type Category = { id: number; name: string; color: string | null }
type Props = {
  kind: Kind
  counts: Record<Kind, number>
  items: Item[]
  categories: Category[]
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const longDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
// Comparaison des noms : « Virement Léa » = « virement léa »
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#0ea5e9',
  '#ef4444',
  '#f59e0b',
  '#a855f7',
  '#f97316',
  '#14b8a6',
]

export default function TriageIndex({ kind, counts, items, categories }: Props) {
  // « Autres » n'est pas proposé comme choix : c'est ce qu'on cherche à vider
  const choices = categories.filter((c) => !same(c.name, 'autres'))
  // Opérations passées : elles vont en fin de file
  const [skipped, setSkipped] = useState<number[]>([])
  // Opération choisie dans la file ; sinon la première
  const [pickedId, setPickedId] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)

  const queue = useMemo(
    () => [
      ...items.filter((i) => !skipped.includes(i.id)),
      ...skipped.map((id) => items.find((i) => i.id === id)).filter((i): i is Item => !!i),
    ],
    [items, skipped]
  )
  const current = queue.find((i) => i.id === pickedId) ?? queue[0]

  // Nom modifié et choix « classer aussi les semblables », gardés par opération
  const [names, setNames] = useState<Record<number, string>>({})
  const [alone, setAlone] = useState<Record<number, boolean>>({})
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const description = current ? (names[current.id] ?? current.description) : ''
  const withSimilar = current ? !alone[current.id] : true

  // Les autres opérations au même nom, classées en même temps
  const similar = current
    ? items.filter((i) => i.id !== current.id && same(i.description, current.description))
    : []

  function classify(categoryId: number | null) {
    if (!current || processing) return
    const ids = [current.id, ...(withSimilar ? similar.map((i) => i.id) : [])]
    const renamed = description.trim() !== '' && description.trim() !== current.description
    router.post(
      '/triage',
      { ids, categoryId, ...(renamed ? { description: description.trim() } : {}) },
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => setProcessing(true),
        onFinish: () => setProcessing(false),
        onSuccess: () => setPickedId(null),
      }
    )
  }

  function skip() {
    if (!current) return
    setSkipped((prev) => [...prev.filter((id) => id !== current.id), current.id])
    setPickedId(null)
  }

  function createCategory(e: React.FormEvent) {
    e.preventDefault()
    if (newName.trim() === '') return
    router.post(
      '/categories',
      { name: newName.trim(), color: COLORS[categories.length % COLORS.length] },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setNewName('')
          setCreating(false)
        },
      }
    )
  }

  // Raccourcis : 1 à 9 pour les catégories, 0 pour garder, Échap pour passer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.closest('input, select, textarea') || e.metaKey || e.ctrlKey) return
      if (e.key === 'Escape') skip()
      if (e.key === '0') classify(null)
      const index = Number(e.key) - 1
      if (index >= 0 && index < 9 && choices[index]) classify(choices[index].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const keepLabel = kind === 'expense' ? 'Garder dans « Autres »' : 'Laisser sans catégorie'

  return (
    <>
      <Head title="À classer" />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <Link href="/transactions" className="b-link b-back">
                <ArrowLeft size={14} aria-hidden="true" />
                Opérations
              </Link>
              <h1 className="page__title">À classer</h1>
              <p className="page__description">
                {kind === 'expense'
                  ? 'Les dépenses rangées dans « Autres » ou sans catégorie.'
                  : 'Les revenus sans catégorie.'}{' '}
                Choisis une catégorie, l’opération suivante arrive aussitôt.
              </p>
            </div>
            <div className="page__actions">
              <div className="b-segment" role="group" aria-label="Type d’opérations">
                {(['expense', 'income'] as const).map((k) => (
                  <button
                    key={k}
                    aria-pressed={kind === k}
                    onClick={() => router.get('/triage', k === 'expense' ? {} : { kind: k })}
                  >
                    {k === 'expense' ? 'Dépenses' : 'Revenus'}
                    <span className="b-segment__count">{counts[k]}</span>
                  </button>
                ))}
              </div>
            </div>
          </header>

          {!current ? (
            <section className="panel b-triage__done">
              <CircleCheck size={28} aria-hidden="true" />
              <h2 className="section__title">Tout est classé</h2>
              <p className="section__description">
                {kind === 'expense'
                  ? 'Plus aucune dépense à ranger. Tes graphiques sont à jour.'
                  : 'Plus aucun revenu à ranger.'}
              </p>
              <div className="b-row">
                <Link href="/transactions" className="btn btn--secondary">
                  Voir les opérations
                </Link>
                {kind === 'expense' && counts.income > 0 && (
                  <Link href="/triage?kind=income" className="btn btn--primary">
                    Classer les revenus ({counts.income})
                  </Link>
                )}
              </div>
            </section>
          ) : (
            <div className="b-split b-triage">
              <section className="panel b-triage__card" aria-live="polite">
                <p className="b-triage__progress">
                  {items.length} restante{items.length > 1 ? 's' : ''}
                </p>

                <div className="b-triage__op">
                  <div>
                    <p className="b-triage__date">
                      {longDate(current.date)} · {current.accountName}
                    </p>
                    <input
                      className="b-triage__name"
                      aria-label="Description (modifiable)"
                      value={description}
                      onChange={(e) => setNames({ ...names, [current.id]: e.target.value })}
                    />
                    {(current.bankLabel || current.note) && (
                      <p className="b-triage__source">
                        {current.bankLabel && <>Sur le relevé : {current.bankLabel}</>}
                        {current.bankLabel && current.note && ' · '}
                        {current.note}
                      </p>
                    )}
                  </div>
                  <p
                    className={`b-triage__amount ${kind === 'income' ? 'b-amount--in' : 'b-amount--out'}`}
                  >
                    {kind === 'income' ? '+' : '−'} {euros(current.amount)}
                  </p>
                </div>

                <div className="b-triage__choices" role="group" aria-label="Catégorie">
                  {choices.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      className="b-chip"
                      disabled={processing}
                      onClick={() => classify(c.id)}
                    >
                      <span className="b-dot" style={{ background: c.color ?? 'var(--subtle)' }} />
                      {c.name}
                      {i < 9 && <kbd>{i + 1}</kbd>}
                    </button>
                  ))}
                  {creating ? (
                    <form className="b-chip b-chip--form" onSubmit={createCategory}>
                      <input
                        autoFocus
                        aria-label="Nom de la nouvelle catégorie"
                        placeholder="Nom"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && setCreating(false)}
                      />
                      <button type="submit" className="b-link">
                        Créer
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="b-chip b-chip--add"
                      onClick={() => setCreating(true)}
                    >
                      <Plus size={14} aria-hidden="true" />
                      Nouvelle catégorie
                    </button>
                  )}
                </div>

                {similar.length > 0 && (
                  <label className="b-triage__similar">
                    <input
                      type="checkbox"
                      checked={withSimilar}
                      onChange={(e) => setAlone({ ...alone, [current.id]: !e.target.checked })}
                    />
                    Classer aussi{' '}
                    {similar.length === 1 ? 'l’autre' : `les ${similar.length} autres`} «{' '}
                    {current.description} »
                  </label>
                )}

                <div className="b-row b-triage__actions">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={processing}
                    onClick={() => classify(null)}
                  >
                    {keepLabel}
                    <kbd>0</kbd>
                  </button>
                  <button type="button" className="b-link" onClick={skip}>
                    Passer pour l’instant
                  </button>
                </div>
              </section>

              <aside className="panel b-triage__queue">
                <h2 className="section__title">Ensuite</h2>
                <ul>
                  {queue.slice(0, 30).map((i) => (
                    <li key={i.id}>
                      <button
                        type="button"
                        aria-current={i.id === current.id ? 'true' : undefined}
                        onClick={() => setPickedId(i.id)}
                      >
                        <span className="b-triage__qname">{i.description}</span>
                        <span className="b-triage__qmeta">
                          {shortDate(i.date)} · {euros(i.amount)}
                          {skipped.includes(i.id) && ' · passée'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {queue.length > 30 && (
                  <p className="b-triage__more">et {queue.length - 30} autres…</p>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
