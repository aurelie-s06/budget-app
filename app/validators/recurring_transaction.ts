import vine from '@vinejs/vine'
import { isoDate } from '#validators/rules'
import { otherAccount } from '#validators/transaction'

// La date de fin ne peut pas précéder la première échéance
const afterStart = vine.createRule((value, _, field) => {
  if (typeof value === 'string' && value < field.parent.startDate) {
    field.report('La date de fin doit être après la première échéance', 'afterStart', field)
  }
})

export const recurringTransactionValidator = vine.compile(
  vine.object({
    type: vine.enum(['income', 'expense', 'transfer']),
    amount: vine.number().positive(),
    description: vine.string().trim().minLength(1).maxLength(100),
    accountId: vine.number(),
    toAccountId: vine
      .number()
      .use(otherAccount())
      .nullable()
      .optional()
      .requiredWhen('type', '=', 'transfer'),
    categoryId: vine.number().nullable().optional(),
    frequency: vine.enum(['weekly', 'monthly', 'yearly']),
    startDate: isoDate(),
    endDate: isoDate().use(afterStart()).nullable().optional(),
  })
)
