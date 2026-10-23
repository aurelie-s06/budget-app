import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import {
  dailyExpenses,
  monthSummary,
  monthlyHistory,
  savingsGoalProgress,
} from '#services/budget_service'
import { periodValidator } from '#validators/month'

const round = (n: number) => Math.round(n * 100) / 100

export default class DashboardController {
  async index({ auth, inertia, request }: HttpContext) {
    const user = auth.getUserOrFail()
    // Période des graphiques (?period=6|12|all), 12 mois par défaut
    const { period = '12' } = await request.validateUsing(periodValidator)
    const now = DateTime.now()

    // Solde total de tous les comptes
    const accounts = await user.related('accounts').query().preload('transactions')
    const totalBalance = accounts.reduce((total, a) => {
      return a.transactions.reduce(
        (sum, t) => (t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount)),
        total + Number(a.initialBalance)
      )
    }, 0)

    // Chiffres du mois en cours
    const summary = await monthSummary(user, now)

    return inertia.render('dashboard', {
      period,
      totalBalance: round(totalBalance),
      accountCount: accounts.length,
      income: summary.income,
      expenses: summary.expenses,
      savings: summary.savings,
      spendingRate: summary.spendingRate,
      budgets: summary.budgets,
      uncategorized: summary.uncategorized,
      history: await monthlyHistory(user, period === 'all' ? 'all' : Number(period)),
      days: await dailyExpenses(user, now),
      goal: await savingsGoalProgress(user),
    })
  }
}
