import vine from '@vinejs/vine'

export const monthValidator = vine.compile(
  vine.object({
    month: vine
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
  })
)
