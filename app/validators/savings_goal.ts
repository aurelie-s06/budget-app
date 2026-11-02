import vine from '@vinejs/vine'
import { isoDate } from '#validators/rules'

export const savingsGoalValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(50),
    targetAmount: vine.number().positive(),
    startDate: isoDate(),
    deadline: isoDate().nullable().optional(),
  })
)
