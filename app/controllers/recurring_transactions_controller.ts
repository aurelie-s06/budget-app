import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { checkOwnership, cleanup } from '#services/ownership_service'
import { generateRecurring, nextOccurrence, pastOccurrences } from '#services/recurring_service'
import { recurringTransactionValidator } from '#validators/recurring_transaction'

// Dates AAAA-MM-JJ converties pour Lucid
function withDates<T extends { startDate: string; endDate?: string | null }>(data: T) {
  return {
    ...data,
    startDate: DateTime.fromISO(data.startDate),
    endDate: data.endDate ? DateTime.fromISO(data.endDate) : null,
  }
}

const created = (n: number) =>
  n === 0 ? '' : n === 1 ? ' · 1 opération créée' : ` · ${n} opérations créées`

export default class RecurringTransactionsController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const rules = await user
      .related('recurringTransactions')
      .query()
      .preload('account')
      .preload('toAccount')
      .preload('category')
      .orderBy('description')
    const accounts = await user.related('accounts').query().orderBy('name')
    const categories = await user.related('categories').query().orderBy('name')

    return inertia.render('recurring/index', {
      rules: rules.map((r) => ({
        id: r.id,
        type: r.type as 'income' | 'expense' | 'transfer',
        amount: Number(r.amount),
        description: r.description,
        frequency: r.frequency as 'weekly' | 'monthly' | 'yearly',
        startDate: r.startDate.toISODate()!,
        endDate: r.endDate?.toISODate() ?? null,
        // null : récurrence terminée
        nextDate: nextOccurrence(r)?.toISODate() ?? null,
        generatedCount: r.generatedCount,
        accountId: r.accountId,
        toAccountId: r.toAccountId,
        categoryId: r.categoryId,
        accountName: r.account.name,
        toAccountName: r.toAccount?.name ?? null,
        categoryName: r.category?.name ?? null,
        categoryColor: r.category?.color ?? null,
      })),
      accounts: accounts.map((a) => ({ id: a.id, name: a.name, type: a.type })),
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = cleanup(await request.validateUsing(recurringTransactionValidator))
    await checkOwnership(user, data.accountId, data.categoryId, data.toAccountId)

    // Les échéances déjà passées sont créées tout de suite
    await user.related('recurringTransactions').create(withDates(data))
    const count = await generateRecurring(user)
    session.flash('success', `Opération récurrente ajoutée${created(count)}`)
    return response.redirect().back()
  }

  async update({ auth, params, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const rule = await user
      .related('recurringTransactions')
      .query()
      .where('id', params.id)
      .firstOrFail()
    const data = cleanup(await request.validateUsing(recurringTransactionValidator))
    await checkOwnership(user, data.accountId, data.categoryId, data.toAccountId)

    const before = `${rule.startDate.toISODate()}/${rule.frequency}`
    rule.merge(withDates(data))
    // Calendrier modifié : les opérations déjà créées restent,
    // le nouveau calendrier s'applique à partir de la prochaine échéance
    if (rule.generatedCount > 0 && before !== `${data.startDate}/${data.frequency}`) {
      rule.generatedCount = pastOccurrences(rule)
    }
    await rule.save()

    const count = await generateRecurring(user)
    session.flash('success', `Opération récurrente modifiée${created(count)}`)
    return response.redirect().back()
  }

  // Les opérations déjà créées sont conservées (recurring_id remis à NULL par la base)
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const rule = await user
      .related('recurringTransactions')
      .query()
      .where('id', params.id)
      .firstOrFail()
    await rule.delete()
    return response.redirect().back()
  }
}
