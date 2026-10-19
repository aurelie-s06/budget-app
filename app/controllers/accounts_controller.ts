import type { HttpContext } from '@adonisjs/core/http'
import { accountValidator } from '#validators/account'

export default class AccountsController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const accounts = await user.related('accounts').query().preload('transactions').orderBy('name')

    return inertia.render('accounts/index', {
      accounts: accounts.map((a) => {
        // Solde = solde initial + revenus - dépenses
        const balance = a.transactions.reduce((total, t) => {
          const amount = Number(t.amount)
          return t.type === 'income' ? total + amount : total - amount
        }, Number(a.initialBalance))

        return {
          id: a.id,
          name: a.name,
          type: a.type as 'courant' | 'epargne' | 'especes' | 'autre',
          color: a.color,
          initialBalance: Number(a.initialBalance),
          balance: Math.round(balance * 100) / 100,
        }
      }),
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(accountValidator)
    await user.related('accounts').create(data)
    return response.redirect().back()
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const account = await user.related('accounts').query().where('id', params.id).firstOrFail()
    const data = await request.validateUsing(accountValidator)
    account.merge(data)
    await account.save()
    return response.redirect().back()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const account = await user.related('accounts').query().where('id', params.id).firstOrFail()
    await account.delete()
    return response.redirect().back()
  }
}