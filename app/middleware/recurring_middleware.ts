import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { generateRecurring } from '#services/recurring_service'

/**
 * Crée les opérations récurrentes arrivées à échéance avant d'afficher une page,
 * pour que les soldes et les listes soient toujours à jour.
 */
export default class RecurringMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user
    if (user && ctx.request.method() === 'GET') await generateRecurring(user)
    return next()
  }
}
