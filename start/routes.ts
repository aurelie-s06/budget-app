/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import CategoriesController from '#controllers/categories_controller'

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.on('/dashboard').renderInertia('dashboard', {}).as('dashboard')
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/categories', [CategoriesController, 'index']).as('categories.index')
    router.post('/categories', [CategoriesController, 'store']).as('categories.store')
    router.put('/categories/:id', [CategoriesController, 'update']).as('categories.update')
    router.delete('/categories/:id', [CategoriesController, 'destroy']).as('categories.destroy')
  })
  .use(middleware.auth())
