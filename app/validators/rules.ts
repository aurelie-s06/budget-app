import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

// La date doit exister : le format seul laisserait passer un 31 février
const realDate = vine.createRule((value, _, field) => {
  if (typeof value === 'string' && !DateTime.fromISO(value).isValid) {
    field.report('Cette date n’existe pas', 'realDate', field)
  }
})

export const isoDate = () =>
  vine
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .use(realDate())
