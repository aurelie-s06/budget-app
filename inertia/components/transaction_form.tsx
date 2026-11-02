import { useForm } from '@inertiajs/react'
import { useId } from 'react'
import { today } from '~/lib/dates'
import FieldError, { fieldProps } from '~/components/field_error'

type Option = { id: number; name: string }
type AccountOption = Option & { type?: string }
export type EditableTransaction = {
  id: number
  type: 'income' | 'expense' | 'transfer'
  amount: number
  date: string
  description: string
  note: string | null
  accountId: number
  toAccountId: number | null
  categoryId: number | null
}
type Props = {
  // Opération à modifier ; sans elle, le formulaire en crée une nouvelle
  transaction?: EditableTransaction | null
  // Date proposée pour une nouvelle opération (aujourd'hui par défaut)
  defaultDate?: string
  accounts: AccountOption[]
  categories: Option[]
  className?: string
  // Amène le focus sur le formulaire dès son ouverture
  focusOnMount?: boolean
  onDone?: () => void
  onCancel?: () => void
}

// Compte d'arrivée proposé pour un virement : un compte épargne de préférence
function defaultTarget(accounts: AccountOption[], fromId: string) {
  const others = accounts.filter((a) => a.id.toString() !== fromId)
  return (others.find((a) => a.type === 'epargne') ?? others[0])?.id.toString() ?? ''
}

export default function TransactionForm({
  transaction,
  defaultDate,
  accounts,
  categories,
  className = 'b-form',
  focusOnMount = false,
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
    toAccountId: transaction?.toAccountId?.toString() ?? '',
    categoryId: transaction?.categoryId?.toString() ?? '',
  })
  const isTransfer = form.data.type === 'transfer'

  function chooseType(type: EditableTransaction['type']) {
    form.setData((data) => ({
      ...data,
      type,
      toAccountId:
        type === 'transfer' && data.toAccountId === ''
          ? defaultTarget(accounts, data.accountId)
          : data.toAccountId,
    }))
  }

  function chooseAccount(accountId: string) {
    form.setData((data) => ({
      ...data,
      accountId,
      // Le compte d'arrivée ne peut pas être le compte de départ
      toAccountId:
        data.toAccountId === accountId ? defaultTarget(accounts, accountId) : data.toAccountId,
    }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.transform((data) => ({
      ...data,
      amount: Number(data.amount),
      accountId: Number(data.accountId),
      toAccountId: isTransfer ? Number(data.toAccountId) : null,
      categoryId: isTransfer || data.categoryId === '' ? null : Number(data.categoryId),
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
      <p className="field__hint">Les champs marqués d’un astérisque (*) sont obligatoires.</p>

      <div className="b-toggle b-toggle--3" role="group" aria-label="Type d’opération">
        <button
          type="button"
          aria-pressed={form.data.type === 'expense'}
          onClick={() => chooseType('expense')}
        >
          Dépense
        </button>
        <button
          type="button"
          aria-pressed={form.data.type === 'income'}
          onClick={() => chooseType('income')}
        >
          Revenu
        </button>
        <button
          type="button"
          aria-pressed={isTransfer}
          disabled={accounts.length < 2}
          title={accounts.length < 2 ? 'Il faut au moins deux comptes' : undefined}
          onClick={() => chooseType('transfer')}
        >
          Virement
        </button>
      </div>
      {isTransfer && (
        <p className="b-form__hint">
          Un virement vers un compte épargne compte comme de l’épargne, pas comme une dépense.
        </p>
      )}

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-description`}>
          Description <span className="b-item__meta">(100 caractères max.)</span>
        </label>
        <input
          id={`${uid}-description`}
          required
          maxLength={100}
          {...fieldProps(`${uid}-description-error`, form.errors.description)}
          className="field__input"
          autoFocus={focusOnMount}
          placeholder={isTransfer ? 'Épargne du mois' : undefined}
          value={form.data.description}
          onChange={(e) => form.setData('description', e.target.value)}
        />
        <FieldError id={`${uid}-description-error`} message={form.errors.description} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-amount`}>
          Montant (€)
        </label>
        <input
          id={`${uid}-amount`}
          required
          {...fieldProps(`${uid}-amount-error`, form.errors.amount)}
          type="number"
          step="0.01"
          min="0.01"
          className="field__input"
          value={form.data.amount}
          onChange={(e) => form.setData('amount', e.target.value)}
        />
        <FieldError id={`${uid}-amount-error`} message={form.errors.amount} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-date`}>
          Date
        </label>
        <input
          id={`${uid}-date`}
          required
          {...fieldProps(`${uid}-date-error`, form.errors.date)}
          type="date"
          className="field__input"
          value={form.data.date}
          onChange={(e) => form.setData('date', e.target.value)}
        />
        <FieldError id={`${uid}-date-error`} message={form.errors.date} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-account`}>
          {isTransfer ? 'Depuis le compte' : 'Compte'}
        </label>
        <select
          id={`${uid}-account`}
          required
          className="field__input"
          value={form.data.accountId}
          onChange={(e) => chooseAccount(e.target.value)}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {isTransfer ? (
        <div className="field">
          <label className="field__label" htmlFor={`${uid}-to-account`}>
            Vers le compte
          </label>
          <select
            id={`${uid}-to-account`}
            required
            {...fieldProps(`${uid}-to-account-error`, form.errors.toAccountId)}
            className="field__input"
            value={form.data.toAccountId}
            onChange={(e) => form.setData('toAccountId', e.target.value)}
          >
            {accounts
              .filter((a) => a.id.toString() !== form.data.accountId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.type === 'epargne' ? ' (épargne)' : ''}
                </option>
              ))}
          </select>
          <FieldError id={`${uid}-to-account-error`} message={form.errors.toAccountId} />
        </div>
      ) : (
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
      )}

      <div className="field">
        <label className="field__label" htmlFor={`${uid}-note`}>
          Note <span className="b-item__meta">(facultatif, 500 caractères max.)</span>
        </label>
        <input
          id={`${uid}-note`}
          maxLength={500}
          {...fieldProps(`${uid}-note-error`, form.errors.note)}
          className="field__input"
          value={form.data.note}
          onChange={(e) => form.setData('note', e.target.value)}
        />
        <FieldError id={`${uid}-note-error`} message={form.errors.note} />
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
