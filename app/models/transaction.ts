import { TransactionSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Account from '#models/account'
import Category from '#models/category'

export default class Transaction extends TransactionSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>

  // Compte d'arrivée d'un virement
  @belongsTo(() => Account, { foreignKey: 'toAccountId' })
  declare toAccount: BelongsTo<typeof Account>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>
}
