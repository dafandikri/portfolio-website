import { useEffect, useRef } from 'react'

/** Maximum rotation the card reaches when the pointer is at an edge. */
export const MAX_TILT_DEG = 14
/** Amplitude of the resting drift, so the card never looks dead. */
export const IDLE_TILT_DEG = 1.6
export const IDLE_PERIOD_MS = 9000

/**
 * Fraction of the remaining distance covered each frame. Low enough to carry
 * the weight of a stiff piece of stock, high enough that the card stays under
 * the cursor rather than drifting after it.
 */
const FOLLOW = 0.16

/** Pointer position relative to the card centre, -1..1 on each axis. */
export interface Offset {
  cx: number
  cy: number
}

/** One rotation, about one axis lying in the card's own plane. */
export interface Tilt {
  ax: number
  ay: number
  deg: number
}

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n))

export function pointerToOffset(clientX: number, clientY: number, box: Box): Offset {
  const nx = box.width === 0 ? 0.5 : (clientX - box.left) / box.width
  const ny = box.height === 0 ? 0.5 : (clientY - box.top) / box.height
  return { cx: clamp01(nx) * 2 - 1, cy: clamp01(ny) * 2 - 1 }
}

/**
 * Convert a pointer offset into a single-axis rotation.
 *
 * `rotateX(a) rotateY(b)` is the obvious way to write a tilt and it is wrong at
 * the corners. Composing two axis rotations multiplies into a matrix carrying a
 * third term — an in-plane roll — so the card reads as having been spun flat on
 * the table rather than leaned into the cursor. The error is invisible near the
 * centre, where both angles are small, and unmistakable once either approaches
 * its maximum, which is exactly where a pointer spends its time.
 *
 * Rotating once about the axis perpendicular to the pointer direction has no
 * roll term at any angle, so the lean stays square to the direction you are
 * pointing from.
 *
 * The card leans *away* from the pointer: the corner under the cursor is the
 * one that recedes, as though the pointer were pressing it into the surface.
 * Leaning toward the cursor lifts the near edge at the viewer, which reads as
 * the card rearing up to meet the mouse rather than responding to it.
 */
export function offsetToTilt({ cx, cy }: Offset): Tilt {
  const length = Math.hypot(cx, cy)
  // No direction to lean in; hold the plate flat on a defined axis.
  if (length === 0) return { ax: 1, ay: 0, deg: 0 }

  return {
    // Perpendicular to the offset, and signed so the edge under the pointer is
    // pushed back rather than lifted forward.
    ax: -cy / length,
    ay: cx / length,
    // Corners reach further than edges; clamp so they do not tilt further too.
    deg: Math.min(1, length) * MAX_TILT_DEG,
  }
}

/**
 * Resting drift, so the card never looks dead while nobody is pointing at it.
 */
export function idleOffset(elapsedMs: number): Offset {
  const t = (elapsedMs / IDLE_PERIOD_MS) * Math.PI * 2
  const amplitude = IDLE_TILT_DEG / MAX_TILT_DEG
  /*
   * A slow orbit with a breathing radius, not two independent sine axes. Two
   * sines bound each axis separately, but their magnitude is the hypotenuse,
   * which reaches sqrt(2) times the amplitude on the diagonals — the card
   * drifted a third further than the resting limit says it can. Driving angle
   * and radius separately makes the magnitude the radius by construction, and
   * the incommensurate breathing period keeps the path from visibly repeating.
   */
  const radius = amplitude * (0.72 + 0.28 * Math.sin(t * 0.37))
  return { cx: Math.cos(t) * radius, cy: Math.sin(t) * radius }
}

/**
 * Where the specular highlight sits. Derived from the same offset that drives
 * the rotation, which keeps the light and the geometry provably in sync.
 * Returns 0..1 coordinates across the card face.
 */
export function specularFromOffset({ cx, cy }: Offset): { mx: number; my: number } {
  return { mx: clamp01((cx + 1) / 2), my: clamp01((cy + 1) / 2) }
}

/*
 * There is deliberately no shadow-offset maths here. The cast shadow is a pair
 * of real planes that carry the same axis and angle, so the 3D projection
 * places them; computing a separate offset would double-count the rotation.
 */

/**
 * Drives the card's 3D tilt.
 *
 * Values are written straight to CSS custom properties inside a single
 * requestAnimationFrame loop, never to React state — routing pointer moves
 * through state would re-render the component on every mouse event, whereas
 * this way React renders once and the compositor does the rest.
 *
 * The easing runs on the pointer offset rather than on the rotation. Easing an
 * axis directly would swing it the long way round whenever the pointer crosses
 * the centre, where the axis flips sign; the offset has no such discontinuity,
 * and the axis is recomputed from it each frame.
 *
 * Attach this to the card's *wrapper*, not the card itself. Custom properties
 * only inherit downward, and both the card and its cast-shadow planes are
 * siblings that need the values, so they have to be written above them.
 *
 * Under prefers-reduced-motion the hook attaches no listener and starts no
 * loop, so the card simply sits still.
 */
export function useCardTilt<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let pointerActive = false
    let onScreen = true
    const start = performance.now()
    const current: Offset = { cx: 0, cy: 0 }
    let target: Offset = { cx: 0, cy: 0 }

    const onPointerMove = (event: PointerEvent) => {
      pointerActive = true
      target = pointerToOffset(event.clientX, event.clientY, el.getBoundingClientRect())
    }
    // Touch drags end; mouse pointers leave. Either way, hand back to the drift.
    const onPointerRest = () => {
      pointerActive = false
    }

    const tick = (now: number) => {
      // Scenes follow the card now, so this loop would otherwise keep animating
      // an element nobody can see. Park it and let the observer restart it.
      if (!onScreen) {
        frame = 0
        return
      }
      if (!pointerActive) target = idleOffset(now - start)
      current.cx += (target.cx - current.cx) * FOLLOW
      current.cy += (target.cy - current.cy) * FOLLOW

      const { ax, ay, deg } = offsetToTilt(current)
      const { mx, my } = specularFromOffset(current)
      el.style.setProperty('--ax', ax.toFixed(4))
      el.style.setProperty('--ay', ay.toFixed(4))
      el.style.setProperty('--deg', `${deg.toFixed(3)}deg`)
      el.style.setProperty('--mx', `${(mx * 100).toFixed(2)}%`)
      el.style.setProperty('--my', `${(my * 100).toFixed(2)}%`)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    // Fails open: without IntersectionObserver the loop simply keeps running,
    // which costs battery but never leaves the card frozen.
    const visibility =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              onScreen = entries.some((entry) => entry.isIntersecting)
              if (onScreen && frame === 0) frame = requestAnimationFrame(tick)
            },
            { threshold: 0 },
          )
    visibility?.observe(el)

    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerleave', onPointerRest)
    el.addEventListener('pointerup', onPointerRest)
    el.addEventListener('pointercancel', onPointerRest)

    return () => {
      cancelAnimationFrame(frame)
      visibility?.disconnect()
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', onPointerRest)
      el.removeEventListener('pointerup', onPointerRest)
      el.removeEventListener('pointercancel', onPointerRest)
    }
  }, [enabled])

  return ref
}
