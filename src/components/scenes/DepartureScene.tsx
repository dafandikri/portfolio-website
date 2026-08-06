import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
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
 * It opens on the walnut desk's darkness and reveals 1985 through it, so the
 * two scenes share a shadowed edge rather than flashing to an unrelated white.
 *
 * Purely choreographic, so hidden from assistive technology entirely.
 */

/** Inline styles that carry custom properties down to the stylesheet. */
type EmberStyle = CSSProperties & Record<`--${string}`, string>

/** Licks per track, spaced evenly along its length. */
const EMBERS = 22

/**
 * Where the near end of a track sits, measured out from the vanishing point at
 * the centre of the stage. The far end is the vanishing point itself, so the two
 * tracks meet exactly at the middle of the screen by construction rather than by
 * tuning a perspective until they look about right.
 */
const NEAR_X_VW = 15
const NEAR_Y_VH = 44
const NEAR_SIZE_VH = 7

/** How much smaller the far end of a track is than the near end. */
const FAR_SHRINK = 1 / 26

/** How hard the flame front decelerates as it runs off towards the horizon. */
const RECEDE = 2.2

/** When, in scroll progress, the flame front leaves the camera and reaches the horizon. */
const LAY_FROM = 0.16
const LAY_TO = 0.54

/**
 * One trailing flame, laid along the road.
 *
 * The important thing is what does *not* move. An earlier pass had each track
 * translate in Z from wide to narrow, which made two burning objects start apart
 * and close on each other — unavoidably a collision, whatever the timing. Fire
 * left by a departing car is painted on the tarmac and perfectly still; the two
 * lines converge only because everything far away converges. So the geometry is
 * fixed and only the *flame front* travels, running from the camera out to the
 * vanishing point at the speed of the car that is already out of frame.
 *
 * The licks are spaced evenly on screen rather than evenly in world depth. Depth
 * spacing bunches them all against the camera and leaves the last stretch to the
 * horizon bare, which is the half of the track that has to read as distance.
 */
function track(direction: -1 | 1): EmberStyle[] {
  return Array.from({ length: EMBERS }, (_, i) => {
    const u = i / (EMBERS - 1)
    // Perspective scale: 1 at the camera, FAR_SHRINK at the vanishing point.
    const inv = 1 - u * (1 - FAR_SHRINK)
    // How far along the track this lick sits, as a fraction of its length.
    const along = 1 - inv

    /*
     * When the flame front passes this point. The front decelerates as it
     * recedes — that deceleration is most of what sells the distance — so the
     * time is the inverse of the same curve the bed underneath is drawn with.
     */
    const ignite = LAY_FROM + (LAY_TO - LAY_FROM) * (1 - (1 - along) ** (1 / RECEDE))

    // Deterministic per-lick phase. Fire flickering in unison reads as a pulsing
    // lamp — which is the exact note this scene has drawn twice.
    const jitter = ((i * 37) % 100) / 100

    return {
      '--x': `${(direction * NEAR_X_VW * inv).toFixed(3)}`,
      '--y': `${(NEAR_Y_VH * inv).toFixed(3)}`,
      '--size': `${Math.max(NEAR_SIZE_VH * inv, 1).toFixed(3)}`,
      // Depth lives in the colour ramp: only the near end keeps a white core, so
      // the trail cools into the distance instead of glowing at the horizon.
      '--heat': `${(0.08 + 0.92 * inv ** 0.7).toFixed(3)}`,
      '--ignite': `${ignite.toFixed(3)}`,
      '--beat': `${(0.62 + jitter * 0.45).toFixed(3)}s`,
      '--phase': `-${(jitter * 1.1).toFixed(3)}s`,
    }
  })
}

const TRACKS = { left: track(-1), right: track(1) }

/* Pointer momentum depends on a real layout box and animation clock; jsdom has
   neither. The rendered interactive wrapper remains covered by scene tests. */
