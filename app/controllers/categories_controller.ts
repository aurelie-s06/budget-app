import type { HttpContext } from '@adonisjs/core/http'
import { categoryValidator } from '#validators/category'

export default class CategoriesController {
  // Liste des catégories de l'utilisateur connecté
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const categories = await user.related('categories').query().orderBy('name')
    return inertia.render('categories/index', {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        monthlyBudget: c.monthlyBudget,
      })),
    })
  }

  // Création
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(categoryValidator)
    await user.related('categories').create(data)
    return response.redirect().back()
  }

  // Modification
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const category = await user.related('categories').query().where('id', params.id).firstOrFail()
    const data = await request.validateUsing(categoryValidator)
    category.merge(data)
    await category.save()
    return response.redirect().back()
  }

  // Suppression
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const category = await user.related('categories').query().where('id', params.id).firstOrFail()
    await category.delete()
    return response.redirect().back()
  }
}
