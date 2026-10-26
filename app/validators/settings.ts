import vine, { SimpleMessagesProvider } from '@vinejs/vine'

// Messages en français pour les formulaires du profil
const messages = new SimpleMessagesProvider({
  'required': 'Ce champ est obligatoire',
  'email': 'Adresse email invalide',
  'database.unique': 'Cette adresse email est déjà utilisée',
  'minLength': 'Au moins {{ min }} caractères',
  'maxLength': 'Au plus {{ max }} caractères',
  'sameAs': 'Les deux mots de passe ne correspondent pas',
})

const password = () => vine.string().minLength(8).maxLength(32)

// Profil : l'email doit rester unique, sauf pour l'utilisateur lui-même
export const profileValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: vine.string().trim().maxLength(100).nullable(),
  email: vine
    .string()
    .trim()
    .email()
    .maxLength(254)
    .unique({
      table: 'users',
      column: 'email',
      filter: (db, _, field) => {
        db.whereNot('id', field.meta.userId)
      },
    }),
})
profileValidator.messagesProvider = messages

export const passwordValidator = vine.create({
  currentPassword: vine.string(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})
passwordValidator.messagesProvider = messages

// Suppression du compte : on redemande le mot de passe
export const deleteAccountValidator = vine.create({
  currentPassword: vine.string(),
})
deleteAccountValidator.messagesProvider = messages
