import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { checkOwnership, cleanup } from '#services/ownership_service'
import { transactionValidator, transactionFiltersValidator } from '#validators/transaction'

export default class TransactionsController {
  async index({ auth, inertia, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const filters = await request.validateUsing(transactionFiltersValidator)

    const query = user
      .related('transactions')
      .query()
      .preload('account')
      .preload('toAccount')
      .preload('category')

    // Tri : plus récentes d'abord par défaut
    const [column, direction] = (filters.sort ?? 'date_desc').split('_') as [
      'date' | 'amount',
      'asc' | 'desc',
    ]
    query.orderBy(column, direction).orderBy('date', 'desc').orderBy('id', 'desc')

    // On ajoute chaque filtre seulement s'il est rempli
    if (filters.month) {
      const month = DateTime.fromFormat(filters.month, 'yyyy-MM')
      query.whereBetween('date', [
        month.startOf('month').toISODate()!,
        month.endOf('month').toISODate()!,
      ])
    }
    if (filters.day) query.where('date', filters.day)
    // Un compte voit aussi les virements qu'il reçoit
    if (filters.accountId) {
      query.where((q) =>
        q.where('account_id', filters.accountId!).orWhere('to_account_id', filters.accountId!)
      )
    }
    if (filters.categoryId) query.where('category_id', filters.categoryId)
    if (filters.type) query.where('type', filters.type)
    if (filters.search) {
      // Cherche dans la description et dans la note
      query.where((q) =>
        q
          .where('description', 'like', `%${filters.search}%`)
          .orWhere('note', 'like', `%${filters.search}%`)
      )
    }
    if (filters.minAmount !== undefined) query.where('amount', '>=', filters.minAmount)
    if (filters.maxAmount !== undefined) query.where('amount', '<=', filters.maxAmount)

    const transactions = await query
    const accounts = await user.related('accounts').query().orderBy('name')
    const categories = await user.related('categories').query().orderBy('name')

    // Mois ayant au moins une opération, pour la liste déroulante du filtre
    const dates = await user.related('transactions').query().select('date').orderBy('date', 'desc')
    const months = [...new Set(dates.map((t) => t.date.toFormat('yyyy-MM')))]

    return inertia.render('transactions/index', {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type as 'income' | 'expense' | 'transfer',
        amount: Number(t.amount),
        date: t.date.toISODate() ?? '',
        description: t.description,
        note: t.note,
        accountId: t.accountId,
        toAccountId: t.toAccountId,
        categoryId: t.categoryId,
        accountName: t.account.name,
        toAccountName: t.toAccount?.name ?? null,
        categoryName: t.category?.name ?? null,
        categoryColor: t.category?.color ?? null,
        recurring: t.recurringId !== null,
      })),
      accounts: accounts.map((a) => ({ id: a.id, name: a.name, type: a.type })),
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      months,
      filters: {
        month: filters.month ?? '',
        day: filters.day ?? '',
        accountId: filters.accountId?.toString() ?? '',
        categoryId: filters.categoryId?.toString() ?? '',
        type: filters.type ?? '',
        search: filters.search ?? '',
        minAmount: filters.minAmount?.toString() ?? '',
        maxAmount: filters.maxAmount?.toString() ?? '',
        sort: filters.sort ?? '',
      },
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = cleanup(await request.validateUsing(transactionValidator))
    await checkOwnership(user, data.accountId, data.categoryId, data.toAccountId)

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
    const data = cleanup(await request.validateUsing(transactionValidator))
    await checkOwnership(user, data.accountId, data.categoryId, data.toAccountId)

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
