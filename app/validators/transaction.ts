import vine from '@vinejs/vine'

// Un virement doit arriver sur un autre compte que celui de départ
const otherAccount = vine.createRule((value, _, field) => {
  if (value === field.parent.accountId) {
    field.report('Choisis un compte différent du compte de départ', 'otherAccount', field)
  }
})

export const transactionValidator = vine.compile(
  vine.object({
    type: vine.enum(['income', 'expense', 'transfer']),
    amount: vine.number().positive(),
    date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: vine.string().trim().minLength(1).maxLength(100),
    note: vine.string().trim().maxLength(500).nullable().optional(),
    accountId: vine.number(),
    // Virement : compte d'arrivée, obligatoire et différent du compte de départ
    toAccountId: vine
      .number()
      .use(otherAccount())
      .nullable()
      .optional()
      .requiredWhen('type', '=', 'transfer'),
    categoryId: vine.number().nullable().optional(),
  })
)

export const transactionFiltersValidator = vine.compile(
  vine.object({
    month: vine
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
    day: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    accountId: vine.number().optional(),
    categoryId: vine.number().optional(),
    type: vine.enum(['income', 'expense', 'transfer']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
  })
)
