import './ScrollCue.css'

/**
 * A quiet mark telling the visitor there is more below.
 *
 * The card used to be the entire site, so nothing signalled a second screen.
 * Without a cue most visitors read the card and leave, and everything below it
 * never gets seen. It appears only after the blood has settled, so it does not
 * step on the punchline.
 */
interface ScrollCueProps {
  ready?: boolean
  /**
   * Scene-local skin. The behaviour is shared, the look is not: each set owns
   * its own palette and typeface, so the paddocks cannot wear the card's
   * letterpress cue.
   */
  className?: string
  label?: string
}

export default function ScrollCue({
  ready = true,
  className = '',
  label = 'Scroll',
}: ScrollCueProps) {
  return (
    <div
      className={`scroll-cue${ready ? ' is-ready' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <span className="scroll-cue__label">{label}</span>
      <span className="scroll-cue__rule" />
    </div>
  )
}
