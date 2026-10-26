/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  dashboard: typeof routes['dashboard']
  months: {
    show: typeof routes['months.show']
  }
  years: {
    show: typeof routes['years.show']
  }
  categories: {
    index: typeof routes['categories.index']
    store: typeof routes['categories.store']
    update: typeof routes['categories.update']
    destroy: typeof routes['categories.destroy']
  }
  accounts: {
    index: typeof routes['accounts.index']
    store: typeof routes['accounts.store']
    update: typeof routes['accounts.update']
    destroy: typeof routes['accounts.destroy']
  }
  savingsGoal: {
    update: typeof routes['savings_goal.update']
    destroy: typeof routes['savings_goal.destroy']
  }
  transactions: {
    index: typeof routes['transactions.index']
    store: typeof routes['transactions.store']
    update: typeof routes['transactions.update']
    destroy: typeof routes['transactions.destroy']
  }
  recurring: {
    index: typeof routes['recurring.index']
    store: typeof routes['recurring.store']
    update: typeof routes['recurring.update']
    destroy: typeof routes['recurring.destroy']
  }
  imports: {
    index: typeof routes['imports.index']
    preview: typeof routes['imports.preview']
    store: typeof routes['imports.store']
  }
  settings: {
    show: typeof routes['settings.show']
    profile: typeof routes['settings.profile']
    password: typeof routes['settings.password']
    export: typeof routes['settings.export']
    destroy: typeof routes['settings.destroy']
  }
}
