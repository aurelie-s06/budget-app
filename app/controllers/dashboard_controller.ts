import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

const round = (n: number) => Math.round(n * 100) / 100

export default class DashboardController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const start = DateTime.now().startOf('month').toISODate()!
    const end = DateTime.now().endOf('month').toISODate()!

    // Solde total de tous les comptes
    const accounts = await user.related('accounts').query().preload('transactions')
    const totalBalance = accounts.reduce((total, a) => {
      return a.transactions.reduce(
        (sum, t) => (t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount)),
        total + Number(a.initialBalance)
      )
    }, 0)

    // Opérations du mois en cours
    const monthTransactions = await user
      .related('transactions')
      .query()
      .whereBetween('date', [start, end])

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Taux de dépenses : pas calculé si aucun revenu
    const spendingRate = income > 0 ? Math.round((expenses / income) * 1000) / 10 : null

    // Budget par catégorie
    const categories = await user.related('categories').query().orderBy('name')
    const budgets = categories
      .map((c) => {
        const spent = monthTransactions
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

    // 5 dernières opérations
    const latest = await user
      .related('transactions')
      .query()
      .preload('category')
      .orderBy('date', 'desc')
      .orderBy('id', 'desc')
      .limit(5)

    return inertia.render('dashboard', {
      totalBalance: round(totalBalance),
      income: round(income),
      expenses: round(expenses),
      savings: round(income - expenses),
      spendingRate,
      budgets,
      latest: latest.map((t) => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        amount: Number(t.amount),
        date: t.date.toISODate() ?? '',
        description: t.description,
        categoryName: t.category?.name ?? null,
      })),
    })
  }
}
