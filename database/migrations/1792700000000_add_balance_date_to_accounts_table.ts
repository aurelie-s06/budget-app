import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Solde connu à une date : quand `balance_date` est rempli, `initial_balance`
 * est le solde du compte ce jour-là (opérations du jour comprises),
 * et non plus le solde avant toute opération.
 */
export default class extends BaseSchema {
  protected tableName = 'accounts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('balance_date').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('balance_date')
    })
  }
}
