/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [[0,"/"]],
    types: placeholder as Registry['home']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [[0,"signup"]],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [[0,"signup"]],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['session.store']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [[0,"dashboard"]],
    types: placeholder as Registry['dashboard']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [[0,"logout"]],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'months.show': {
    methods: ["GET","HEAD"],
    pattern: '/months',
    tokens: [[0,"months"]],
    types: placeholder as Registry['months.show']['types'],
  },
  'years.show': {
    methods: ["GET","HEAD"],
    pattern: '/years',
    tokens: [[0,"years"]],
    types: placeholder as Registry['years.show']['types'],
  },
  'categories.index': {
    methods: ["GET","HEAD"],
    pattern: '/categories',
    tokens: [[0,"categories"]],
    types: placeholder as Registry['categories.index']['types'],
  },
  'categories.store': {
    methods: ["POST"],
    pattern: '/categories',
    tokens: [[0,"categories"]],
    types: placeholder as Registry['categories.store']['types'],
  },
  'categories.update': {
    methods: ["PUT"],
    pattern: '/categories/:id',
    tokens: [[0,"categories"],[1,"id"]],
    types: placeholder as Registry['categories.update']['types'],
  },
  'categories.destroy': {
    methods: ["DELETE"],
    pattern: '/categories/:id',
    tokens: [[0,"categories"],[1,"id"]],
    types: placeholder as Registry['categories.destroy']['types'],
  },
  'accounts.index': {
    methods: ["GET","HEAD"],
    pattern: '/accounts',
    tokens: [[0,"accounts"]],
    types: placeholder as Registry['accounts.index']['types'],
  },
  'accounts.store': {
    methods: ["POST"],
    pattern: '/accounts',
    tokens: [[0,"accounts"]],
    types: placeholder as Registry['accounts.store']['types'],
  },
  'accounts.update': {
    methods: ["PUT"],
    pattern: '/accounts/:id',
    tokens: [[0,"accounts"],[1,"id"]],
    types: placeholder as Registry['accounts.update']['types'],
  },
  'accounts.destroy': {
    methods: ["DELETE"],
    pattern: '/accounts/:id',
    tokens: [[0,"accounts"],[1,"id"]],
    types: placeholder as Registry['accounts.destroy']['types'],
  },
  'savings_goal.update': {
    methods: ["PUT"],
    pattern: '/savings-goal',
    tokens: [[0,"savings-goal"]],
    types: placeholder as Registry['savings_goal.update']['types'],
  },
  'savings_goal.destroy': {
    methods: ["DELETE"],
    pattern: '/savings-goal',
    tokens: [[0,"savings-goal"]],
    types: placeholder as Registry['savings_goal.destroy']['types'],
  },
  'transactions.index': {
    methods: ["GET","HEAD"],
    pattern: '/transactions',
    tokens: [[0,"transactions"]],
    types: placeholder as Registry['transactions.index']['types'],
  },
  'transactions.store': {
    methods: ["POST"],
    pattern: '/transactions',
    tokens: [[0,"transactions"]],
    types: placeholder as Registry['transactions.store']['types'],
  },
  'transactions.update': {
    methods: ["PUT"],
    pattern: '/transactions/:id',
    tokens: [[0,"transactions"],[1,"id"]],
    types: placeholder as Registry['transactions.update']['types'],
  },
  'transactions.destroy': {
    methods: ["DELETE"],
    pattern: '/transactions/:id',
    tokens: [[0,"transactions"],[1,"id"]],
    types: placeholder as Registry['transactions.destroy']['types'],
  },
  'recurring.index': {
    methods: ["GET","HEAD"],
    pattern: '/recurring',
    tokens: [[0,"recurring"]],
    types: placeholder as Registry['recurring.index']['types'],
  },
  'recurring.store': {
    methods: ["POST"],
    pattern: '/recurring',
    tokens: [[0,"recurring"]],
    types: placeholder as Registry['recurring.store']['types'],
  },
  'recurring.update': {
    methods: ["PUT"],
    pattern: '/recurring/:id',
    tokens: [[0,"recurring"],[1,"id"]],
    types: placeholder as Registry['recurring.update']['types'],
  },
  'recurring.destroy': {
    methods: ["DELETE"],
    pattern: '/recurring/:id',
    tokens: [[0,"recurring"],[1,"id"]],
    types: placeholder as Registry['recurring.destroy']['types'],
  },
  'imports.index': {
    methods: ["GET","HEAD"],
    pattern: '/imports',
    tokens: [[0,"imports"]],
    types: placeholder as Registry['imports.index']['types'],
  },
  'imports.preview': {
    methods: ["POST"],
    pattern: '/imports/preview',
    tokens: [[0,"imports"],[0,"preview"]],
    types: placeholder as Registry['imports.preview']['types'],
  },
  'imports.store': {
    methods: ["POST"],
    pattern: '/imports',
    tokens: [[0,"imports"]],
    types: placeholder as Registry['imports.store']['types'],
  },
  'settings.show': {
    methods: ["GET","HEAD"],
    pattern: '/settings',
    tokens: [[0,"settings"]],
    types: placeholder as Registry['settings.show']['types'],
  },
  'settings.profile': {
    methods: ["PUT"],
    pattern: '/settings/profile',
    tokens: [[0,"settings"],[0,"profile"]],
    types: placeholder as Registry['settings.profile']['types'],
  },
  'settings.password': {
    methods: ["PUT"],
    pattern: '/settings/password',
    tokens: [[0,"settings"],[0,"password"]],
    types: placeholder as Registry['settings.password']['types'],
  },
  'settings.export': {
    methods: ["GET","HEAD"],
    pattern: '/settings/export',
    tokens: [[0,"settings"],[0,"export"]],
    types: placeholder as Registry['settings.export']['types'],
  },
  'settings.backup': {
    methods: ["POST"],
    pattern: '/settings/backup',
    tokens: [[0,"settings"],[0,"backup"]],
    types: placeholder as Registry['settings.backup']['types'],
  },
  'settings.destroy': {
    methods: ["DELETE"],
    pattern: '/settings',
    tokens: [[0,"settings"]],
    types: placeholder as Registry['settings.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