/* v8 ignore start */
function usePlateImpulse() {
  const plateRef = useRef<HTMLSpanElement>(null)
  const motion = useRef({
    x: 0, y: 0, pitch: 0, yaw: 0, roll: 0,
    vx: 0, vy: 0, vpitch: 0, vyaw: 0, vroll: 0,
  })
  const animation = useRef({ frame: 0, previous: 0 })

  useEffect(() => {
    const animationState = animation.current
    return () => cancelAnimationFrame(animationState.frame)
  }, [])

  const tick = (now: number) => {
    const plate = plateRef.current
    if (!plate) {
      animation.current.frame = 0
      return
    }
    const delta = Math.min(0.05, Math.max(0.001, (now - animation.current.previous) / 1000))
    animation.current.previous = now
    const state = motion.current
    const damping = Math.exp(-2.65 * delta)

    state.vx = (state.vx - state.x * 5.2 * delta) * damping
    state.vy = (state.vy - state.y * 5.2 * delta) * damping
    state.vpitch = (state.vpitch - state.pitch * 6.1 * delta) * damping
    state.vyaw = (state.vyaw - state.yaw * 6.1 * delta) * damping
    state.vroll = (state.vroll - state.roll * 6.1 * delta) * damping
    state.x += state.vx * delta
    state.y += state.vy * delta
    state.pitch += state.vpitch * delta
    state.yaw += state.vyaw * delta
    state.roll += state.vroll * delta

    plate.style.setProperty('--plate-kick-x', `${state.x.toFixed(3)}px`)
    plate.style.setProperty('--plate-kick-y', `${state.y.toFixed(3)}px`)
    plate.style.setProperty('--plate-kick-pitch', `${state.pitch.toFixed(3)}deg`)
    plate.style.setProperty('--plate-kick-yaw', `${state.yaw.toFixed(3)}deg`)
    plate.style.setProperty('--plate-kick-roll', `${state.roll.toFixed(3)}deg`)

    const energy = Math.abs(state.x) + Math.abs(state.y) + Math.abs(state.pitch)
      + Math.abs(state.yaw) + Math.abs(state.roll) + Math.abs(state.vx) + Math.abs(state.vy)
      + Math.abs(state.vpitch) + Math.abs(state.vyaw) + Math.abs(state.vroll)
    if (energy < 0.08) {
      animation.current.frame = 0
      return
    }
    animation.current.frame = requestAnimationFrame(tick)
  }

  const pokePlate = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2
    const state = motion.current

    // Force travels away from the clicked side. Each click accumulates with
    // existing momentum, so it can become amusingly unstable before the
    // damped springs pull it back into the original swirl.
    state.vx += -x * 92
    state.vy += -y * 58
    state.vpitch += y * 170
    state.vyaw += -x * 230
    state.vroll += -x * 145 + (Math.random() - 0.5) * 24
    if (animation.current.frame === 0) {
      animation.current.previous = performance.now()
      animation.current.frame = requestAnimationFrame(tick)
    }
  }

  return { plateRef, pokePlate }
}
/* v8 ignore stop */

function Track({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`departure__track departure__track--${side}`}>
      {/*
        The bed is the flame itself: one wedge from the camera to the vanishing
        point, so the trail is continuous and converges by construction. It is
        blurred by its wrapper rather than by itself, because clipping happens
        after filtering — blurring the wedge directly would leave the polygon's
        straight edges perfectly crisp.
      */}
      <span className="departure__bed-blur">
        <span className="departure__bed" />
      </span>

      {/* And the licks on top, merged by the goo filter into one wobbling mass.
          Alone they were a scatter of sparks: a rising tongue is a transient, so
          most of them sit near zero opacity at any given frame. The bed is what
          keeps the trail burning between licks. */}
      <span className="flame">
        {TRACKS[side].map((style, i) => (
          <span key={i} className="flame__ember" style={style}>
            <span className="flame__tongue" />
          </span>
        ))}
      </span>
    </div>
  )
}

export default function DepartureScene() {
  const ref = useScrollProgress<HTMLElement>('--progress', 'pin')
  const { plateRef, pokePlate } = usePlateImpulse()

  return (
    <section ref={ref} className="scene scene--departure" aria-hidden="true">
      <svg className="departure__defs" aria-hidden="true" focusable="false">
        <defs>
          {/*
            The "gooey" filter: blur everything, then steepen the alpha ramp back
            towards hard edges. Separate soft blobs merge into one organic mass
            with a wobbling outline — which is what a flame is. A gradient inside
            a rounded rectangle can only ever be a lamp, however it is coloured,
            because its silhouette is still a rounded rectangle.

            The ramp is steepened rather than crushed flat (it was 14/-5): some
            falloff has to survive or the fire ends up a solid cut-out with no
            glow spilling onto the road.
          */}
          <filter id="flame-goo" x="-40%" y="-20%" width="180%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 8 -3.1"
              result="goo"
            />
            {/* Then chew the merged edge so it licks rather than bulges. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.055" numOctaves="2" seed="5">
              <animate
                attributeName="seed"
                dur="1.6s"
                values="5;40;5"
                repeatCount="indefinite"
                calcMode="discrete"
              />
            </feTurbulence>
            <feDisplacementMap in="goo" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="departure__stage">
        <div className="departure__wash" />

        <div className="departure__road">
          <Track side="left" />
          <Track side="right" />
          <span className="departure__flash" />
        </div>

        {/*
          A show light struck from above once the flash has gone, pooling on the
          floor under the plate. It is what gives the plate somewhere to be: a
          lit prop on a dark stage rather than a shape floating in a void.
        */}
        <div className="departure__lamp" />
        <div className="departure__spot" />
        <div className="departure__spot-pool" />

        <div className="departure__plate-well">
          <div className="departure__plate">
            {/*
              Two real faces, both printed. A single element turned 360° never
              stops showing its front — the back of a `rotateY(180deg)` plane is
              the front drawn mirrored — so OUTATIME came round backwards and the
              plate read as a flat card being waved. Giving the reverse its own
              printing means the plate is legible at every angle while still
              turning like a solid object.
            */}
            <span ref={plateRef} className="departure__plate-interaction" onPointerDown={pokePlate}>
              <span className="departure__plate-float">
                <span className="departure__plate-spin">
                  <span className="departure__plate-face">
                    <span className="departure__plate-state">California</span>
                    <span className="departure__plate-text">OUTATIME</span>
                  </span>
                  <span className="departure__plate-face departure__plate-face--back">
                    <span className="departure__plate-state">California</span>
                    <span className="departure__plate-text">OUTATIME</span>
                  </span>
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
