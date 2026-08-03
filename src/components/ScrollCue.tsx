import './ScrollCue.css'

/**
 * A quiet mark telling the visitor there is more below.
 *
 * The card used to be the entire site, so nothing signalled a second screen.
 * Without a cue most visitors read the card and leave, and everything below it
 * never gets seen. It appears only after the blood has settled, so it does not
 * step on the punchline.
 */
export default function ScrollCue() {
  return (
    <div className="scroll-cue" aria-hidden="true">
      <span className="scroll-cue__label">Scroll</span>
      <span className="scroll-cue__rule" />
    </div>
  )
}
