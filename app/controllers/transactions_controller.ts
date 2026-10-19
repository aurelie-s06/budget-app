import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import type User from '#models/user'
import { transactionValidator } from '#validators/transaction'

// Vérifie que le compte et la catégorie appartiennent à l'utilisateur (sinon : 404)
async function checkOwnership(user: User, accountId: number, categoryId?: number | null) {
  await user.related('accounts').query().where('id', accountId).firstOrFail()
  if (categoryId) {
    await user.related('categories').query().where('id', categoryId).firstOrFail()
  }
}

export default class TransactionsController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    const transactions = await user
      .related('transactions')
      .query()
      .preload('account')
      .preload('category')
      .orderBy('date', 'desc')
      .orderBy('id', 'desc')

    const accounts = await user.related('accounts').query().orderBy('name')
    const categories = await user.related('categories').query().orderBy('name')

    return inertia.render('transactions/index', {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        amount: Number(t.amount),
        date: t.date.toISODate() ?? '',
        description: t.description,
        note: t.note,
        accountId: t.accountId,
        categoryId: t.categoryId,
        accountName: t.account.name,
        categoryName: t.category?.name ?? null,
        categoryColor: t.category?.color ?? null,
      })),
      accounts: accounts.map((a) => ({ id: a.id, name: a.name })),
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(transactionValidator)
    await checkOwnership(user, data.accountId, data.categoryId)

    await user.related('transactions').create({
      ...data,
      date: DateTime.fromISO(data.date),
    })
    return response.redirect().back()
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const transaction = await user
      .related('transactions')
      .query()
      .where('id', params.id)
      .firstOrFail()
    const data = await request.validateUsing(transactionValidator)
    await checkOwnership(user, data.accountId, data.categoryId)

    transaction.merge({ ...data, date: DateTime.fromISO(data.date) })
    await transaction.save()
    return response.redirect().back()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const transaction = await user
      .related('transactions')
      .query()
      .where('id', params.id)
      .firstOrFail()
    await transaction.delete()
    return response.redirect().back()
  }
}
