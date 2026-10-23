import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'savings_goals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // Un seul objectif par utilisateur
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.decimal('target_amount', 12, 2).notNullable()
      // L'épargne est comptée à partir de cette date
      table.date('start_date').notNullable()
      table.date('deadline').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
