import User from '#models/user'
import { clearFailures, recordFailure, retryAfterMinutes } from '#services/login_throttle'
import { loginValidator } from '#validators/user'
import { errors as authErrors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

// Erreur affichée sous le champ email, comme une erreur de validation
function loginError(message: string) {
  return new errors.E_VALIDATION_ERROR([{ field: 'email', message, rule: 'login' }])
}

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const key = `${request.ip()}|${email}`
    const minutes = retryAfterMinutes(key)
    if (minutes !== null) {
      throw loginError(`Trop de tentatives. Réessaie dans ${minutes} min.`)
    }

    let user
    try {
      user = await User.verifyCredentials(email, password)
    } catch (error) {
      if (!(error instanceof authErrors.E_INVALID_CREDENTIALS)) throw error
      recordFailure(key)
      // Même message dans les deux cas : on ne révèle pas si le compte existe
      throw loginError('Adresse email ou mot de passe incorrect')
    }

    clearFailures(key)
    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
