import vine from '@vinejs/vine'

export const accountValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(50),
    type: vine.enum(['courant', 'epargne', 'especes', 'autre']),
    initialBalance: vine.number(),
    color: vine
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
  })
)
