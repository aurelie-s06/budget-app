import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Libellé de l'opération sur le relevé bancaire (« CARTE 12/02/26 MCDONALDS 319 2 CB*1969 »).
 * Sert à reconnaître les doublons et à reproposer le nom et la catégorie choisis la dernière fois.
 */
export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('bank_label').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('bank_label')
    })
  }
}
