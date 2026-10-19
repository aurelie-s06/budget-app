import vine from '@vinejs/vine'

export const transactionValidator = vine.compile(
  vine.object({
    type: vine.enum(['income', 'expense']),
    amount: vine.number().positive(),
    date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: vine.string().trim().minLength(1).maxLength(100),
    note: vine.string().trim().maxLength(500).nullable().optional(),
    accountId: vine.number(),
    categoryId: vine.number().nullable().optional(),
  })
)

export const transactionFiltersValidator = vine.compile(
  vine.object({
    month: vine
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
    accountId: vine.number().optional(),
    categoryId: vine.number().optional(),
    type: vine.enum(['income', 'expense']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
  })
)
