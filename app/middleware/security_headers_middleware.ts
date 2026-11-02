import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * En-têtes de sécurité non couverts par shield. Une fois connecté, les pages
 * contiennent des données financières : le navigateur ne doit pas les conserver.
 */
export default class SecurityHeadersMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    response.header('Referrer-Policy', 'same-origin')
    if (auth.user) response.header('Cache-Control', 'no-store')
    return next()
  }
}
