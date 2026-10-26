/*
|--------------------------------------------------------------------------
| Sauvegarde quotidienne
|--------------------------------------------------------------------------
|
| Au démarrage du serveur puis toutes les heures, on vérifie que la
| sauvegarde du jour existe ; sinon on la crée.
|
*/

import logger from '@adonisjs/core/services/logger'
import { ensureDailyBackup, readableDir } from '#services/backup_service'

async function run() {
  try {
    const backup = await ensureDailyBackup()
    if (backup) logger.info(`Sauvegarde créée : ${readableDir()} › ${backup.name}`)
  } catch (error) {
    logger.error({ err: error }, 'La sauvegarde quotidienne a échoué')
  }
}

await run()
// unref : le minuteur n'empêche pas le serveur de s'arrêter
setInterval(run, 60 * 60 * 1000).unref()
