import vine from '@vinejs/vine'

export const savingsGoalValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(50),
    targetAmount: vine.number().positive(),
    startDate: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    deadline: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  })
)
