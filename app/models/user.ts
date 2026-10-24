import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Account from '#models/account'
import Category from '#models/category'
import Transaction from '#models/transaction'
import RecurringTransaction from '#models/recurring_transaction'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @hasMany(() => Account)
  declare accounts: HasMany<typeof Account>

  @hasMany(() => Category)
  declare categories: HasMany<typeof Category>

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @hasMany(() => RecurringTransaction)
  declare recurringTransactions: HasMany<typeof RecurringTransaction>

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
