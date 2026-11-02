import vine from '@vinejs/vine'
import { isoDate } from '#validators/rules'

// Un virement doit arriver sur un autre compte que celui de départ
export const otherAccount = vine.createRule((value, _, field) => {
  if (value === field.parent.accountId) {
    field.report('Choisis un compte différent du compte de départ', 'otherAccount', field)
  }
})

export const transactionValidator = vine.compile(
  vine.object({
    type: vine.enum(['income', 'expense', 'transfer']),
    amount: vine.number().positive(),
    date: isoDate(),
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
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
      .optional(),
    day: isoDate().optional(),
    accountId: vine.number().optional(),
    categoryId: vine.number().optional(),
    type: vine.enum(['income', 'expense', 'transfer']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    minAmount: vine.number().min(0).optional(),
    maxAmount: vine.number().min(0).optional(),
    sort: vine.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).optional(),
  })
)
