import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Classement confirmé : une opération laissée dans « Autres » (ou un revenu
 * sans catégorie) volontairement ne revient plus dans la liste « À classer ».
 */
export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('reviewed_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reviewed_at')
    })
  }
}
