import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Opérations récurrentes : un modèle (loyer, abonnement, salaire…) qui crée
 * une vraie opération à chaque échéance. `generated_count` = échéances déjà créées.
 */
export default class extends BaseSchema {
  protected tableName = 'recurring_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('account_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('accounts')
        .onDelete('CASCADE')
      table
        .integer('to_account_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('accounts')
        .onDelete('CASCADE')
      table
        .integer('category_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('categories')
        .onDelete('SET NULL')
      table.enum('type', ['income', 'expense', 'transfer']).notNullable()
      table.decimal('amount', 12, 2).notNullable()
      table.string('description').notNullable()
      table.enum('frequency', ['weekly', 'monthly', 'yearly']).notNullable()
      // Première échéance ; les suivantes en sont déduites
      table.date('start_date').notNullable()
      table.date('end_date').nullable()
      table.integer('generated_count').notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Opération créée par une récurrence (conservée si la récurrence est supprimée)
    this.defer(async (db) => {
      await db.rawQuery(
        'ALTER TABLE transactions ADD COLUMN recurring_id integer NULL REFERENCES recurring_transactions (id) ON DELETE SET NULL'
      )
    })
  }

  async down() {
    this.schema.alterTable('transactions', (table) => {
      table.dropColumn('recurring_id')
    })
    this.schema.dropTable(this.tableName)
  }
}
