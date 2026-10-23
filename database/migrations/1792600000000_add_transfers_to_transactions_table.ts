import { BaseSchema } from '@adonisjs/lucid/schema'

const COLUMNS =
  'id, user_id, account_id, category_id, type, amount, date, description, note, created_at, updated_at'

// SQLite ne sait pas modifier la contrainte d'une colonne : on reconstruit la table
function createTable(types: string[], withTransfers: boolean) {
  return `CREATE TABLE transactions_new (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    account_id integer NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    category_id integer NULL REFERENCES categories (id) ON DELETE SET NULL,
    type text NOT NULL CHECK (type IN (${types.map((t) => `'${t}'`).join(', ')})),
    amount float NOT NULL,
    date date NOT NULL,
    description varchar(255) NOT NULL,
    note text NULL,
    created_at datetime,
    updated_at datetime${
      withTransfers
        ? ',\n    to_account_id integer NULL REFERENCES accounts (id) ON DELETE CASCADE'
        : ''
    }
  )`
}

/**
 * Virements entre deux comptes de l'utilisateur :
 * `account_id` = compte de départ, `to_account_id` = compte d'arrivée.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(createTable(['income', 'expense', 'transfer'], true))
      await db.rawQuery(
        `INSERT INTO transactions_new (${COLUMNS}) SELECT ${COLUMNS} FROM transactions`
      )
      await db.rawQuery('DROP TABLE transactions')
      await db.rawQuery('ALTER TABLE transactions_new RENAME TO transactions')
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(createTable(['income', 'expense'], false))
      await db.rawQuery(
        `INSERT INTO transactions_new (${COLUMNS}) SELECT ${COLUMNS} FROM transactions WHERE type != 'transfer'`
      )
      await db.rawQuery('DROP TABLE transactions')
      await db.rawQuery('ALTER TABLE transactions_new RENAME TO transactions')
    })
  }
}
