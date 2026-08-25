import { experiencesData as experiences } from './experiences'
import type { ExperienceEntry } from './schema'
import type { Readout } from '../hooks/useClock'

/**
 * The experience data, flattened and ordered for the time circuits.
 *
 * `experiences` is keyed by year and each year holds entries labelled by month,
 * which is the right shape for a stacked list but not for a timeline that has to
 * step through roles one at a time.
 *
 * The rendered site imports the typed literal directly. `src/data/index.ts`
 * still validates it with Zod in tests and `scripts/validate-data.ts`; importing
 * that barrel here would also ship the validator, projects and skills merely to
 * display five already-typed records.
 */

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

/**
 * Plausible clock values for the DAY / HOUR / MIN columns.
 *
 * These are **decorative, not data**. The source records months and years only,
 * and three permanently blank columns make the panel look broken rather than
 * authentic. They are derived from the entry id so a given role always shows the
 * same numbers — a random value per render would flicker on every keystroke and
 * quietly imply a precision the data does not have.
 */
export function syntheticClock(id: string): { day: string; hour: string; min: string } {
  /*
   * FNV-1a with a final avalanche. A plain `hash * 31 + c` leaves the high bits
   * barely disturbed by the last character, so ids that differ only in their
   * tail — which every id here does, being "<year>-<month>" — produced the same
   * HOUR and MIN. Half the panel read identically from one role to the next,
   * which looks less like a prop and more like a bug.
   */
  let hash = 2166136261
  for (let i = 0; i < id.length; i += 1) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 16777619) >>> 0
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507) >>> 0
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909) >>> 0
  hash = (hash ^ (hash >>> 16)) >>> 0

  return {
    day: String((hash % 28) + 1).padStart(2, '0'),
    hour: String((hash >>> 8) % 24).padStart(2, '0'),
    min: String((hash >>> 17) % 60).padStart(2, '0'),
  }
}

export interface TimelineStop {
  entry: ExperienceEntry
  /** Three-letter month, or null where the source label carries only a year. */
  month: string | null
  /** Four-digit year, or null if the label has none. */
  year: string | null
}

/**
 * Read a month and year out of a label like "January 2026".
 *
 * Labels are not guaranteed to carry a month — the 2023 RISTEK entry is a bare
 * year — so the month is nullable rather than guessed. Inventing a month would
 * put a specific, wrong date on a real CV.
 */
export function parseMonthLabel(label: string): { month: string | null; year: string | null } {
  const year = label.match(/\b(\d{4})\b/)?.[1] ?? null
  const prefix = label.slice(0, 3).toUpperCase()
  const month = MONTHS.find((m) => m === prefix) ?? null
  return { month, year }
}

/** Position in the calendar, or -1 for a stop with no month at all. */
function monthIndex(month: string | null): number {
  return month === null ? -1 : MONTHS.findIndex((m) => m === month)
}

/**
 * Every role, most recent first — the order a reader of a CV expects, and the
 * order the circuits step through as the scene scrolls.
 */
export const timeline: TimelineStop[] = Object.keys(experiences)
  .sort((a, b) => Number(b) - Number(a))
  .flatMap((year) =>
    (experiences[year]?.entries ?? [])
      .map((entry) => ({ entry, ...parseMonthLabel(entry.monthLabel) }))
      .sort((a, b) => monthIndex(b.month) - monthIndex(a.month)),
  )

/**
 * The full CV line, "Role — Org".
 *
 * The same pairing is printed compactly across the card and its linked company
 * plaque. It remains the card button's accessible name so the two visible pieces
 * are announced as one useful control rather than as disconnected fragments.
 */
export function fullTitle(entry: ExperienceEntry): string {
  return `${entry.role} — ${entry.company?.name ?? entry.org}`
}

/** A timeline stop rendered as panel columns, with decorative clock digits. */
export function readoutFromStop(stop: TimelineStop | null): Readout | null {
  if (!stop) return null
  return { month: stop.month, year: stop.year, ...syntheticClock(stop.entry.id) }
}
