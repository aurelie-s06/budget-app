import { DateTime } from 'luxon'
import type User from '#models/user'

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
      categoryName: t.category?.name ?? null,
      categoryColor: t.category?.color ?? null,
    })),
  }
}

/**
 * Revenus et dépenses des `count` derniers mois (mois en cours inclus),
 * du plus ancien au plus récent.
 */
export async function monthlyTotals(user: User, count = 6) {
  const now = DateTime.now()
  const first = now.minus({ months: count - 1 }).startOf('month')

  const transactions = await user
    .related('transactions')
    .query()
    .whereBetween('date', [first.toISODate()!, now.endOf('month').toISODate()!])

  return Array.from({ length: count }, (_, i) => {
    const month = first.plus({ months: i })
    const key = month.toFormat('yyyy-MM')
    const ofMonth = transactions.filter((t) => t.date.toFormat('yyyy-MM') === key)
    const sum = (type: string) =>
      round(ofMonth.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0))
    return { month: key, income: sum('income'), expenses: sum('expense') }
  })
}
