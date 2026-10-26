import { Head, router, useForm } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, CircleAlert, CircleCheck, FileText } from 'lucide-react'
import Footer from '~/components/footer'
import MainNav from '~/components/main_nav'

type Line = {
  date: string
  label: string
  amount: number
  direction: 'debit' | 'credit'
  description: string
  note: string | null
  // « cat:12 », « acc:3 » (virement avec ce compte) ou « »
  target: string
  // Lignes du même commerçant : un renommage s'applique à toutes
  key: string
  duplicateOf: { id: number; description: string } | null
}
type Preview = {
  fileName: string
  accountId: number
  from: string | null
  to: string | null
  openingBalance: number | null
  closingBalance: number | null
  // Les opérations lues expliquent l'écart entre les deux soldes du relevé
  complete: boolean | null
  // Solde du compte dans l'app à la fin du relevé, avant l'import
  appBalance: number | null
  lines: Line[]
}
type Props = {
  accounts: { id: number; name: string; type: string }[]
  categories: { id: number; name: string; color: string | null }[]
  preview: Preview | null
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
const longDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export default function ImportsIndex({ accounts, categories, preview }: Props) {
  return (
    <>
      <Head title="Importer un relevé" />
      <MainNav />
      <main className="app-main">
        <div className="page">
          <header className="page__header">
            <div>
              <Link href="/transactions" className="b-link b-back">
                <ArrowLeft size={14} aria-hidden="true" />
                Opérations
              </Link>
              <h1 className="page__title">Importer un relevé</h1>
              <p className="page__description">
                Dépose ton relevé BoursoBank en PDF : les opérations sont lues, nommées et classées.
                Tu vérifies avant d’enregistrer.
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
          ) : preview ? (
            <PreviewStep preview={preview} accounts={accounts} categories={categories} />
          ) : (
            <UploadStep accounts={accounts} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function UploadStep({ accounts }: { accounts: Props['accounts'] }) {
  // Compte courant proposé par défaut
  const main = accounts.find((a) => a.type === 'courant') ?? accounts[0]
  const form = useForm<{ statement: File | null; accountId: string }>({
    statement: null,
    accountId: main.id.toString(),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.post('/imports/preview')
  }

  return (
    <form className="panel b-form b-import" onSubmit={submit}>
      <div className="field">
        <label className="field__label" htmlFor="i-account">
          Compte du relevé
        </label>
        <select
          id="i-account"
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

      <label className="b-drop" data-filled={form.data.statement ? 'true' : undefined}>
        <FileText size={22} aria-hidden="true" />
        <span className="b-drop__title">
          {form.data.statement ? form.data.statement.name : 'Choisir le relevé (PDF)'}
        </span>
        <span className="b-drop__hint">
          {form.data.statement ? 'Clique pour en choisir un autre' : 'ou glisse-le ici'}
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => form.setData('statement', e.target.files?.[0] ?? null)}
        />
      </label>
      {form.errors.statement && <p className="field__error">{form.errors.statement}</p>}

      <p className="b-form__hint">
        Relevés de compte BoursoBank. Rien n’est enregistré avant ta confirmation, et les opérations
        déjà présentes sont repérées.
      </p>

      <div className="b-row">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!form.data.statement || form.processing}
        >
          {form.processing ? 'Lecture…' : 'Lire le relevé'}
        </button>
      </div>
    </form>
  )
}

// Ligne de l'aperçu : le montant reste du texte tant qu'on le modifie
type EditableLine = Line & { selected: boolean; amountText: string; noteText: string }

const toEditable = (l: Line): EditableLine => ({
  ...l,
  selected: l.duplicateOf === null,
  amountText: l.amount.toFixed(2).replace('.', ','),
  noteText: l.note ?? '',
})

// « 12,50 » ou « 12.50 » → 12.5 ; null si invalide
function parseAmount(text: string) {
  const value = Number(text.trim().replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null
}

// Ce qu'on compare pour savoir si une ligne a été modifiée
const FIELDS = ['date', 'description', 'target', 'direction', 'amountText', 'noteText'] as const

function PreviewStep({
  preview,
  accounts,
  categories,
}: {
  preview: Preview
  accounts: Props['accounts']
  categories: Props['categories']
}) {
  const original = useMemo(() => preview.lines.map(toEditable), [preview])
  // Lignes modifiables ; les doublons sont décochés
  const [lines, setLines] = useState(original)
  const [processing, setProcessing] = useState(false)
  // Ligne dont le panneau de modification est ouvert
  const [open, setOpen] = useState<number | null>(null)
  const account = accounts.find((a) => a.id === preview.accountId)
  const otherAccounts = accounts.filter((a) => a.id !== preview.accountId)

  const update = (index: number, changes: Partial<EditableLine>) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...changes } : l)))

  // Renommer ou classer une ligne fait de même pour les lignes identiques encore inchangées
  const updateSimilar = (index: number, field: 'description' | 'target', value: string) =>
    setLines((prev) => {
      const edited = prev[index]
      return prev.map((l, i) =>
        i === index || (!l.duplicateOf && l.key === edited.key && l[field] === edited[field])
          ? { ...l, [field]: value }
          : l
      )
    })

  const isEdited = (l: EditableLine, i: number) => FIELDS.some((f) => l[f] !== original[i][f])
  const errorOf = (l: EditableLine) => {
    if (!l.date) return 'Date manquante'
    if (l.description.trim() === '') return 'Description manquante'
    if (parseAmount(l.amountText) === null) return 'Montant invalide'
    return null
  }

  const selected = lines.filter((l) => l.selected)
  const invalid = selected.filter((l) => errorOf(l) !== null).length
  const edited = lines.filter(isEdited).length
  const changed = edited > 0 || lines.some((l, i) => l.selected !== original[i].selected)
  const duplicates = lines.filter((l) => l.duplicateOf).length
  const effect = (l: EditableLine) =>
    (l.direction === 'credit' ? 1 : -1) * (parseAmount(l.amountText) ?? 0)
  const totalIn = selected
    .filter((l) => l.direction === 'credit')
    .reduce((s, l) => s + effect(l), 0)
  const totalOut = Math.abs(
    selected.filter((l) => l.direction === 'debit').reduce((s, l) => s + effect(l), 0)
  )

  // Solde de l'app à la fin du relevé une fois l'import fait, comparé au relevé
  const after =
    preview.appBalance === null
      ? null
      : selected.reduce((sum, l) => sum + effect(l), preview.appBalance)
  const gap =
    after === null || preview.closingBalance === null ? null : after - preview.closingBalance

  function submit() {
    if (!confirm(`Importer ${selected.length} opération(s) dans « ${account?.name} » ?`)) return
    setProcessing(true)
    router.post(
      '/imports',
      {
        accountId: preview.accountId,
        lines: selected.map((l) => ({
          date: l.date,
          label: l.label,
          amount: parseAmount(l.amountText)!,
          direction: l.direction,
          description: l.description.trim(),
          note: l.noteText.trim() === '' ? null : l.noteText.trim(),
          target: l.target,
        })),
        learn: lines
          .filter((l) => l.duplicateOf)
          .map((l) => ({ id: l.duplicateOf!.id, label: l.label })),
      },
      { onFinish: () => setProcessing(false) }
    )
  }

  // Ce qu'affiche la ligne pour sa catégorie ou son virement
  function targetOf(l: EditableLine) {
    const [kind, id] = l.target.split(':')
    if (kind === 'cat') {
      const c = categories.find((x) => x.id === Number(id))
      return c ? { label: c.name, color: c.color } : null
    }
    if (kind === 'acc') {
      const a = accounts.find((x) => x.id === Number(id))
      return a
        ? { label: `${l.direction === 'debit' ? 'Vers' : 'Depuis'} ${a.name}`, color: null }
        : null
    }
    return null
  }

  const restore = (index: number) =>
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...original[i], selected: l.selected } : l))
    )

  function cancel() {
    if (changed && !confirm('Annuler l’import ? Tes modifications seront perdues.')) return
    router.visit('/imports')
  }

  return (
    <div className="b-import">
      <section className="panel b-review__summary">
        <div>
          <h2 className="section__title">Vérifie les opérations avant de valider</h2>
          <p className="section__description">
            {account?.name}
            {preview.from && preview.to
              ? ` · du ${longDate(preview.from)} au ${longDate(preview.to)}`
              : ''}{' '}
            · {preview.fileName}
          </p>
        </div>

        <ul className="b-checks">
          {preview.complete === true && (
            <li className="b-check b-check--ok">
              <CircleCheck size={16} aria-hidden="true" />
              Relevé lu en entier : {lines.length} opérations, de {euros(preview.openingBalance!)} à{' '}
              {euros(preview.closingBalance!)}.
            </li>
          )}
          {preview.complete === false && (
            <li className="b-check b-check--warn">
              <CircleAlert size={16} aria-hidden="true" />
              Les opérations lues n’expliquent pas l’écart entre les soldes du relevé : une ligne a
              peut-être été mal lue.
            </li>
          )}
          {duplicates > 0 && (
            <li className="b-check">
              <CircleCheck size={16} aria-hidden="true" />
              {duplicates === lines.length
                ? 'Toutes ces opérations sont déjà dans l’app.'
                : `${duplicates} opération(s) déjà dans l’app, décochée(s).`}
            </li>
          )}
          {gap !== null && preview.to && (
            <li className={`b-check ${Math.abs(gap) < 0.005 ? 'b-check--ok' : 'b-check--warn'}`}>
              {Math.abs(gap) < 0.005 ? (
                <CircleCheck size={16} aria-hidden="true" />
              ) : (
                <CircleAlert size={16} aria-hidden="true" />
              )}
              {Math.abs(gap) < 0.005
                ? `Après import, le solde de l’app au ${longDate(preview.to)} sera celui du relevé.`
                : `Après import, l’app affichera ${euros(after!)} au ${longDate(preview.to)}, le relevé ${euros(preview.closingBalance!)} (écart de ${euros(Math.abs(gap))}).`}
            </li>
          )}
        </ul>
      </section>

      <section className="panel b-review">
        <header className="b-review__head">
          <label className="b-review__all">
            <input
              type="checkbox"
              checked={selected.length === lines.length}
              onChange={(e) =>
                setLines((prev) => prev.map((l) => ({ ...l, selected: e.target.checked })))
              }
            />
            Tout cocher
          </label>
          <span className="b-review__tip">Clique sur une opération pour la modifier.</span>
        </header>

        <ul className="b-review__list">
          {lines.map((l, i) => {
            const error = l.selected ? errorOf(l) : null
            const target = targetOf(l)
            const amount = parseAmount(l.amountText)
            const isOpen = open === i
            return (
              <li
                key={i}
                className={[
                  'b-review__item',
                  l.selected ? '' : 'is-off',
                  isOpen ? 'is-open' : '',
                ].join(' ')}
              >
                <div className="b-review__row">
                  <input
                    type="checkbox"
                    className="b-review__check"
                    aria-label={`Importer « ${l.description} »`}
                    checked={l.selected}
                    onChange={(e) => update(i, { selected: e.target.checked })}
                  />
                  <button
                    type="button"
                    className="b-review__main"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="b-review__date">{shortDate(l.date)}</span>
                    <span className="b-review__text">
                      <span className="b-review__title">
                        {l.description || <em>Sans description</em>}
                      </span>
                      <span className="b-review__meta">
                        {target ? (
                          <span className="b-review__cat">
                            {target.color !== undefined && (
                              <span
                                className="b-dot"
                                style={{ background: target.color ?? 'var(--subtle)' }}
                              />
                            )}
                            {target.label}
                          </span>
                        ) : (
                          <span className="b-review__cat is-empty">Sans catégorie</span>
                        )}
                        {l.duplicateOf && <span className="b-badge">Déjà dans l’app</span>}
                        {isEdited(l, i) && <span className="b-badge b-badge--ink">Modifié</span>}
                        {error && <span className="b-badge b-badge--out">{error}</span>}
                      </span>
                    </span>
                    <span
                      className={`b-review__amount ${l.direction === 'credit' ? 'b-amount--in' : 'b-amount--out'}`}
                    >
                      {l.direction === 'credit' ? '+' : '−'} {amount === null ? '—' : euros(amount)}
                    </span>
                    <ChevronDown size={16} className="b-review__chevron" aria-hidden="true" />
                  </button>
                </div>

                {isOpen && (
                  <div className="b-review__edit">
                    <p className="b-review__source">Sur le relevé : {l.label}</p>
                    <div className="b-review__fields">
                      <div className="field b-review__wide">
                        <label className="field__label" htmlFor={`e-desc-${i}`}>
                          Description
                        </label>
                        <input
                          id={`e-desc-${i}`}
                          className="field__input"
                          value={l.description}
                          autoFocus
                          onChange={(e) => updateSimilar(i, 'description', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label className="field__label" htmlFor={`e-cat-${i}`}>
                          Catégorie
                        </label>
                        <select
                          id={`e-cat-${i}`}
                          className="field__input"
                          value={l.target}
                          onChange={(e) => updateSimilar(i, 'target', e.target.value)}
                        >
                          <option value="">Aucune</option>
                          <optgroup label="Catégories">
                            {categories.map((c) => (
                              <option key={c.id} value={`cat:${c.id}`}>
                                {c.name}
                              </option>
                            ))}
                          </optgroup>
                          {otherAccounts.length > 0 && (
                            <optgroup
                              label={l.direction === 'debit' ? 'Virement vers' : 'Virement depuis'}
                            >
                              {otherAccounts.map((a) => (
                                <option key={a.id} value={`acc:${a.id}`}>
                                  {a.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      <div className="field">
                        <label className="field__label" htmlFor={`e-date-${i}`}>
                          Date
                        </label>
                        <input
                          id={`e-date-${i}`}
                          type="date"
                          className="field__input"
                          value={l.date}
                          onChange={(e) => update(i, { date: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <span className="field__label">Type</span>
                        <div className="b-toggle">
                          <button
                            type="button"
                            aria-pressed={l.direction === 'debit'}
                            onClick={() => update(i, { direction: 'debit' })}
                          >
                            Dépense
                          </button>
                          <button
                            type="button"
                            aria-pressed={l.direction === 'credit'}
                            onClick={() => update(i, { direction: 'credit' })}
                          >
                            Revenu
                          </button>
                        </div>
                      </div>
                      <div className="field">
                        <label className="field__label" htmlFor={`e-amount-${i}`}>
                          Montant (€)
                        </label>
                        <input
                          id={`e-amount-${i}`}
                          className="field__input"
                          inputMode="decimal"
                          aria-invalid={amount === null ? 'true' : 'false'}
                          value={l.amountText}
                          onChange={(e) => update(i, { amountText: e.target.value })}
                        />
                      </div>
                      <div className="field b-review__wide">
                        <label className="field__label" htmlFor={`e-note-${i}`}>
                          Note
                        </label>
                        <input
                          id={`e-note-${i}`}
                          className="field__input"
                          placeholder="Facultatif"
                          value={l.noteText}
                          onChange={(e) => update(i, { noteText: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="b-row b-review__actions">
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => setOpen(null)}
                      >
                        Fermer
                      </button>
                      {isEdited(l, i) && (
                        <button type="button" className="b-link" onClick={() => restore(i)}>
                          Rétablir les valeurs du relevé
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* Toujours visible en bas de l'écran */}
      <div className="b-import__bar">
        <p className="b-import__totals">
          <strong>{selected.length}</strong> à importer ·{' '}
          <span className="b-amount--in">+ {euros(totalIn)}</span> ·{' '}
          <span className="b-amount--out">− {euros(totalOut)}</span>
          {edited > 0 && (
            <>
              {' '}
              · {edited} modifiée(s) ·{' '}
              <button type="button" className="b-link" onClick={() => setLines(original)}>
                Tout rétablir
              </button>
            </>
          )}
        </p>
        <div className="b-row">
          <button type="button" className="btn btn--secondary" onClick={cancel}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={selected.length === 0 || invalid > 0 || processing}
            title={invalid > 0 ? 'Corrige les lignes signalées' : undefined}
            onClick={submit}
          >
            {processing
              ? 'Import…'
              : invalid > 0
                ? `${invalid} ligne(s) à corriger`
                : selected.length === 0
                  ? 'Aucune opération à importer'
                  : `Valider l’import (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}
