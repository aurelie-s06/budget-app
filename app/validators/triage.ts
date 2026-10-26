import vine from '@vinejs/vine'

export const triageFiltersValidator = vine.create({
  kind: vine.enum(['expense', 'income']).optional(),
})

// Classement d'une opération (et des opérations semblables)
export const triageValidator = vine.create({
  ids: vine.array(vine.number()).minLength(1).maxLength(500),
  // null : on garde le classement actuel (« Autres » ou sans catégorie)
  categoryId: vine.number().nullable(),
  // Nouveau nom, pour la première opération seulement
  description: vine.string().trim().minLength(1).maxLength(100).optional(),
})
