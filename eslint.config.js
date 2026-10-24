import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

export default configApp(...react, {
  // Généré par « node ace migration:run »
  ignores: ['database/schema.ts'],
})
