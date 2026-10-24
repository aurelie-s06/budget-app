import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import type RecurringTransaction from '#models/recurring_transaction'
import { nextOccurrence, occurrenceDate, pastOccurrences } from '#services/recurring_service'

// Récurrence minimale : seules les dates comptent pour ces calculs
const rule = (frequency: string, start: string, end: string | null = null, generatedCount = 0) =>
  ({
    frequency,
    startDate: DateTime.fromISO(start),
    endDate: end ? DateTime.fromISO(end) : null,
    generatedCount,
  }) as RecurringTransaction

test.group('Opérations récurrentes', () => {
  test('un loyer du 31 retombe le 31 après un mois court', ({ assert }) => {
    const r = rule('monthly', '2026-01-31')
    assert.equal(occurrenceDate(r, 1).toISODate(), '2026-02-28')
    assert.equal(occurrenceDate(r, 2).toISODate(), '2026-03-31')
  })

  test('hebdomadaire et annuelle', ({ assert }) => {
    assert.equal(occurrenceDate(rule('weekly', '2026-10-05'), 2).toISODate(), '2026-10-19')
    assert.equal(occurrenceDate(rule('yearly', '2026-07-14'), 1).toISODate(), '2027-07-14')
  })

  test('terminée après la date de fin', ({ assert }) => {
    assert.isNull(nextOccurrence(rule('monthly', '2026-01-05', '2026-03-05', 3)))
    assert.equal(
      nextOccurrence(rule('monthly', '2026-01-05', '2026-03-05', 2))?.toISODate(),
      '2026-03-05'
    )
  })

  test('compte les échéances passées, aujourd’hui compris', ({ assert }) => {
    const today = DateTime.now().startOf('day')
    const start = today.minus({ months: 2 }).toISODate()!
    assert.equal(pastOccurrences(rule('monthly', start)), 3)
    assert.equal(pastOccurrences(rule('monthly', today.plus({ days: 1 }).toISODate()!)), 0)
  })
})
