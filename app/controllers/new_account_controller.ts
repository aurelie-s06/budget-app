import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)
    const user = await User.create({ fullName, email, password })

    await user.related('categories').createMany([
      { name: 'Logement', color: '#6366f1' },
      { name: 'Alimentation', color: '#22c55e' },
      { name: 'Transports', color: '#0ea5e9' },
      { name: 'Santé', color: '#ef4444' },
      { name: 'Loisirs', color: '#f59e0b' },
      { name: 'Abonnements', color: '#a855f7' },
      { name: 'Restaurants', color: '#f97316' },
      { name: 'Autres', color: '#6b7280' },
    ])

    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }
}
