/**
 * Limite les tentatives de connexion par adresse email et par IP, pour freiner
 * les essais de mots de passe en série. En mémoire : le serveur est un processus
 * unique, et un redémarrage remet simplement les compteurs à zéro.
 */

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

const attempts = new Map<string, { count: number; expiresAt: number }>()

function purge(now: number) {
  for (const [key, entry] of attempts) if (entry.expiresAt <= now) attempts.delete(key)
}

// Minutes à attendre si la limite est atteinte, sinon null
export function retryAfterMinutes(key: string, now = Date.now()) {
  const entry = attempts.get(key)
  if (!entry || entry.expiresAt <= now || entry.count < MAX_ATTEMPTS) return null
  return Math.ceil((entry.expiresAt - now) / 60_000)
}

export function recordFailure(key: string, now = Date.now()) {
  purge(now)
  const entry = attempts.get(key)
  if (entry && entry.expiresAt > now) entry.count++
  else attempts.set(key, { count: 1, expiresAt: now + WINDOW_MS })
}

export function clearFailures(key: string) {
  attempts.delete(key)
}
