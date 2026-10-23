import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { monthSummary, monthlyTotals } from '#services/budget_service'

const round = (n: number) => Math.round(n * 100) / 100

export default class DashboardController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    // Solde total de tous les comptes
    const accounts = await user.related('accounts').query().preload('transactions')
    const totalBalance = accounts.reduce((total, a) => {
      return a.transactions.reduce(
        (sum, t) => (t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount)),
        total + Number(a.initialBalance)
      )
    }, 0)

    // Chiffres du mois en cours
    const summary = await monthSummary(user, DateTime.now())

    // Revenus / dépenses des 6 derniers mois
    const history = await monthlyTotals(user, 6)

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
      income: summary.income,
      expenses: summary.expenses,
      savings: summary.savings,
      spendingRate: summary.spendingRate,
      budgets: summary.budgets,
      history,
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
