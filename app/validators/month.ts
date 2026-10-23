import vine from '@vinejs/vine'

export const monthValidator = vine.compile(
  vine.object({
    month: vine
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
  })
)

// Période des graphiques du tableau de bord
export const periodValidator = vine.compile(
  vine.object({
    period: vine.enum(['6', '12', 'all']).optional(),
  })
)
