/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

// Messages en français pour tous les formulaires
vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Ce champ est obligatoire',
  'string': 'Ce champ doit être un texte',
  'number': 'Saisis un nombre',
  'positive': 'Saisis un montant supérieur à 0',
  'min': 'La valeur minimale est {{ min }}',
  'email': 'Adresse email invalide',
  'regex': 'Format invalide',
  'enum': 'Choisis une valeur dans la liste',
  'minLength': 'Au moins {{ min }} caractères',
  'maxLength': 'Au plus {{ max }} caractères',
  'sameAs': 'Les deux mots de passe ne correspondent pas',
  'database.unique': 'Cette adresse email est déjà utilisée',
})
