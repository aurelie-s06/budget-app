import { test } from '@japa/runner'
import { clearFailures, recordFailure, retryAfterMinutes } from '#services/login_throttle'

test.group('Limite des tentatives de connexion', () => {
  test('bloque à la cinquième erreur, puis débloque après 15 minutes', ({ assert }) => {
    const start = 1_000_000
    for (let i = 0; i < 4; i++) recordFailure('a', start)
    assert.isNull(retryAfterMinutes('a', start))

    recordFailure('a', start)
    assert.equal(retryAfterMinutes('a', start), 15)
    assert.isNull(retryAfterMinutes('a', start + 15 * 60 * 1000))
  })

  test('une connexion réussie efface les erreurs, sans toucher aux autres', ({ assert }) => {
    for (let i = 0; i < 5; i++) {
      recordFailure('b')
      recordFailure('c')
    }
    clearFailures('b')
    assert.isNull(retryAfterMinutes('b'))
    assert.isNotNull(retryAfterMinutes('c'))
  })
})
