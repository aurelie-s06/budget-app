import { DateTime } from 'luxon'
import type User from '#models/user'
import SavingsGoal from '#models/savings_goal'

const round = (n: number) => Math.round(n * 100) / 100

type Movement = { type: string; amount: number; accountId: number; toAccountId: number | null }

/**
 * Effet d'une opération sur le solde d'un compte :
 * un virement sort du compte de départ et entre sur le compte d'arrivée.
 */
export function balanceEffect(t: Movement, accountId: number) {
  const amount = Number(t.amount)
  if (t.type === 'transfer') {
    if (t.toAccountId === accountId) return amount
    return t.accountId === accountId ? -amount : 0
  }
  if (t.accountId !== accountId) return 0
  return t.type === 'income' ? amount : -amount
}

/**
 * Épargne versée par une opération : virement vers un compte épargne (+),
 * ou retiré d'un compte épargne vers un autre compte (−).
 */
export function savingsEffect(t: Movement, savingsIds: Set<number>) {
  if (t.type !== 'transfer') return 0
  const toSavings = savingsIds.has(t.toAccountId!)
  const fromSavings = savingsIds.has(t.accountId)
  if (toSavings === fromSavings) return 0
  return toSavings ? Number(t.amount) : -Number(t.amount)
}

// Identifiants des comptes de type « épargne »
async function savingsAccountIds(user: User) {
  const accounts = await user.related('accounts').query().where('type', 'epargne')
  return new Set(accounts.map((a) => a.id))
}

type AccountStart = { id: number; initialBalance: number; balanceDate: DateTime | null }

/**
 * Solde d'un compte avant toute opération.
 * Solde connu à une date : on retire les opérations jusqu'à ce jour inclus,
 * ainsi une opération antérieure ajoutée plus tard ne change pas le solde actuel.
 */
export function startingBalance(
  account: AccountStart,
  transactions: (Movement & { date: DateTime })[]
) {
  const known = Number(account.initialBalance)
  if (!account.balanceDate) return known
  const until = account.balanceDate.toISODate()!
  return transactions
    .filter((t) => t.date.toISODate()! <= until)
    .reduce((sum, t) => sum - balanceEffect(t, account.id), known)
}

/**
 * Solde de chaque compte : solde de départ + revenus − dépenses ± virements.
 */
export async function accountBalances(user: User) {
  const accounts = await user.related('accounts').query().orderBy('name')
  const transactions = await user.related('transactions').query()
  return accounts.map((a) => ({
    account: a,
    balance: round(
      transactions.reduce(
        (sum, t) => sum + balanceEffect(t, a.id),
        startingBalance(a, transactions)
      )
    ),
  }))
}

/**
 * Chiffres clés d'un mois : revenus, dépenses, épargne versée, reste,
 * taux de dépenses, budget par catégorie et opérations du mois.
 */
export async function monthSummary(user: User, month: DateTime) {
  const start = month.startOf('month').toISODate()!
  const end = month.endOf('month').toISODate()!
  const savingsIds = await savingsAccountIds(user)

  const transactions = await user
    .related('transactions')
    .query()
    .preload('category')
    .preload('account')
    .preload('toAccount')
    .whereBetween('date', [start, end])
    .orderBy('date', 'desc')
    .orderBy('id', 'desc')

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  // Salaire : revenus rangés dans la catégorie « Salaire »
  const salary = transactions
    .filter((t) => t.type === 'income' && t.category?.name.trim().toLowerCase() === 'salaire')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const savings = transactions.reduce((sum, t) => sum + savingsEffect(t, savingsIds), 0)

  // Taux de dépenses : pas calculé si aucun revenu
  const spendingRate = income > 0 ? Math.round((expenses / income) * 1000) / 10 : null

  // Budget par catégorie
  const categories = await user.related('categories').query().orderBy('name')
  const budgets = categories
    .map((c) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === c.id)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const budget = c.monthlyBudget !== null ? Number(c.monthlyBudget) : null
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        spent: round(spent),
        budget,
        remaining: budget !== null ? round(budget - spent) : null,
        percent: budget ? Math.round((spent / budget) * 100) : null,
      }
    })
    .filter((b) => b.budget !== null || b.spent > 0)

  // Dépenses sans catégorie : comptées dans la répartition
  const uncategorized = transactions
    .filter((t) => t.type === 'expense' && t.categoryId === null)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    income: round(income),
    salary: round(salary),
    otherIncome: round(income - salary),
    expenses: round(expenses),
    savings: round(savings),
    // Ce qui reste une fois les dépenses payées et l'épargne mise de côté
    rest: round(income - expenses - savings),
    spendingRate,
    budgets,
    uncategorized: round(uncategorized),
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
    })),
  }
}

/**
 * Historique mois par mois, du plus ancien au plus récent (mois en cours inclus) :
 * revenus, dépenses, épargne versée et solde total en fin de mois.
 * `count` : nombre de mois, ou 'all' pour remonter à la première opération.
 */
