import { describe, expect, it } from 'vitest'
import { experiences } from './index'
import { parseMonthLabel, timeline } from './timeline'

describe('parseMonthLabel', () => {
  it('extracts a display month and year from a dated label', () => {
    expect(parseMonthLabel('January 2026')).toEqual({ month: 'JAN', year: '2026' })
    expect(parseMonthLabel('August 2025')).toEqual({ month: 'AUG', year: '2025' })
  })

  it('keeps a bare year honest instead of inventing a month', () => {
    expect(parseMonthLabel('2023')).toEqual({ month: null, year: '2023' })
  })

  it('degrades an unrecognised label without manufacturing a date', () => {
    expect(parseMonthLabel('Present')).toEqual({ month: null, year: null })
  })
})

describe('timeline', () => {
  it('contains every validated experience exactly once', () => {
    const sourceIds = Object.values(experiences).flatMap(({ entries }) =>
      entries.map(({ id }) => id),
    )
    expect(timeline.map(({ entry }) => entry.id)).toHaveLength(sourceIds.length)
    expect(new Set(timeline.map(({ entry }) => entry.id))).toEqual(new Set(sourceIds))
  })

  /*
   * Asserted as a property of the ordering rather than as a literal list. The
   * ids encode "<year>-<month>", so a descending sort of the ids *is* newest
   * first — and stating it that way means adding a job to the CV no longer
   * breaks a test that has nothing to do with the change.
   */
  it('orders roles from newest to oldest, including entries in the same year', () => {
    const ids = timeline.map(({ entry }) => entry.id)
    expect(ids).toEqual([...ids].sort().reverse())
    expect(ids.length).toBeGreaterThan(1)
  })
})
