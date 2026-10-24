import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import {
  accountBalances,
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

    // Solde mis en avant : le compte courant, sinon le total de tous les comptes
    const balances = await accountBalances(user)
    const main = balances.find((b) => b.account.type === 'courant')
    const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0)

    // Chiffres du mois en cours
    const summary = await monthSummary(user, now)

    return inertia.render('dashboard', {
      period,
      mainBalance: main
        ? { name: main.account.name, balance: main.balance }
        : { name: 'Solde total', balance: round(totalBalance) },
      // Les autres comptes, affichés en dessous
      accounts: balances
        .filter((b) => b !== main)
        .map(({ account: a, balance }) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          balance,
        })),
      income: summary.income,
      expenses: summary.expenses,
      savings: summary.savings,
      rest: summary.rest,
      spendingRate: summary.spendingRate,
      history: await monthlyHistory(user, period === 'all' ? 'all' : Number(period)),
      goal: await savingsGoalProgress(user),
    })
  }
}
