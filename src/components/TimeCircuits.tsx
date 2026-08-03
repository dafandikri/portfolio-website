import { SegmentGroup } from './SevenSegment'
import type { TimelineStop } from '../data/timeline'
import './TimeCircuits.css'

/**
 * The DeLorean's time circuits, carrying the career timeline.
 *
 * The prop is three stacked rows — red DESTINATION, green PRESENT, amber LAST
 * TIME DEPARTED — split into MONTH / DAY / YEAR / HOUR / MIN. That is already a
 * timeline widget, which is why this film earns a scene and the others do not.
 *
 * DAY, HOUR and MIN are left unlit throughout. The source data records months
 * and years only, and a real panel shows its unlit segments anyway, so blank
 * columns are both honest and in character. Filling them with invented times
 * would put false dates on a CV.
 */

const ROWS = [
  { key: 'destination', label: 'Destination Time' },
  { key: 'present', label: 'Present Time' },
  { key: 'departed', label: 'Last Time Departed' },
] as const

export interface TimeCircuitsProps {
  destination: TimelineStop
  present: TimelineStop
  departed: TimelineStop | null
}

function Row({
  variant,
  label,
  stop,
}: {
  variant: string
  label: string
  stop: TimelineStop | null
}) {
  const readableDate = stop ? [stop.month, stop.year].filter(Boolean).join(' ') : 'Not set'

  return (
    <div className={`circuits__row circuits__row--${variant}`}>
      <span className="circuits__label">{label}</span>
      <span className="visually-hidden">{readableDate}</span>
      <div className="circuits__readout" aria-hidden="true">
        <span className="circuits__month">{stop?.month ?? ' '}</span>
        <SegmentGroup value={null} length={2} />
        <SegmentGroup value={stop?.year ?? null} length={4} />
        <SegmentGroup value={null} length={2} />
        <SegmentGroup value={null} length={2} />
      </div>
    </div>
  )
}

export default function TimeCircuits({ destination, present, departed }: TimeCircuitsProps) {
  const stops = { destination, present, departed }

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
          key={`${key}-${stops[key]?.entry.id ?? 'empty'}`}
          variant={key}
          label={label}
          stop={stops[key]}
        />
      ))}
    </div>
  )
}
