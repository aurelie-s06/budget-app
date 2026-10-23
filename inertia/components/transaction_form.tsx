import { useForm } from '@inertiajs/react'
import { useId } from 'react'

type Option = { id: number; name: string }
export type EditableTransaction = {
  id: number
  type: 'income' | 'expense'
  amount: number
  date: string
  description: string
  note: string | null
  accountId: number
  categoryId: number | null
}
type Props = {
  // Opération à modifier ; sans elle, le formulaire en crée une nouvelle
  transaction?: EditableTransaction | null
  // Date proposée pour une nouvelle opération (aujourd'hui par défaut)
  defaultDate?: string
  accounts: Option[]
  categories: Option[]
  className?: string
  onDone?: () => void
  onCancel?: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

export default function TransactionForm({
  transaction,
  defaultDate,
  accounts,
  categories,
  className = 'b-form',
  onDone,
  onCancel,
}: Props) {
  // Préfixe des id : plusieurs formulaires peuvent coexister sur une page
  const uid = useId()
  const form = useForm({
    type: transaction?.type ?? ('expense' as EditableTransaction['type']),
    amount: transaction?.amount.toString() ?? '',
    date: transaction?.date ?? defaultDate ?? today(),
    description: transaction?.description ?? '',
    note: transaction?.note ?? '',
    accountId: transaction?.accountId.toString() ?? accounts[0]?.id.toString() ?? '',
    categoryId: transaction?.categoryId?.toString() ?? '',
  })

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
      preserveScroll: true,
      onSuccess: () => {
        form.reset()
        onDone?.()
      },
    }
    if (transaction) form.put(`/transactions/${transaction.id}`, options)
    else form.post('/transactions', options)
  }

  return (
    <form className={className} onSubmit={submit}>
      <h2 className="section__title">
        {transaction ? "Modifier l'opération" : 'Nouvelle opération'}
      </h2>

      <div className="b-toggle">
        <button
          type="button"
          aria-pressed={form.data.type === 'expense'}
          onClick={() => form.setData('type', 'expense')}
        >
          Dépense
        </button>
        <button
          type="button"
          aria-pressed={form.data.type === 'income'}
          onClick={() => form.setData('type', 'income')}
        >
          Revenu
        </button>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-description`}>
          Description
        </label>
        <input
          id={`${uid}-description`}
          className="field__input"
          value={form.data.description}
          onChange={(e) => form.setData('description', e.target.value)}
        />
        {form.errors.description && <p className="field__error">{form.errors.description}</p>}
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-amount`}>
          Montant (€)
        </label>
        <input
          id={`${uid}-amount`}
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
        <label className="field__label" htmlFor={`${uid}-date`}>
          Date
        </label>
        <input
          id={`${uid}-date`}
          type="date"
          className="field__input"
          value={form.data.date}
          onChange={(e) => form.setData('date', e.target.value)}
        />
        {form.errors.date && <p className="field__error">{form.errors.date}</p>}
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-account`}>
          Compte
        </label>
        <select
          id={`${uid}-account`}
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

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-category`}>
          Catégorie
        </label>
        <select
          id={`${uid}-category`}
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

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-note`}>
          Note
        </label>
        <input
          id={`${uid}-note`}
          className="field__input"
          placeholder="Facultatif"
          value={form.data.note}
          onChange={(e) => form.setData('note', e.target.value)}
        />
      </div>

      <div className="b-row">
        <button type="submit" className="btn btn--primary" disabled={form.processing}>
          {transaction ? 'Enregistrer' : 'Ajouter'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
