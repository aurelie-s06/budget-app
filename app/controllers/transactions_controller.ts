import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import type User from '#models/user'
import { transactionValidator, transactionFiltersValidator } from '#validators/transaction'

// Vérifie que le compte et la catégorie appartiennent à l'utilisateur (sinon : 404)
async function checkOwnership(user: User, accountId: number, categoryId?: number | null) {
  await user.related('accounts').query().where('id', accountId).firstOrFail()
  if (categoryId) {
    await user.related('categories').query().where('id', categoryId).firstOrFail()
  }
}

export default class TransactionsController {
  async index({ auth, inertia, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const filters = await request.validateUsing(transactionFiltersValidator)

    const query = user
      .related('transactions')
      .query()
      .preload('account')
      .preload('category')
      .orderBy('date', 'desc')
      .orderBy('id', 'desc')

    // On ajoute chaque filtre seulement s'il est rempli
    if (filters.month) {
      const month = DateTime.fromFormat(filters.month, 'yyyy-MM')
      query.whereBetween('date', [
        month.startOf('month').toISODate()!,
        month.endOf('month').toISODate()!,
      ])
    }
    if (filters.accountId) query.where('account_id', filters.accountId)
    if (filters.categoryId) query.where('category_id', filters.categoryId)
    if (filters.type) query.where('type', filters.type)
    if (filters.search) query.where('description', 'like', `%${filters.search}%`)

    const transactions = await query
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
      filters: {
        month: filters.month ?? '',
        accountId: filters.accountId?.toString() ?? '',
        categoryId: filters.categoryId?.toString() ?? '',
        type: filters.type ?? '',
        search: filters.search ?? '',
      },
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
