import type User from '#models/user'

// Vérifie que le compte et la catégorie appartiennent à l'utilisateur (sinon : 404)
export async function checkOwnership(
  user: User,
  accountId: number,
  categoryId?: number | null,
  toAccountId?: number | null
) {
  await user.related('accounts').query().where('id', accountId).firstOrFail()
  if (toAccountId) {
    await user.related('accounts').query().where('id', toAccountId).firstOrFail()
  }
  if (categoryId) {
    await user.related('categories').query().where('id', categoryId).firstOrFail()
  }
}

// Un virement n'a pas de catégorie ; une dépense ou un revenu n'a pas de compte d'arrivée
export function cleanup<
  T extends { type: string; toAccountId?: number | null; categoryId?: number | null },
>(data: T) {
  return data.type === 'transfer' ? { ...data, categoryId: null } : { ...data, toAccountId: null }
}
