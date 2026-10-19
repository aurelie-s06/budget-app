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
