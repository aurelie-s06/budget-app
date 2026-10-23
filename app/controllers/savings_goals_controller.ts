import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SavingsGoal from '#models/savings_goal'
import { savingsGoalValidator } from '#validators/savings_goal'

export default class SavingsGoalsController {
  // Création ou modification : un seul objectif par utilisateur
  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(savingsGoalValidator)

    await SavingsGoal.updateOrCreate(
      { userId: user.id },
      {
        name: data.name,
        targetAmount: data.targetAmount,
        startDate: DateTime.fromISO(data.startDate),
        deadline: data.deadline ? DateTime.fromISO(data.deadline) : null,
      }
    )
    return response.redirect().back()
  }

  // Suppression
  async destroy({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await SavingsGoal.query().where('userId', user.id).delete()
    return response.redirect().back()
  }
}
