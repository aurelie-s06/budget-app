import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'months.show': { paramsTuple?: []; params?: {} }
    'years.show': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'categories.store': { paramsTuple?: []; params?: {} }
    'categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accounts.index': { paramsTuple?: []; params?: {} }
    'accounts.store': { paramsTuple?: []; params?: {} }
    'accounts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accounts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'savings_goal.update': { paramsTuple?: []; params?: {} }
    'savings_goal.destroy': { paramsTuple?: []; params?: {} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.store': { paramsTuple?: []; params?: {} }
    'transactions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recurring.index': { paramsTuple?: []; params?: {} }
    'recurring.store': { paramsTuple?: []; params?: {} }
    'recurring.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recurring.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triage.index': { paramsTuple?: []; params?: {} }
    'triage.update': { paramsTuple?: []; params?: {} }
    'imports.index': { paramsTuple?: []; params?: {} }
    'imports.preview': { paramsTuple?: []; params?: {} }
    'imports.store': { paramsTuple?: []; params?: {} }
    'settings.show': { paramsTuple?: []; params?: {} }
    'settings.profile': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
    'settings.export': { paramsTuple?: []; params?: {} }
    'settings.backup': { paramsTuple?: []; params?: {} }
    'settings.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'months.show': { paramsTuple?: []; params?: {} }
    'years.show': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'accounts.index': { paramsTuple?: []; params?: {} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'recurring.index': { paramsTuple?: []; params?: {} }
    'triage.index': { paramsTuple?: []; params?: {} }
    'imports.index': { paramsTuple?: []; params?: {} }
    'settings.show': { paramsTuple?: []; params?: {} }
    'settings.export': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'months.show': { paramsTuple?: []; params?: {} }
    'years.show': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'accounts.index': { paramsTuple?: []; params?: {} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'recurring.index': { paramsTuple?: []; params?: {} }
    'triage.index': { paramsTuple?: []; params?: {} }
    'imports.index': { paramsTuple?: []; params?: {} }
    'settings.show': { paramsTuple?: []; params?: {} }
    'settings.export': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'categories.store': { paramsTuple?: []; params?: {} }
    'accounts.store': { paramsTuple?: []; params?: {} }
    'transactions.store': { paramsTuple?: []; params?: {} }
    'recurring.store': { paramsTuple?: []; params?: {} }
    'triage.update': { paramsTuple?: []; params?: {} }
    'imports.preview': { paramsTuple?: []; params?: {} }
    'imports.store': { paramsTuple?: []; params?: {} }
    'settings.backup': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accounts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'savings_goal.update': { paramsTuple?: []; params?: {} }
    'transactions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recurring.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.profile': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'categories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accounts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'savings_goal.destroy': { paramsTuple?: []; params?: {} }
    'transactions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recurring.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}