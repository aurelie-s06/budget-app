import { DateTime } from 'luxon'
import type User from '#models/user'
import SavingsGoal from '#models/savings_goal'

const round = (n: number) => Math.round(n * 100) / 100

/**
 * Chiffres clés d'un mois : revenus, dépenses, épargne, taux de dépenses,
 * budget par catégorie et opérations du mois.
 */
export async function monthSummary(user: User, month: DateTime) {
  const start = month.startOf('month').toISODate()!
  const end = month.endOf('month').toISODate()!

  const transactions = await user
    .related('transactions')
    .query()
    .preload('category')
    .whereBetween('date', [start, end])
    .orderBy('date', 'desc')
    .orderBy('id', 'desc')

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  // Salaire : revenus rangés dans la catégorie « Salaire »
  const salary = transactions
    .filter((t) => t.type === 'income' && t.category?.name.trim().toLowerCase() === 'salaire')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Taux de dépenses : pas calculé si aucun revenu
  const spendingRate = income > 0 ? Math.round((expenses / income) * 1000) / 10 : null

  // Budget par catégorie
  const categories = await user.related('categories').query().orderBy('name')
  const budgets = categories
    .map((c) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === c.id)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const budget = c.monthlyBudget !== null ? Number(c.monthlyBudget) : null
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        spent: round(spent),
        budget,
        remaining: budget !== null ? round(budget - spent) : null,
        percent: budget ? Math.round((spent / budget) * 100) : null,
      }
    })
    .filter((b) => b.budget !== null || b.spent > 0)

  // Dépenses sans catégorie : comptées dans la répartition
  const uncategorized = transactions
    .filter((t) => t.type === 'expense' && t.categoryId === null)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    income: round(income),
    salary: round(salary),
    otherIncome: round(income - salary),
    expenses: round(expenses),
    savings: round(income - expenses),
    spendingRate,
    budgets,
    uncategorized: round(uncategorized),
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type as 'income' | 'expense',
      amount: Number(t.amount),
      date: t.date.toISODate() ?? '',
      description: t.description,
      note: t.note,
      accountId: t.accountId,
      categoryId: t.categoryId,
      categoryName: t.category?.name ?? null,
      categoryColor: t.category?.color ?? null,
    })),
  }
}

/**
 * Historique mois par mois, du plus ancien au plus récent (mois en cours inclus) :
 * revenus, dépenses, épargne et solde total en fin de mois.
 * `count` : nombre de mois, ou 'all' pour remonter à la première opération.
 */
export async function monthlyHistory(user: User, count: number | 'all') {
  const now = DateTime.now().startOf('month')
  const accounts = await user.related('accounts').query()
  const transactions = await user.related('transactions').query().orderBy('date', 'asc')

  const oldest = transactions[0]?.date.startOf('month') ?? now
  const first = count === 'all' ? (oldest < now ? oldest : now) : now.minus({ months: count - 1 })
  const length = Math.floor(now.diff(first, 'months').months) + 1

  // Solde au début de la période : soldes initiaux + opérations antérieures
  let balance = accounts.reduce((sum, a) => sum + Number(a.initialBalance), 0)
  for (const t of transactions) {
    if (t.date.toMillis() >= first.toMillis()) break
    balance += t.type === 'income' ? Number(t.amount) : -Number(t.amount)
  }

  return Array.from({ length }, (_, i) => {
    const month = first.plus({ months: i })
    const key = month.toFormat('yyyy-MM')
    const ofMonth = transactions.filter((t) => t.date.toFormat('yyyy-MM') === key)
    const sum = (type: string) =>
      ofMonth.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0)
    const income = sum('income')
    const expenses = sum('expense')
    balance += income - expenses
    return {
      month: key,
      income: round(income),
      expenses: round(expenses),
      savings: round(income - expenses),
      balance: round(balance),
    }
  })
}

/**
 * Dépenses jour par jour d'un mois, pour le calendrier.
 */
export async function dailyExpenses(user: User, month: DateTime) {
  const start = month.startOf('month')
  const transactions = await user
    .related('transactions')
    .query()
    .where('type', 'expense')
    .whereBetween('date', [start.toISODate()!, month.endOf('month').toISODate()!])

  return Array.from({ length: start.daysInMonth! }, (_, i) => {
    const day = start.plus({ days: i }).toISODate()!
    const amount = transactions
      .filter((t) => t.date.toISODate() === day)
      .reduce((s, t) => s + Number(t.amount), 0)
    return { date: day, amount: round(amount) }
  })
}

/**
 * Objectif d'épargne et progression : épargne (revenus - dépenses)
 * cumulée depuis la date de départ de l'objectif.
 */
export async function savingsGoalProgress(user: User) {
  const goal = await SavingsGoal.findBy('userId', user.id)
  if (!goal) return null

  const transactions = await user
    .related('transactions')
    .query()
    .where('date', '>=', goal.startDate.toISODate()!)
  const saved = transactions.reduce(
    (s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
    0
  )
  const target = Number(goal.targetAmount)
  const remaining = Math.max(target - saved, 0)

  // Montant à mettre de côté chaque mois pour tenir l'échéance (mois en cours inclus)
  let monthlyNeeded: number | null = null
  if (goal.deadline && remaining > 0) {
    const months = Math.floor(
      goal.deadline.startOf('month').diff(DateTime.now().startOf('month'), 'months').months
    )
    monthlyNeeded = months >= 0 ? round(remaining / (months + 1)) : null
  }

  return {
    name: goal.name,
    target,
    startDate: goal.startDate.toISODate()!,
    deadline: goal.deadline?.toISODate() ?? null,
    saved: round(saved),
    remaining: round(remaining),
    percent: Math.round((Math.max(saved, 0) / target) * 100),
    monthlyNeeded,
  }
}
