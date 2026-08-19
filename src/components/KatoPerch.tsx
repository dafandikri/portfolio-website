import './KatoPerch.css'

/**
 * Kato, the Talk-Active macaw, perched on top of his project's paddock.
 *
 * He renders inside the containment `<li>` but sits in the airspace above it,
 * outside the unit's box, because that is the joke: on an island of
 * enclosures, the one asset not in containment is the mascot.
 *
 * Purely decorative. The paddock beneath him is the interactive element and
 * already carries its own accessible name, so he is hidden from assistive
 * technology and cannot receive pointer events.
 *
 * The wrapper/bird split is load-bearing rather than cosmetic — see the note
 * at the top of KatoPerch.css.
 */
export default function KatoPerch() {
  return (
    <span className="kato" aria-hidden="true">
      <span className="kato__bird" />
    </span>
  )
}