export async function monthlyHistory(user: User, count: number | 'all') {
  const now = DateTime.now().startOf('month')
  const accounts = await user.related('accounts').query()
  const savingsIds = new Set(accounts.filter((a) => a.type === 'epargne').map((a) => a.id))
  const transactions = await user.related('transactions').query().orderBy('date', 'asc')

  const oldest = transactions[0]?.date.startOf('month') ?? now
  const first = count === 'all' ? (oldest < now ? oldest : now) : now.minus({ months: count - 1 })
  const length = Math.floor(now.diff(first, 'months').months) + 1

  // Solde au début de la période : soldes de départ + opérations antérieures
  // (un virement entre deux comptes ne change pas le solde total)
  let balance = accounts.reduce((sum, a) => sum + startingBalance(a, transactions), 0)
  for (const t of transactions) {
    if (t.date.toMillis() >= first.toMillis()) break
    if (t.type === 'income') balance += Number(t.amount)
    if (t.type === 'expense') balance -= Number(t.amount)
  }

  return Array.from({ length }, (_, i) => {
    const month = first.plus({ months: i })
    const key = month.toFormat('yyyy-MM')
    const ofMonth = transactions.filter((t) => t.date.toFormat('yyyy-MM') === key)
    const sum = (type: string) =>
      ofMonth.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0)
    const income = sum('income')
    const expenses = sum('expense')
    const savings = ofMonth.reduce((s, t) => s + savingsEffect(t, savingsIds), 0)
    balance += income - expenses
    return {
      month: key,
      income: round(income),
      expenses: round(expenses),
      savings: round(savings),
      balance: round(balance),
    }
  })
}

/**
 * Dépenses jour par jour d'un mois, pour le calendrier.
 */
export async function dailyExpenses(user: User, month: DateTime) {
  const start = month.startOf('month')
  const transactions = await user
    .related('transactions')
    .query()
    .where('type', 'expense')
    .whereBetween('date', [start.toISODate()!, month.endOf('month').toISODate()!])

  return Array.from({ length: start.daysInMonth! }, (_, i) => {
    const day = start.plus({ days: i }).toISODate()!
    const amount = transactions
      .filter((t) => t.date.toISODate() === day)
      .reduce((s, t) => s + Number(t.amount), 0)
    return { date: day, amount: round(amount) }
  })
}

/**
 * Objectif d'épargne et progression : virements nets vers les comptes épargne
 * depuis la date de départ de l'objectif.
 */
export async function savingsGoalProgress(user: User) {
  const goal = await SavingsGoal.findBy('userId', user.id)
  if (!goal) return null

  const savingsIds = await savingsAccountIds(user)
  const transactions = await user
    .related('transactions')
    .query()
    .where('type', 'transfer')
    .where('date', '>=', goal.startDate.toISODate()!)
  const saved = transactions.reduce((s, t) => s + savingsEffect(t, savingsIds), 0)
  const target = Number(goal.targetAmount)
  const remaining = Math.max(target - saved, 0)

  // Montant à mettre de côté chaque mois pour tenir l'échéance (mois en cours inclus)
  let monthlyNeeded: number | null = null
  if (goal.deadline && remaining > 0) {
    const months = Math.floor(
      goal.deadline.startOf('month').diff(DateTime.now().startOf('month'), 'months').months
    )
    monthlyNeeded = months >= 0 ? round(remaining / (months + 1)) : null
  }

  return {
    name: goal.name,
    target,
    startDate: goal.startDate.toISODate()!,
    deadline: goal.deadline?.toISODate() ?? null,
    saved: round(saved),
    remaining: round(remaining),
    percent: Math.round((Math.max(saved, 0) / target) * 100),
    monthlyNeeded,
  }
}

/**
 * Bilan d'une année : chiffres de chaque mois et dépenses par catégorie et par mois.
 */
export async function yearSummary(user: User, year: number) {
  const start = DateTime.fromObject({ year, month: 1, day: 1 })
  const savingsIds = await savingsAccountIds(user)
  const transactions = await user
    .related('transactions')
    .query()
    .whereBetween('date', [start.toISODate()!, start.endOf('year').toISODate()!])
  const categories = await user.related('categories').query().orderBy('name')

  const months = Array.from({ length: 12 }, (_, i) => {
    const ofMonth = transactions.filter((t) => t.date.month === i + 1)
    const sum = (type: string) =>
      ofMonth.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0)
    const income = sum('income')
    const expenses = sum('expense')
    const savings = ofMonth.reduce((s, t) => s + savingsEffect(t, savingsIds), 0)
    return {
      month: start.plus({ months: i }).toFormat('yyyy-MM'),
      income: round(income),
      expenses: round(expenses),
      savings: round(savings),
      rest: round(income - expenses - savings),
    }
  })

  // Dépenses d'une catégorie (null = sans catégorie) pour chacun des 12 mois
  const spentByMonth = (categoryId: number | null) =>
    Array.from({ length: 12 }, (_, i) =>
      round(
        transactions
          .filter(
            (t) => t.type === 'expense' && t.categoryId === categoryId && t.date.month === i + 1
          )
          .reduce((s, t) => s + Number(t.amount), 0)
      )
    )

  const rows = [
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      monthlyBudget: c.monthlyBudget !== null ? Number(c.monthlyBudget) : null,
      months: spentByMonth(c.id),
    })),
    {
      id: null,
      name: 'Sans catégorie',
      color: null,
      monthlyBudget: null,
      months: spentByMonth(null),
    },
  ]
    .map((r) => ({ ...r, total: round(r.months.reduce((s, m) => s + m, 0)) }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)

  return { months, categories: rows }
}

/**
 * Années ayant au moins une opération, plus l'année en cours.
 */
export async function activeYears(user: User) {
  const dates = await user.related('transactions').query().select('date')
  return [...new Set([DateTime.now().year, ...dates.map((t) => t.date.year)])].sort()
}
