import type User from '#models/user'
import type Transaction from '#models/transaction'
import { balanceEffect, startingBalance } from '#services/budget_service'
import type { Statement, StatementLine } from '#services/statement_parser'
import { bankKey, readableName, ruleFor } from '#services/bank_labels'

/**
 * Transforme les lignes d'un relevé en opérations proposées : nom lisible,
 * catégorie, virement vers un autre compte, et doublons avec l'existant.
 */

export type Suggestion = {
  date: string
  label: string
  amount: number
  direction: 'debit' | 'credit'
  description: string
  note: string | null
  // « cat:12 » (catégorie), « acc:3 » (virement avec ce compte) ou « » (aucune)
  target: string
  // Lignes du même commerçant (même clé) : un renommage s'applique à toutes
  key: string
  // Opération déjà présente dans l'app
  duplicateOf: { id: number; description: string } | null
}

// Montant d'origine d'un paiement à l'étranger : « 70,00 BRL / 1 euro = 6,02 » → « 70,00 BRL »
function foreignAmount(details: string[]) {
  const line = details.find((d) => /^[\d.,]+ [A-Z]{3} \/ 1 euro/.test(d))
  return line ? line.split(' / ')[0] : null
}

// Cible proposée d'après une opération passée : sa catégorie, ou l'autre compte d'un virement
function targetOf(t: Transaction, accountId: number) {
  if (t.type === 'transfer') {
    const other = t.accountId === accountId ? t.toAccountId : t.accountId
    return other ? `acc:${other}` : ''
  }
  return t.categoryId ? `cat:${t.categoryId}` : ''
}

/**
 * Propositions pour chaque ligne du relevé, importé sur le compte `accountId`.
 */
export async function suggest(user: User, accountId: number, statement: Statement) {
  const categories = await user.related('categories').query()
  const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]))
  const history = await user.related('transactions').query().orderBy('date', 'desc')

  // Sens d'une opération passée pour ce compte : crédit ou débit
  const directionOf = (t: Transaction) =>
    balanceEffect(t, accountId) > 0 ? 'credit' : balanceEffect(t, accountId) < 0 ? 'debit' : null
  const onAccount = history.filter((t) => directionOf(t) !== null)

  // 1. Libellés déjà importés : on reprend le nom et la catégorie choisis (le plus récent)
  const learned = new Map<string, Transaction>()
  for (const t of onAccount) {
    if (!t.bankLabel) continue
    const key = `${directionOf(t)}|${bankKey(t.bankLabel)}`
    if (!learned.has(key)) learned.set(key, t)
  }

  // 2. Opérations saisies à la main : la catégorie la plus utilisée pour ce nom
  const byDescription = new Map<string, Map<number, number>>()
  for (const t of history) {
    if (t.type === 'transfer' || !t.categoryId) continue
    const name = t.description.trim().toLowerCase()
    const counts = byDescription.get(name) ?? new Map<number, number>()
    counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1)
    byDescription.set(name, counts)
  }
  const usualCategory = (name: string) => {
    const counts = byDescription.get(name.trim().toLowerCase())
    if (!counts) return null
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  }

  // Doublons : même date, même montant, même sens, sur ce compte ; chaque opération ne sert qu'une fois
  const used = new Set<number>()
  const findDuplicate = (line: StatementLine) =>
    onAccount.find(
      (t) =>
        !used.has(t.id) &&
        t.date.toISODate() === line.date &&
        Math.abs(Number(t.amount) - line.amount) < 0.005 &&
        directionOf(t) === line.direction
    )

  const suggestions: Suggestion[] = statement.lines.map((line) => {
    const duplicate = findDuplicate(line)
    if (duplicate) used.add(duplicate.id)

    const base = {
      date: line.date,
      label: line.label,
      amount: line.amount,
      direction: line.direction,
      key: `${line.direction}|${bankKey(line.label)}`,
      note: foreignAmount(line.details),
      duplicateOf: duplicate ? { id: duplicate.id, description: duplicate.description } : null,
    }

    // Un doublon garde le nom et la catégorie de l'opération existante
    const known = duplicate ?? learned.get(`${line.direction}|${bankKey(line.label)}`)
    if (known) {
      return { ...base, description: known.description, target: targetOf(known, accountId) }
    }

    const upper = line.label.toUpperCase()
    const rule = ruleFor(upper)
    let description = rule?.name ?? readableName(line)
    if (rule?.category === 'Salaire')
      description = `Salaire ${readableName(line).replace(/^Virement /, '')}`
    const categoryId =
      usualCategory(description) ?? (rule ? categoryByName.get(rule.category.toLowerCase()) : null)
    return { ...base, description, target: categoryId ? `cat:${categoryId}` : '' }
  })

  return suggestions
}

/**
 * Solde du compte dans l'app à une date (opérations de ce jour comprises).
 */
export async function balanceAt(user: User, accountId: number, date: string) {
  const account = await user.related('accounts').query().where('id', accountId).firstOrFail()
  const transactions = await user.related('transactions').query()
  return transactions
    .filter((t) => t.date.toISODate()! <= date)
    .reduce((sum, t) => sum + balanceEffect(t, accountId), startingBalance(account, transactions))
}
