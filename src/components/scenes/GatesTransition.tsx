import { useScrollProgress } from '../../hooks/useScrollProgress'
import './GatesTransition.css'

/**
 * The way into the park.
 *
 * Two timber gates on lit posts, swinging open under the scroll. An earlier pass
 * put a hand-drawn dinosaur here instead; that was the wrong problem to pick,
 * because a convincing animal is a question of draughtsmanship and a gate is a
 * question of geometry — posts, beams, planks and light, all of which CSS draws
 * exactly. The roar is carried by sound rings and a shake rather than by a
 * creature, so nothing has to be drawn well for it to land.
 *
 * Purely choreographic, so hidden from assistive technology.
 *
 * Scroll progress → beat:
 *   0.00 – 0.18   torches come up on a closed gate
 *   0.16 – 0.34   the roar: rings from off-frame, and the whole stage shakes
 *   0.30 – 0.86   the gates swing out
 *   0.62 – 1.00   the light beyond floods the frame
 */
export default function GatesTransition() {
  const ref = useScrollProgress<HTMLElement>('--progress', 'pin')

  return (
    <section ref={ref} className="scene scene--gates" aria-hidden="true">
      <div className="gates__stage">
        {/* What is behind the gates, revealed as they part. */}
        <div className="gates__beyond" />

        {/* The roar, as pressure rather than as an animal. */}
        <div className="gates__roar">
          <span className="gates__wave gates__wave--1" />
          <span className="gates__wave gates__wave--2" />
          <span className="gates__wave gates__wave--3" />
        </div>

        <div className="gates__frame">
          <div className="gates__lintel">
            <span className="gates__plaque">Projects</span>
          </div>

          <div className="gates__post gates__post--left">
            <span className="gates__torch" />
          </div>
          <div className="gates__post gates__post--right">
            <span className="gates__torch" />
          </div>

          {/* Each leaf hinges on its own post, so they open outwards. */}
          <div className="gates__door gates__door--left">
            <span className="gates__planks" />
            <span className="gates__brace gates__brace--top" />
            <span className="gates__brace gates__brace--bottom" />
            <span className="gates__ring" />
          </div>
          <div className="gates__door gates__door--right">
            <span className="gates__planks" />
            <span className="gates__brace gates__brace--top" />
            <span className="gates__brace gates__brace--bottom" />
            <span className="gates__ring" />
          </div>
        </div>
      </div>
    </section>
  )
}
