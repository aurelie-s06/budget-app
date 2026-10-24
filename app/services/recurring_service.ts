import { DateTime } from 'luxon'
import type User from '#models/user'
import type RecurringTransaction from '#models/recurring_transaction'

const STEP = { weekly: 'weeks', monthly: 'months', yearly: 'years' } as const

/**
 * Date de la n-ième échéance (0 = la première).
 * Calculée depuis la date de départ, pas depuis l'échéance précédente :
 * un loyer du 31 tombe le 28 février puis de nouveau le 31 mars.
 */
export function occurrenceDate(rule: RecurringTransaction, n: number) {
  const unit = STEP[rule.frequency as keyof typeof STEP]
  return rule.startDate.plus({ [unit]: n })
}

/**
 * Prochaine échéance pas encore créée, ou null si la récurrence est terminée.
 */
export function nextOccurrence(rule: RecurringTransaction) {
  const next = occurrenceDate(rule, rule.generatedCount)
  if (rule.endDate && next > rule.endDate) return null
  return next
}

/**
 * Crée les opérations de toutes les échéances arrivées (aujourd'hui compris).
 * Une opération supprimée à la main n'est pas recréée : on compte les échéances, pas les opérations.
 * Renvoie le nombre d'opérations créées.
 */
export async function generateRecurring(user: User) {
  const today = DateTime.now().startOf('day')
  const rules = await user.related('recurringTransactions').query()
  let created = 0

  for (const rule of rules) {
    let next = nextOccurrence(rule)
    if (!next || next > today) continue

    while (next && next <= today) {
      await user.related('transactions').create({
        type: rule.type,
        amount: rule.amount,
        date: next,
        description: rule.description,
        accountId: rule.accountId,
        toAccountId: rule.toAccountId,
        categoryId: rule.categoryId,
        recurringId: rule.id,
      })
      rule.generatedCount++
      created++
      next = nextOccurrence(rule)
    }
    await rule.save()
  }
  return created
}

/**
 * Nombre d'échéances déjà passées (aujourd'hui compris) : sert à reprendre
 * une récurrence modifiée à partir de la prochaine échéance, sans recréer le passé.
 */
export function pastOccurrences(rule: RecurringTransaction) {
  const today = DateTime.now().startOf('day')
  let n = 0
  while (
    occurrenceDate(rule, n) <= today &&
    (!rule.endDate || occurrenceDate(rule, n) <= rule.endDate)
  )
    n++
  return n
}
