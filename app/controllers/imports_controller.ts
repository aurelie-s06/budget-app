import type { HttpContext } from '@adonisjs/core/http'
import { readFile } from 'node:fs/promises'
import { DateTime } from 'luxon'
import { checkOwnership } from '#services/ownership_service'
import { balanceAt, suggest } from '#services/import_service'
import { isComplete, parseStatement, StatementError } from '#services/statement_parser'
import { importValidator, statementValidator } from '#validators/import'

export default class ImportsController {
  // Choix du relevé
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    return inertia.render('imports/index', await this.options(user))
  }

  // Lit le relevé et affiche l'aperçu, sans rien enregistrer
  async preview({ auth, inertia, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { statement: file, accountId } = await request.validateUsing(statementValidator)
    await checkOwnership(user, accountId)

    let statement
    try {
      statement = await parseStatement(new Uint8Array(await readFile(file.tmpPath!)))
    } catch (error) {
      if (!(error instanceof StatementError)) throw error
      session.flash('error', error.message)
      return response.redirect().toRoute('imports.index')
    }

    const lines = await suggest(user, accountId, statement)
    return inertia.render('imports/index', {
      ...(await this.options(user)),
      preview: {
        fileName: file.clientName,
        accountId,
        from: statement.from,
        to: statement.to,
        openingBalance: statement.openingBalance,
        closingBalance: statement.closingBalance,
        complete: isComplete(statement),
        // Solde du compte dans l'app à la fin du relevé, avant l'import
        appBalance: statement.to ? await balanceAt(user, accountId, statement.to) : null,
        lines,
      },
    })
  }

  // Enregistre les opérations cochées
  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { accountId, lines, learn } = await request.validateUsing(importValidator)
    await checkOwnership(user, accountId)

    for (const line of lines) {
      const [kind, id] = (line.target ?? '').split(':')
      const otherAccount = kind === 'acc' ? Number(id) : null
      const categoryId = kind === 'cat' ? Number(id) : null
      await checkOwnership(user, accountId, categoryId, otherAccount)

      const common = {
        amount: line.amount,
        date: DateTime.fromISO(line.date),
        description: line.description,
        note: line.note,
        bankLabel: line.label,
      }
      if (otherAccount && otherAccount !== accountId) {
        // Virement : sort du compte pour un débit, y entre pour un crédit
        await user.related('transactions').create({
          ...common,
          type: 'transfer',
          accountId: line.direction === 'debit' ? accountId : otherAccount,
          toAccountId: line.direction === 'debit' ? otherAccount : accountId,
          categoryId: null,
        })
      } else {
        await user.related('transactions').create({
          ...common,
          type: line.direction === 'debit' ? 'expense' : 'income',
          accountId,
          categoryId,
        })
      }
    }

    // Les opérations déjà saisies apprennent leur libellé bancaire
    for (const { id, label } of learn) {
      await user
        .related('transactions')
        .query()
        .where('id', id)
        .whereNull('bank_label')
        .update({ bank_label: label })
    }

    const months = [...new Set(lines.map((l) => l.date.slice(0, 7)))].sort()
    session.flash(
      'success',
      lines.length === 1 ? '1 opération importée' : `${lines.length} opérations importées`
    )
    // On affiche les opérations du mois importé
    return response
      .redirect()
      .toPath(months.length === 1 ? `/transactions?month=${months[0]}` : '/transactions')
  }

  private async options(user: NonNullable<HttpContext['auth']['user']>) {
    const accounts = await user.related('accounts').query().orderBy('name')
    const categories = await user.related('categories').query().orderBy('name')
    return {
      accounts: accounts.map((a) => ({ id: a.id, name: a.name, type: a.type })),
      categories: categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
      preview: null,
    }
  }
}
