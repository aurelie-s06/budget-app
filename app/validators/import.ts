import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const isoDate = () => vine.string().regex(/^\d{4}-\d{2}-\d{2}$/)

// Envoi du relevé à lire
export const statementValidator = vine.create({
  statement: vine.file({ size: '10mb', extnames: ['pdf'] }),
  accountId: vine.number(),
})
statementValidator.messagesProvider = new SimpleMessagesProvider({
  'required': 'Choisis un relevé',
  'file.extname': 'Choisis un relevé au format PDF',
  'file.size': 'Fichier trop lourd (10 Mo maximum)',
})

// Opérations choisies dans l'aperçu
export const importValidator = vine.create({
  accountId: vine.number(),
  lines: vine
    .array(
      vine.object({
        date: isoDate(),
        label: vine.string().trim().maxLength(255),
        amount: vine.number().positive(),
        direction: vine.enum(['debit', 'credit']),
        description: vine.string().trim().minLength(1).maxLength(100),
        note: vine.string().trim().maxLength(500).nullable(),
        // « cat:12 », « acc:3 » ou « »
        target: vine
          .string()
          .regex(/^((cat|acc):\d+)?$/)
          .optional(),
      })
    )
    .maxLength(500),
  // Opérations déjà présentes : on leur rattache leur libellé bancaire pour les prochains imports
  learn: vine
    .array(vine.object({ id: vine.number(), label: vine.string().trim().maxLength(255) }))
    .maxLength(500),
})
