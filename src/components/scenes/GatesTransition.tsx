import { useScrollProgress } from '../../hooks/useScrollProgress'
import './GatesTransition.css'

/**
 * The way into the park.
 *
 * Monumental timber doors between two stone pylons, torches burning on their
 * caps, and a rex roaring in from the left as they swing.
 *
 * The rex is a sourced silhouette rather than anything drawn here. Two attempts
 * at drawing it by hand failed in different ways, which was the signal that the
 * task itself was wrong: gates are geometry and CSS draws them exactly, but an
 * animal is anatomy and wants a reference.
 *
 * Purely choreographic, so hidden from assistive technology.
 *
 * Scroll progress → beat:
 *   0.00 – 0.16   torches come up on a closed gate
 *   0.14 – 0.38   the rex leans in and roars; the stage shakes and the echo runs
 *   0.34 – 0.86   the gates swing out
 *   0.62 – 1.00   the light beyond floods the frame
 */

/**
 * The wordmark, letter by letter.
 *
 * The film's face is Neuland, which is not a web font and has no close free
 * substitute. What actually makes it read is not the outlines but the fact that
 * it looks *cut by hand* — very heavy, angular, and never quite regular. So each
 * letter is set in the heaviest face available and given its own small rotation
 * and width, which buys that irregularity honestly instead of pretending to a
 * typeface we do not have.
 */
const WORDMARK = 'PROJECTS'.split('').map((char, i) => ({
  char,
  tilt: [-1.6, 1.1, -0.7, 1.8, -1.2, 0.6, -1.9, 1.3][i] ?? 0,
  squeeze: [1.02, 0.97, 1.05, 0.99, 1.03, 0.96, 1.04, 1] [i] ?? 1,
}))

export default function GatesTransition() {
  const ref = useScrollProgress<HTMLElement>('--progress', 'pin')

  return (
    <section ref={ref} className="scene scene--gates" aria-hidden="true">
      <div className="gates__stage">
        {/* What is behind the gates, revealed as they part. */}
        <div className="gates__beyond" />

        {/*
          The rex, leaning in from off-frame left.

          The silhouette is a real one, not a drawing of mine — two attempts at
          hand-drawing the animal produced a greyhound and then a cartoon, and the
          problem was never the curves but the choice to draw anatomy at all. This
          is Fred Wierum's Tyrannosaurus from PhyloPic, used under CC BY 4.0 and
          credited in the projects scene below.

          It is loaded as a mask rather than an image so it stays a silhouette we
          light, and it lives in `public/` rather than inline because 20 KB of
          path data has no business in the JavaScript chunk.
        */}
        <div className="gates__rex">
          <span className="gates__rex-shape" />
          <span className="gates__echo gates__echo--1" />
          <span className="gates__echo gates__echo--2" />
          <span className="gates__echo gates__echo--3" />
        </div>

        <div className="gates__frame">
          {/* The crossbeam, carrying the sign. */}
          <div className="gates__lintel">
            <span className="gates__banner">
              {WORDMARK.map(({ char, tilt, squeeze }, i) => (
                <span
                  key={i}
                  className="gates__glyph"
                  style={{ transform: `rotate(${tilt}deg) scaleX(${squeeze})` }}
                >
                  {char}
                </span>
              ))}
            </span>
          </div>

          {/* Stone pylons, each capped with a burning brazier. */}
          <div className="gates__pylon gates__pylon--left">
            <span className="gates__cap" />
            <span className="gates__torch" />
            <span className="gates__lamp" />
          </div>
          <div className="gates__pylon gates__pylon--right">
            <span className="gates__cap" />
            <span className="gates__torch" />
            <span className="gates__lamp" />
          </div>

          {/* Each leaf hinges on the pylon it hangs from. */}
          <div className="gates__door gates__door--left">
            <span className="gates__planks" />
            <span className="gates__brace gates__brace--top" />
            <span className="gates__brace gates__brace--mid" />
            <span className="gates__brace gates__brace--bottom" />
            <span className="gates__ring" />
          </div>
          <div className="gates__door gates__door--right">
            <span className="gates__planks" />
            <span className="gates__brace gates__brace--top" />
            <span className="gates__brace gates__brace--mid" />
            <span className="gates__brace gates__brace--bottom" />
            <span className="gates__ring" />
          </div>
        </div>
      </div>
    </section>
  )
}
