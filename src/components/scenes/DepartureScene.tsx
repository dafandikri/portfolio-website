import { useScrollProgress } from '../../hooks/useScrollProgress'
import './DepartureScene.css'

/**
 * The transition out of the card and into 1985.
 *
 * The scene is *pinned*: a tall outer section holds a sticky, viewport-height
 * stage, so the sequence plays while held still in front of the viewer instead
 * of sliding past. Progress is scrubbed by scroll, so it runs forward on the way
 * down and backward on the way up rather than firing once and being spent.
 *
 * It opens on the card's own white and burns down to black, so the two scenes
 * share an edge rather than being cut together.
 *
 * Purely choreographic, so hidden from assistive technology entirely.
 */

/** One tongue of flame. Several overlap to make a fire. */
function Tongue({ index }: { index: number }) {
  return <span className={`flame__tongue flame__tongue--${index}`} />
}

export default function DepartureScene() {
  const ref = useScrollProgress<HTMLElement>('--progress', 'pin')

  return (
    <section ref={ref} className="scene scene--departure" aria-hidden="true">
      <svg className="departure__defs" aria-hidden="true" focusable="false">
        <defs>
          {/*
            The "gooey" filter: blur everything, then crush the alpha ramp back
            to hard edges. Separate soft blobs merge into one organic mass with a
            wobbling outline — which is what a flame is. A gradient inside a
            rounded rectangle can only ever be a lamp, however it is coloured,
            because its silhouette is still a rounded rectangle.
          */}
          <filter id="flame-goo" x="-60%" y="-30%" width="220%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 14 -5"
              result="goo"
            />
            {/* Then chew the merged edge so it licks rather than bulges. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves="2" seed="5">
              <animate
                attributeName="seed"
                dur="1.6s"
                values="5;40;5"
                repeatCount="indefinite"
                calcMode="discrete"
              />
            </feTurbulence>
            <feDisplacementMap
              in="goo"
              scale="11"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="departure__stage">
        <div className="departure__wash" />

        <div className="departure__road">
          <div className="departure__trail departure__trail--left">
            <span className="flame">
              {[0, 1, 2, 3, 4].map((i) => (
                <Tongue key={i} index={i} />
              ))}
            </span>
          </div>
          <div className="departure__trail departure__trail--right">
            <span className="flame">
              {[0, 1, 2, 3, 4].map((i) => (
                <Tongue key={i} index={i} />
              ))}
            </span>
          </div>
          <span className="departure__flash" />
        </div>

        <div className="departure__plate-well">
          <div className="departure__plate">
            <span className="departure__plate-face">
              <span className="departure__plate-state">California</span>
              <span className="departure__plate-text">OUTATIME</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
