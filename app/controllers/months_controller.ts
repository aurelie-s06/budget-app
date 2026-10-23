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

    return inertia.render('months/show', {
      month: month.toFormat('yyyy-MM'),
      previous: month.minus({ months: 1 }).toFormat('yyyy-MM'),
      next: month.plus({ months: 1 }).toFormat('yyyy-MM'),
      isCurrent: month.hasSame(DateTime.now(), 'month'),
      ...summary,
    })
  }
}
