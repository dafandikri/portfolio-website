import './FluxCapacitor.css'

/**
 * The flux capacitor: three arms meeting at a hub, firing in sequence.
 *
 * The prop's whole character is that the arms do not pulse together — they chase
 * one another around the Y, which is what makes it read as something cycling
 * rather than something merely blinking. Decorative, so hidden from AT.
 */
export default function FluxCapacitor() {
  return (
    <svg
      className="flux"
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {/* Housing */}
      <rect x="6" y="6" width="108" height="108" rx="6" className="flux__case" />

      {/* The three conduits, meeting at the hub. */}
      <g className="flux__arms">
        <path d="M60 60 L60 22" className="flux__arm" />
        <path d="M60 60 L27 82" className="flux__arm" />
        <path d="M60 60 L93 82" className="flux__arm" />
      </g>

      {/* Terminals at the end of each conduit, firing in sequence. */}
      <circle cx="60" cy="20" r="7" className="flux__node flux__node--1" />
      <circle cx="25" cy="84" r="7" className="flux__node flux__node--2" />
      <circle cx="95" cy="84" r="7" className="flux__node flux__node--3" />

      <circle cx="60" cy="60" r="9" className="flux__hub" />
    </svg>
  )
}
