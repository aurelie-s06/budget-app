import { router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import { Target } from 'lucide-react'

export type Goal = {
  name: string
  target: number
  startDate: string
  deadline: string | null
  saved: number
  remaining: number
  percent: number
  monthlyNeeded: number | null
}

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const longDate = (date: string) =>
  new Date(`${date}T00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

/**
 * Objectif d'épargne : progression, et formulaire pour le définir ou le modifier.
 */
export default function SavingsGoal({ goal }: { goal: Goal | null }) {
  const [editing, setEditing] = useState(false)
  const empty = {
    name: '',
    targetAmount: '',
    // Par défaut, on compte l'épargne depuis le début du mois
    startDate: `${new Date().toISOString().slice(0, 7)}-01`,
    deadline: '',
  }
  const form = useForm(
    goal
      ? {
          name: goal.name,
          targetAmount: goal.target.toString(),
          startDate: goal.startDate,
          deadline: goal.deadline ?? '',
        }
      : empty
  )

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.transform((data) => ({
      ...data,
      targetAmount: Number(data.targetAmount),
      deadline: data.deadline === '' ? null : data.deadline,
    }))
    form.put('/savings-goal', {
      preserveScroll: true,
      onSuccess: () => {
        // « Annuler » reviendra désormais aux valeurs enregistrées
        form.setDefaults()
        setEditing(false)
      },
    })
  }

  function remove() {
    if (confirm(`Supprimer l'objectif « ${goal?.name} » ?`)) {
      router.delete('/savings-goal', {
        preserveScroll: true,
        onSuccess: () => {
          form.setDefaults(empty)
          form.setData(empty)
        },
      })
    }
  }

  if (editing) {
    return (
      <form className="b-form b-goal-form" onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="goal-name">
            Objectif
          </label>
          <input
            id="goal-name"
            className="field__input"
            placeholder="Vacances, voiture…"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
          />
          {form.errors.name && <p className="field__error">{form.errors.name}</p>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="goal-target">
            Montant à atteindre (€)
          </label>
          <input
            id="goal-target"
            className="field__input"
            type="number"
            min="0"
            step="0.01"
            value={form.data.targetAmount}
            onChange={(e) => form.setData('targetAmount', e.target.value)}
          />
          {form.errors.targetAmount && <p className="field__error">{form.errors.targetAmount}</p>}
        </div>
        <div className="b-row">
          <div className="field">
            <label className="field__label" htmlFor="goal-start">
              Depuis le
            </label>
            <input
              id="goal-start"
              className="field__input"
              type="date"
              value={form.data.startDate}
              onChange={(e) => form.setData('startDate', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="goal-deadline">
              Avant le <span className="b-item__meta">(facultatif)</span>
            </label>
            <input
              id="goal-deadline"
              className="field__input"
              type="date"
              value={form.data.deadline}
              onChange={(e) => form.setData('deadline', e.target.value)}
            />
          </div>
        </div>
        <div className="b-row">
          <button className="btn btn--primary btn--sm" disabled={form.processing}>
            Enregistrer
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => {
              form.reset()
              form.clearErrors()
              setEditing(false)
            }}
          >
            Annuler
          </button>
        </div>
      </form>
    )
  }

  if (!goal) {
    return (
      <div className="b-goal b-goal--empty">
        <Target size={22} aria-hidden="true" />
        <p>Fixe-toi un montant à mettre de côté et suis ta progression.</p>
        <button className="btn btn--secondary btn--sm" onClick={() => setEditing(true)}>
          Définir un objectif
        </button>
      </div>
    )
  }

  const reached = goal.remaining <= 0
  const late = goal.deadline !== null && goal.deadline < new Date().toISOString().slice(0, 10)

  return (
    <div className="b-goal">
      <div className="b-goal__head">
        <span className="b-goal__name">{goal.name}</span>
        <span className="b-goal__percent">{Math.min(goal.percent, 100)} %</span>
      </div>
      <div className="b-tile__value">
        {euros(Math.max(goal.saved, 0))}
        <span className="b-goal__target"> / {euros(goal.target)}</span>
      </div>
      <div
        className="b-bar b-goal__bar"
        role="progressbar"
        aria-valuenow={Math.min(goal.percent, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression de l'objectif ${goal.name}`}
      >
        <div className="b-bar__fill" style={{ width: `${Math.min(goal.percent, 100)}%` }} />
      </div>
      <p className="b-tile__hint">
        {reached
          ? 'Objectif atteint, bravo !'
          : late
            ? `Échéance dépassée · il manque ${euros(goal.remaining)}`
            : goal.monthlyNeeded !== null
              ? `${euros(goal.monthlyNeeded)} / mois jusqu'en ${longDate(goal.deadline!)}`
              : `Encore ${euros(goal.remaining)}`}
      </p>
      <div className="b-actions b-goal__actions">
        <button className="b-link" onClick={() => setEditing(true)}>
          Modifier
        </button>
        <button className="b-link b-link--danger" onClick={remove}>
          Supprimer
        </button>
      </div>
    </div>
  )
}
