/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

// Pages accessibles uniquement aux visiteurs non connectés
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

// Pages accessibles uniquement aux utilisateurs connectés
router
  .group(() => {
    router.get('dashboard', [controllers.Dashboard, 'index']).as('dashboard')
    router.post('logout', [controllers.Session, 'destroy'])

    // Vue mensuelle
    router.get('months', [controllers.Months, 'show']).as('months.show')

    // Vue annuelle
    router.get('years', [controllers.Years, 'show']).as('years.show')

    // Catégories
    router.get('categories', [controllers.Categories, 'index']).as('categories.index')
    router.post('categories', [controllers.Categories, 'store']).as('categories.store')
    router.put('categories/:id', [controllers.Categories, 'update']).as('categories.update')
    router.delete('categories/:id', [controllers.Categories, 'destroy']).as('categories.destroy')

    // Comptes
    router.get('accounts', [controllers.Accounts, 'index']).as('accounts.index')
    router.post('accounts', [controllers.Accounts, 'store']).as('accounts.store')
    router.put('accounts/:id', [controllers.Accounts, 'update']).as('accounts.update')
    router.delete('accounts/:id', [controllers.Accounts, 'destroy']).as('accounts.destroy')

    // Objectif d'épargne
    router.put('savings-goal', [controllers.SavingsGoals, 'update']).as('savings_goal.update')
    router.delete('savings-goal', [controllers.SavingsGoals, 'destroy']).as('savings_goal.destroy')

    // Transactions
    router.get('transactions', [controllers.Transactions, 'index']).as('transactions.index')
    router.post('transactions', [controllers.Transactions, 'store']).as('transactions.store')
    router.put('transactions/:id', [controllers.Transactions, 'update']).as('transactions.update')
    router
      .delete('transactions/:id', [controllers.Transactions, 'destroy'])
      .as('transactions.destroy')

    // Opérations récurrentes
    router.get('recurring', [controllers.RecurringTransactions, 'index']).as('recurring.index')
    router.post('recurring', [controllers.RecurringTransactions, 'store']).as('recurring.store')
    router
      .put('recurring/:id', [controllers.RecurringTransactions, 'update'])
      .as('recurring.update')
    router
      .delete('recurring/:id', [controllers.RecurringTransactions, 'destroy'])
      .as('recurring.destroy')
  })
  .use([middleware.auth(), middleware.recurring()])
