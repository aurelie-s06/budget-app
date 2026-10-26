import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { triageCount, triageQuery } from '#services/triage_service'
import { triageFiltersValidator, triageValidator } from '#validators/triage'

export default class TriageController {
  // Opérations à classer, une par une
  async index({ auth, inertia, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const { kind = 'expense' } = await request.validateUsing(triageFiltersValidator)

    const { query } = await triageQuery(user, kind)
    const items = await query.preload('account').orderBy('date', 'desc').orderBy('id', 'desc')
    const categories = await user.related('categories').query().orderBy('name')

    return inertia.render('triage/index', {
      kind,
      counts: await triageCount(user),
      items: items.map((t) => ({
        id: t.id,
        date: t.date.toISODate()!,
        description: t.description,
        amount: Number(t.amount),
        note: t.note,
        bankLabel: t.bankLabel,
        accountName: t.account.name,
        categoryId: t.categoryId,
      })),
      categories: categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    })
  }

  // Classe une ou plusieurs opérations ; elles ne reviennent plus dans la liste
  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { ids, categoryId, description } = await request.validateUsing(triageValidator)
    // La catégorie doit appartenir à l'utilisateur (sinon : 404)
    if (categoryId) await user.related('categories').query().where('id', categoryId).firstOrFail()

    const reviewedAt = DateTime.now()
    const transactions = await user.related('transactions').query().whereIn('id', ids)
    for (const t of transactions) {
      if (categoryId) t.categoryId = categoryId
      if (description && t.id === ids[0]) t.description = description
      t.reviewedAt = reviewedAt
      await t.save()
    }
    return response.redirect().back()
  }
}
