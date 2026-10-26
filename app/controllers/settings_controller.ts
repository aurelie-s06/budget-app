import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { errors } from '@vinejs/vine'
import { DateTime } from 'luxon'
import type User from '#models/user'
import { deleteAccountValidator, passwordValidator, profileValidator } from '#validators/settings'

// Mot de passe actuel faux : erreur affichée sous le champ, comme une erreur de validation
async function checkPassword(user: User, password: string) {
  if (!(await hash.verify(user.password, password))) {
    throw new errors.E_VALIDATION_ERROR([
      {
        field: 'currentPassword',
        message: 'Mot de passe incorrect',
        rule: 'currentPassword',
      },
    ])
  }
}

// Valeur CSV : entre guillemets si besoin, guillemets internes doublés
function csv(value: string | number | null) {
  const text = value === null ? '' : String(value)
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const TYPES = { income: 'Revenu', expense: 'Dépense', transfer: 'Virement' }

export default class SettingsController {
  async show({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const count = async (relation: 'accounts' | 'categories' | 'transactions') => {
      const [row] = await user.related(relation).query().count('* as total')
      return Number(row.$extras.total)
    }
    const first = await user.related('transactions').query().orderBy('date').first()

    return inertia.render('settings/show', {
      profile: { fullName: user.fullName, email: user.email },
      stats: {
        memberSince: user.createdAt.toISODate()!,
        accounts: await count('accounts'),
        categories: await count('categories'),
        transactions: await count('transactions'),
        firstDate: first?.date.toISODate() ?? null,
      },
    })
  }

  async updateProfile({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(profileValidator, { meta: { userId: user.id } })
    user.merge({ fullName: data.fullName || null, email: data.email })
    await user.save()
    session.flash('success', 'Profil enregistré')
    return response.redirect().back()
  }

  async updatePassword({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword, password } = await request.validateUsing(passwordValidator)
    await checkPassword(user, currentPassword)
    // Haché automatiquement à l'enregistrement (mixin withAuthFinder)
    user.password = password
    await user.save()
    session.flash('success', 'Mot de passe modifié')
    return response.redirect().back()
  }

  // Toutes les opérations en CSV, lisible directement dans Excel ou Numbers
  async export({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const transactions = await user
      .related('transactions')
      .query()
      .preload('account')
      .preload('toAccount')
      .preload('category')
      .orderBy('date')
      .orderBy('id')

    const rows = [
      ['Date', 'Type', 'Description', 'Montant', 'Compte', 'Vers le compte', 'Catégorie', 'Note'],
      ...transactions.map((t) => [
        t.date.toFormat('dd/MM/yyyy'),
        TYPES[t.type as keyof typeof TYPES],
        t.description,
        // Virgule décimale pour Excel en français
        Number(t.amount).toFixed(2).replace('.', ','),
        t.account.name,
        t.toAccount?.name ?? null,
        t.category?.name ?? null,
        t.note,
      ]),
    ]
    // BOM : sans lui, Excel lit mal les accents
    const body = '﻿' + rows.map((r) => r.map(csv).join(';')).join('\r\n')
    const name = `mon-budget-operations-${DateTime.now().toISODate()}.csv`

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${name}"`)
    return response.send(body)
  }

  // Supprime le compte et toutes ses données (suppression en cascade dans la base)
  async destroy({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword } = await request.validateUsing(deleteAccountValidator)
    await checkPassword(user, currentPassword)
    await auth.use('web').logout()
    await user.delete()
    session.flash('success', 'Ton compte a été supprimé')
    return response.redirect('/')
  }
}
