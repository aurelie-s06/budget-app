import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import {
  accountBalances,
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
    const balances = await accountBalances(user)
    const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0)

    // Chiffres du mois en cours
    const summary = await monthSummary(user, now)

    return inertia.render('dashboard', {
      period,
      totalBalance: round(totalBalance),
      accountCount: balances.length,
      income: summary.income,
      expenses: summary.expenses,
      savings: summary.savings,
      rest: summary.rest,
      spendingRate: summary.spendingRate,
      budgets: summary.budgets,
      uncategorized: summary.uncategorized,
      history: await monthlyHistory(user, period === 'all' ? 'all' : Number(period)),
      days: await dailyExpenses(user, now),
      goal: await savingsGoalProgress(user),
    })
  }
}
