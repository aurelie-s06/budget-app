import { RecurringTransactionSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Account from '#models/account'
import Category from '#models/category'
import Transaction from '#models/transaction'

export default class RecurringTransaction extends RecurringTransactionSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>

  // Compte d'arrivée d'un virement
  @belongsTo(() => Account, { foreignKey: 'toAccountId' })
  declare toAccount: BelongsTo<typeof Account>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  // Opérations déjà créées par cette récurrence
  @hasMany(() => Transaction, { foreignKey: 'recurringId' })
  declare transactions: HasMany<typeof Transaction>
}
