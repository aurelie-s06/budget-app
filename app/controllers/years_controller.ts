import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { activeYears, yearSummary } from '#services/budget_service'
import { yearValidator } from '#validators/month'

export default class YearsController {
  async show({ auth, inertia, request }: HttpContext) {
    const user = auth.getUserOrFail()
    // Année demandée (?year=2026), sinon l'année en cours
    const { year = DateTime.now().year } = await request.validateUsing(yearValidator)

    return inertia.render('years/show', {
      year,
      years: await activeYears(user),
      ...(await yearSummary(user, year)),
    })
  }
}
