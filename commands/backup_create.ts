import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class BackupCreate extends BaseCommand {
  static commandName = 'backup:create'
  static description = 'Sauvegarde la base de données (iCloud Drive › Mon Budget › Sauvegardes)'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { createBackup, readableDir } = await import('#services/backup_service')
    const backup = await createBackup()
    this.logger.success(`Sauvegarde créée : ${readableDir()} › ${backup.name}`)
  }
}
