import type { HttpContext } from '@adonisjs/core/http'
import { accountValidator } from '#validators/account'
import { accountBalances } from '#services/budget_service'

export default class AccountsController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    // Solde = solde initial + revenus − dépenses ± virements
    const balances = await accountBalances(user)

    return inertia.render('accounts/index', {
      accounts: balances.map(({ account: a, balance }) => {
        return {
          id: a.id,
          name: a.name,
          type: a.type as 'courant' | 'epargne' | 'especes' | 'autre',
          color: a.color,
          initialBalance: Number(a.initialBalance),
          balance,
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
