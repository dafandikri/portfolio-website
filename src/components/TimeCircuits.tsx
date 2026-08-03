import { SegmentGroup } from './SevenSegment'
import type { Readout } from '../hooks/useClock'
import './TimeCircuits.css'

/**
 * The DeLorean's time circuits, carrying the career timeline.
 *
 * The prop is three stacked rows — red DESTINATION, green PRESENT, amber LAST
 * TIME DEPARTED — split into MONTH / DAY / YEAR / HOUR / MIN. That is already a
 * timeline widget, which is why this film earns a scene and the others do not.
 *
 * MONTH and YEAR are real. DAY, HOUR and MIN come from syntheticClock and are
 * decorative: three permanently dark columns make the panel look broken rather
 * than authentic. They are derived from the entry id so they never change for a
 * given role, and they are never presented as dates anywhere a reader would take
 * them for fact — the role's real dates are printed on its card.
 */

const ROWS = [
  { key: 'destination', label: 'Destination Time' },
  { key: 'present', label: 'Present Time' },
  { key: 'departed', label: 'Last Time Departed' },
] as const

export interface TimeCircuitsProps {
  destination: Readout | null
  present: Readout | null
  departed: Readout | null
}

function Row({
  variant,
  label,
  readout,
}: {
  variant: string
  label: string
  readout: Readout | null
}) {
  /*
   * Month and year only. The day, hour and minute columns are decorative
   * filler, so naming them here would read invented numbers to a screen-reader
   * user as though they were real dates — the exact deception the filler is
   * only acceptable for avoiding.
   */
  const readableDate = readout ? [readout.month, readout.year].filter(Boolean).join(' ') : 'Not set'

  return (
    <div className={`circuits__row circuits__row--${variant}`}>
      <span className="circuits__label">{label}</span>
      <span className="visually-hidden">{readableDate}</span>
      <div className="circuits__readout" aria-hidden="true">
        <span className="circuits__month">{readout?.month ?? '\u00a0'}</span>
        <SegmentGroup value={readout?.day ?? null} length={2} />
        <SegmentGroup value={readout?.year ?? null} length={4} />
        <SegmentGroup value={readout?.hour ?? null} length={2} />
        <SegmentGroup value={readout?.min ?? null} length={2} />
      </div>
    </div>
  )
}

export default function TimeCircuits({ destination, present, departed }: TimeCircuitsProps) {
  const rows = { destination, present, departed }

  return (
    <div className="circuits">
      <div className="circuits__headers" aria-hidden="true">
        <span />
        <div className="circuits__readout">
          <span className="circuits__col">Month</span>
          <span className="circuits__col">Day</span>
          <span className="circuits__col">Year</span>
          <span className="circuits__col">Hour</span>
          <span className="circuits__col">Min</span>
        </div>
      </div>

      {ROWS.map(({ key, label }) => (
        <Row
          /* Keyed by the value shown, so a changed row remounts and replays
             its hardware flicker without any timer. */
          key={`${key}-${rows[key]?.month ?? ''}${rows[key]?.year ?? 'empty'}`}
          variant={key}
          label={label}
          readout={rows[key]}
        />
      ))}
    </div>
  )
}
