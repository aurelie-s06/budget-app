import { mkdir, readdir, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'

/**
 * Sauvegardes de la base SQLite : une copie complète par jour, les 15 dernières gardées.
 */

const PREFIX = 'mon-budget-'
const EXTENSION = '.sqlite3'
const KEEP = 15

// Heure française dans les noms de fichiers (le serveur tourne en UTC)
const now = () => DateTime.now().setZone('Europe/Paris')

const ICLOUD = join(homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs')

/**
 * Dossier des sauvegardes : BACKUP_DIR s'il est défini, sinon iCloud Drive
 * (copié hors de l'ordinateur), sinon le dossier Documents.
 */
export function backupDir() {
  const custom = env.get('BACKUP_DIR')
  if (custom) return custom
  const base = existsSync(ICLOUD) ? ICLOUD : join(homedir(), 'Documents')
  return join(base, 'Mon Budget', 'Sauvegardes')
}

// Chemin lisible : « iCloud Drive › Mon Budget › Sauvegardes »
export function readableDir(dir = backupDir()) {
  if (dir.startsWith(ICLOUD)) {
    return ['iCloud Drive', ...dir.slice(ICLOUD.length).split('/').filter(Boolean)].join(' › ')
  }
  return dir.replace(homedir(), '~')
}

export type Backup = { name: string; path: string; size: number; createdAt: DateTime }

/**
 * Sauvegardes existantes, de la plus récente à la plus ancienne.
 */
export async function listBackups(): Promise<Backup[]> {
  const dir = backupDir()
  if (!existsSync(dir)) return []
  const files = await readdir(dir)
  const names = files
    .filter((n) => n.startsWith(PREFIX) && n.endsWith(EXTENSION))
    .sort()
    .reverse()
  return Promise.all(
    names.map(async (name) => {
      const path = join(dir, name)
      const info = await stat(path)
      return { name, path, size: info.size, createdAt: DateTime.fromJSDate(info.mtime) }
    })
  )
}

/**
 * Copie la base dans le dossier des sauvegardes, puis supprime les plus anciennes.
 * VACUUM INTO produit une copie cohérente même pendant que l'app écrit.
 */
export async function createBackup() {
  const dir = backupDir()
  await mkdir(dir, { recursive: true })
  const name = `${PREFIX}${now().toFormat('yyyy-MM-dd_HH-mm-ss')}${EXTENSION}`
  const path = join(dir, name)
  await db.rawQuery('VACUUM INTO ?', [path])

  const backups = await listBackups()
  for (const old of backups.slice(KEEP)) await rm(old.path)
  return backups[0]
}

/**
 * Sauvegarde du jour, si elle n'a pas encore été faite.
 */
export async function ensureDailyBackup() {
  const today = `${PREFIX}${now().toISODate()}`
  const backups = await listBackups()
  if (backups.some((b) => b.name.startsWith(today))) return null
  return createBackup()
}
