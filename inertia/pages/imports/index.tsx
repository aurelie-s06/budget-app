import { Head, router, useForm } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { ArrowLeft, CircleAlert, CircleCheck, FileText } from 'lucide-react'
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

function PreviewStep({
  preview,
  accounts,
  categories,
}: {
  preview: Preview
  accounts: Props['accounts']
  categories: Props['categories']
}) {
  // Lignes modifiables ; les doublons sont décochés
  const [lines, setLines] = useState(() =>
    preview.lines.map((l) => ({ ...l, selected: l.duplicateOf === null }))
  )
  const [processing, setProcessing] = useState(false)
  const account = accounts.find((a) => a.id === preview.accountId)
  const otherAccounts = accounts.filter((a) => a.id !== preview.accountId)

  const update = (index: number, changes: Partial<(typeof lines)[number]>) =>
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

  const selected = lines.filter((l) => l.selected)
  const duplicates = lines.filter((l) => l.duplicateOf).length
  const effect = (l: Line) => (l.direction === 'credit' ? l.amount : -l.amount)

  // Solde de l'app à la fin du relevé une fois l'import fait, comparé au relevé
  const after =
    preview.appBalance === null
      ? null
      : selected.reduce((sum, l) => sum + effect(l), preview.appBalance)
  const gap =
    after === null || preview.closingBalance === null ? null : after - preview.closingBalance

  function submit() {
    setProcessing(true)
    router.post(
      '/imports',
      {
        accountId: preview.accountId,
        lines: selected.map(({ date, label, amount, direction, description, note, target }) => ({
          date,
          label,
          amount,
          direction,
          description,
          note,
          target,
        })),
        learn: lines
          .filter((l) => l.duplicateOf)
          .map((l) => ({ id: l.duplicateOf!.id, label: l.label })),
      },
      { onFinish: () => setProcessing(false) }
    )
  }

  return (
    <div className="b-import">
      <section className="panel b-import__summary">
        <div>
          <h2 className="section__title">{preview.fileName}</h2>
          <p className="section__description">
            {account?.name}
            {preview.from && preview.to
              ? ` · du ${longDate(preview.from)} au ${longDate(preview.to)}`
              : ''}
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

      <section className="panel">
        <div className="b-table-wrap">
          <table className="b-table b-import__table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Tout cocher"
                    checked={selected.length === lines.length}
                    onChange={(e) =>
                      setLines((prev) => prev.map((l) => ({ ...l, selected: e.target.checked })))
                    }
                  />
                </th>
                <th>Date</th>
                <th>Description</th>
                <th>Catégorie</th>
                <th className="b-num">Montant</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className={l.selected ? '' : 'b-import__off'}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Importer « ${l.description} »`}
                      checked={l.selected}
                      onChange={(e) => update(i, { selected: e.target.checked })}
                    />
                  </td>
                  <td className="b-item__meta" style={{ whiteSpace: 'nowrap' }}>
                    {shortDate(l.date)}
                  </td>
                  <td>
                    <input
                      className="field__input b-input-sm"
                      aria-label="Description"
                      value={l.description}
                      onChange={(e) => updateSimilar(i, 'description', e.target.value)}
                    />
                    <div className="b-import__label" title={l.label}>
                      {l.duplicateOf
                        ? `Déjà dans l’app : « ${l.duplicateOf.description} »`
                        : l.label}
                      {l.note ? ` · ${l.note}` : ''}
                    </div>
                  </td>
                  <td>
                    <select
                      className="field__input b-input-sm"
                      aria-label="Catégorie"
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
                  </td>
                  <td
                    className={`b-num b-amount ${l.direction === 'credit' ? 'b-amount--in' : 'b-amount--out'}`}
                  >
                    {l.direction === 'credit' ? '+' : '−'} {euros(l.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="b-row b-import__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={selected.length === 0 || processing}
            onClick={submit}
          >
            {selected.length === 0
              ? 'Aucune opération à importer'
              : selected.length === 1
                ? 'Importer 1 opération'
                : `Importer ${selected.length} opérations`}
          </button>
          <Link href="/imports" className="btn btn--secondary">
            Changer de relevé
          </Link>
        </div>
      </section>
    </div>
  )
}
