import type User from '#models/user'

export type TriageKind = 'expense' | 'income'

// Catégorie « Autres » de l'utilisateur, si elle existe
async function otherCategoryId(user: User) {
  const other = await user
    .related('categories')
    .query()
    .whereRaw('lower(trim(name)) = ?', ['autres'])
    .first()
  return other?.id ?? null
}

/**
 * Opérations à classer : dépenses dans « Autres » ou sans catégorie, revenus
 * sans catégorie. Celles dont le classement a été confirmé n'y sont plus.
 */
export async function triageQuery(user: User, kind: TriageKind) {
  const otherId = await otherCategoryId(user)
  // Renvoyée dans un objet : une requête renvoyée telle quelle par une fonction async serait exécutée
  return {
    query: user
      .related('transactions')
      .query()
      .where('type', kind)
      .whereNull('reviewed_at')
      .where((q) => {
        q.whereNull('category_id')
        if (otherId) q.orWhere('category_id', otherId)
      }),
  }
}

// Nombre d'opérations à classer, par type
export async function triageCount(user: User) {
  const count = async (kind: TriageKind) => {
    const { query } = await triageQuery(user, kind)
    const [row] = await query.count('* as total')
    return Number(row.$extras.total)
  }
  const [expense, income] = await Promise.all([count('expense'), count('income')])
  return { expense, income }
}
