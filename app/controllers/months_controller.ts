import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { monthSummary } from '#services/budget_service'
import { monthValidator } from '#validators/month'

export default class MonthsController {
  async show({ auth, inertia, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const { month: value } = await request.validateUsing(monthValidator)

    // Mois demandé (?month=2026-10), sinon le mois en cours
    const parsed = value ? DateTime.fromFormat(value, 'yyyy-MM') : null
    const month = parsed?.isValid ? parsed : DateTime.now().startOf('month')

    const summary = await monthSummary(user, month)
    // Pour modifier une opération directement depuis le mois
    const accounts = await user.related('accounts').query().orderBy('name')
    const categories = await user.related('categories').query().orderBy('name')

    return inertia.render('months/show', {
      month: month.toFormat('yyyy-MM'),
      previous: month.minus({ months: 1 }).toFormat('yyyy-MM'),
      next: month.plus({ months: 1 }).toFormat('yyyy-MM'),
      accounts: accounts.map((a) => ({ id: a.id, name: a.name })),
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      ...summary,
    })
  }
}
