import './KatoPerch.css'

/**
 * Kato, the Talk-Active macaw, perched on top of his project's paddock.
 *
 * He renders inside the containment `<li>` but sits in the airspace above it,
 * outside the unit's box, because that is the joke: on an island of
 * enclosures, the one asset not in containment is the mascot.
 *
 * He is a static image. Purely decorative, so he is hidden from assistive
 * technology and cannot receive pointer events — the paddock beneath him is
 * the interactive element and already carries its own accessible name.
 */
export default function KatoPerch() {
  return <span className="kato" aria-hidden="true" />
}
