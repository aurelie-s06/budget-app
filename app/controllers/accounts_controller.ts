import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { accountValidator } from '#validators/account'
import { accountBalances } from '#services/budget_service'

// Date du solde connu : texte AAAA-MM-JJ converti pour Lucid
function withDate<T extends { balanceDate?: string | null }>(data: T) {
  return { ...data, balanceDate: data.balanceDate ? DateTime.fromISO(data.balanceDate) : null }
}

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
          balanceDate: a.balanceDate?.toISODate() ?? null,
          balance,
        }
      }),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(accountValidator)
    await user.related('accounts').create(withDate(data))
    session.flash('success', 'Compte ajouté')
    return response.redirect().back()
  }

  async update({ auth, params, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const account = await user.related('accounts').query().where('id', params.id).firstOrFail()
    const data = await request.validateUsing(accountValidator)
    account.merge(withDate(data))
    await account.save()
    session.flash('success', 'Compte modifié')
    return response.redirect().back()
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const account = await user.related('accounts').query().where('id', params.id).firstOrFail()
    await account.delete()
    session.flash('success', 'Compte supprimé')
    return response.redirect().back()
  }
}
