/**
 * A seven-segment digit, drawn rather than typed.
 *
 * A font would be easier, but the character of these displays is in the *unlit*
 * segments — you can always see the whole figure-eight faintly behind whatever
 * digit is showing. A font can only draw the lit parts, so it loses exactly the
 * detail that makes a panel read as hardware instead of as text.
 */

/** Segments per digit, in the conventional a–g order. */
const DIGITS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgedc',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abfgcd',
}

/** Polygon for each segment on a 100 × 180 grid. */
const SHAPES: Record<string, string> = {
  a: '14,6 76,6 66,20 24,20',
  b: '78,8 88,22 82,80 70,72',
  c: '80,98 86,156 76,170 68,106',
  d: '22,158 64,158 74,172 12,172',
  e: '12,98 24,106 16,170 6,156',
  f: '10,8 20,22 14,80 4,72',
  g: '20,84 68,84 78,90 68,96 20,96 10,90',
}

const ALL_SEGMENTS = Object.keys(SHAPES)

export interface SevenSegmentProps {
  /** A single character, or null for a wholly unlit position. */
  value: string | null
  className?: string
}

export default function SevenSegment({ value, className }: SevenSegmentProps) {
  const lit = value === null ? '' : (DIGITS[value] ?? '')

  return (
    <svg
      className={className ? `segment ${className}` : 'segment'}
      viewBox="0 0 92 180"
      aria-hidden="true"
      focusable="false"
    >
      {ALL_SEGMENTS.map((seg) => (
        <polygon
          key={seg}
          className={lit.includes(seg) ? 'segment__on' : 'segment__off'}
          points={SHAPES[seg]}
        />
      ))}
    </svg>
  )
}

/** Render a string as a row of segments, padding or trimming to `length`. */
export function SegmentGroup({
  value,
  length,
  className,
}: {
  value: string | null
  length: number
  className?: string
}) {
  const chars = (value ?? '').padStart(length, ' ').slice(-length).split('')
  return (
    <span className="segment-group" data-display={value ?? ''}>
      {chars.map((char, i) => (
        <SevenSegment key={i} value={char === ' ' ? null : char} className={className} />
      ))}
    </span>
  )
}
