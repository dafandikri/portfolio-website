import { useEffect, useState } from 'react'

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const

export interface Readout {
  month: string | null
  day: string | null
  year: string | null
  hour: string | null
  min: string | null
}

export function readoutFromDate(date: Date): Readout {
  return {
    month: MONTHS[date.getMonth()] ?? null,
    day: String(date.getDate()).padStart(2, '0'),
    year: String(date.getFullYear()),
    hour: String(date.getHours()).padStart(2, '0'),
    min: String(date.getMinutes()).padStart(2, '0'),
  }
}

/**
 * The viewer's own clock, for the PRESENT TIME row.
 *
 * On the prop, PRESENT TIME is genuinely now — so it should be the visitor's
 * now, in their own timezone, not a date baked into the build. `new Date()`
 * already reads the machine's local zone, so nothing here needs to know where
 * anybody is.
 *
 * Ticks once a minute rather than once a second: the panel has no seconds
 * column, so a per-second interval would re-render sixty times for every one
 * visible change. It aligns the first tick to the top of the minute so the
 * display never lags reality by up to 59 seconds.
 */
export function useClock(): Readout {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    const msToNextMinute = 60_000 - (Date.now() % 60_000)

    const start = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), 60_000)
    }, msToNextMinute)

    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [])

  return readoutFromDate(now)
}
