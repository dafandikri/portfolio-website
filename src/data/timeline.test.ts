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

  it('orders roles from newest to oldest, including entries in the same year', () => {
    expect(timeline.map(({ entry }) => entry.id)).toEqual([
      '2026-01',
      '2025-08',
      '2025-07',
      '2024-06',
      '2023-01',
    ])
  })
})
