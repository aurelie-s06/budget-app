import vine from '@vinejs/vine'
import { isoDate } from '#validators/rules'

export const accountValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(50),
    type: vine.enum(['courant', 'epargne', 'especes', 'autre']),
    initialBalance: vine.number(),
    // Rempli : initialBalance est le solde connu ce jour-là
    balanceDate: isoDate().nullable().optional(),
    color: vine
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
  })
)
