import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().trim().email().toLowerCase().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(128)

/**
 * Validator to use when performing self-signup.
 *
 * The "passwordConfirmation" field is declared explicitly, so that it is part
 * of the request body type shared with the frontend. Otherwise the signup form
 * has no way to know about the errors reported for this field.
 */
export const signupValidator = vine.create({
  fullName: vine.string().trim().maxLength(100).nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string().maxLength(128),
})
