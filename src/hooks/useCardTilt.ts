import { useEffect, useRef } from 'react'

/** Maximum rotation the card reaches when the pointer is at a corner. */
export const MAX_TILT_DEG = 11
/** Amplitude of the resting drift, so the card never looks dead. */
export const IDLE_TILT_DEG = 2
export const IDLE_PERIOD_MS = 8000

/**
 * Fraction of the remaining distance covered each frame. Lower is heavier — the
 * card is meant to feel like a stiff piece of stock, not a rubber band.
 */
const FOLLOW = 0.09

export interface Tilt {
  rx: number
  ry: number
}

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n))

/**
 * Map a pointer position to a card rotation.
 *
 * Extracted as a pure function so the maths is unit-testable without a DOM,
 * a pointer, or a running animation frame.
 */
export function pointerToTilt(clientX: number, clientY: number, box: Box): Tilt {
  const nx = box.width === 0 ? 0.5 : (clientX - box.left) / box.width
  const ny = box.height === 0 ? 0.5 : (clientY - box.top) / box.height
  // Centre-relative, -1..1 across each axis.
  const cx = clamp01(nx) * 2 - 1
  const cy = clamp01(ny) * 2 - 1
  /*
   * The card leans *toward* the cursor, as though you were lifting the near
   * edge to read it. Both signs look wrong at a glance because CSS 3D points
   * the Y axis downward: rotateX(+θ) brings the bottom edge forward, and
   * rotateY(+θ) pushes the right edge away. So leaning into a cursor that is
   * high on the card needs a negative rx, and one that is far right needs a
   * negative ry.
   */
  return { rx: cy * MAX_TILT_DEG, ry: -cx * MAX_TILT_DEG }
}

/**
 * Resting drift. The two axes use deliberately incommensurate periods so the
 * loop never visibly repeats and the motion reads as organic rather than as a
 * cycling animation.
 */
export function idleTilt(elapsedMs: number): Tilt {
  const t = (elapsedMs / IDLE_PERIOD_MS) * Math.PI * 2
  return {
    rx: Math.sin(t) * IDLE_TILT_DEG,
    ry: Math.cos(t * 0.63) * IDLE_TILT_DEG,
  }
}

/**
 * Where the specular highlight sits, derived from the rotation rather than
 * tracked separately, which keeps the light and the geometry provably in sync.
 * Returns 0..1 coordinates across the card face.
 */
export function specularFromTilt({ rx, ry }: Tilt): { mx: number; my: number } {
  // Exactly inverts pointerToTilt, so the highlight lands under the cursor.
  return {
    mx: clamp01((-ry / MAX_TILT_DEG + 1) / 2),
    my: clamp01((rx / MAX_TILT_DEG + 1) / 2),
  }
}

/** How far the cast shadow slides, in px, at maximum tilt. */
export const SHADOW_SHIFT_PX = 16

/**
 * Where the cast shadow falls, in px, given the card's rotation.
 *
 * The shadow cannot simply ride along with the card: a box-shadow is painted in
 * its element's local space, so putting it on the rotating element would tumble
 * it through 3D as though glued to the card's back. A real cast shadow stays
 * flat on the surface underneath and only slides and stretches. So it lives on
 * the non-rotating wrapper and is displaced from here instead.
 *
 * Lifting an edge toward the viewer pushes the shadow away from that edge:
 * raise the top and the shadow slides down, raise the right and it slides left.
 */
export function shadowFromTilt({ rx, ry }: Tilt): { sx: number; sy: number } {
  return {
    sx: (ry / MAX_TILT_DEG) * SHADOW_SHIFT_PX,
    sy: (-rx / MAX_TILT_DEG) * SHADOW_SHIFT_PX,
  }
}

/**
 * Drives the card's 3D tilt.
 *
 * Values are written straight to CSS custom properties inside a single
 * requestAnimationFrame loop, never to React state — routing pointer moves
 * through state would re-render the component on every mouse event, whereas
 * this way React renders once and the compositor does the rest.
 *
 * Attach this to the card's *wrapper*, not the rotating card itself. Custom
 * properties only inherit downward, and the cast shadow sits on the wrapper
 * (it must not rotate) while the rotation sits on the child — so the values
 * have to be written above both of them for either to read them.
 *
 * Under prefers-reduced-motion the hook attaches no listener and starts no
 * loop, so the card simply sits still.
 */
export function useCardTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let pointerActive = false
    const start = performance.now()
    const current: Tilt = { rx: 0, ry: 0 }
    let target: Tilt = { rx: 0, ry: 0 }

    const onPointerMove = (event: PointerEvent) => {
      pointerActive = true
      target = pointerToTilt(event.clientX, event.clientY, el.getBoundingClientRect())
    }
    // Touch drags end; mouse pointers leave. Either way, hand back to the drift.
    const onPointerRest = () => {
      pointerActive = false
    }

    const tick = (now: number) => {
      if (!pointerActive) target = idleTilt(now - start)
      current.rx += (target.rx - current.rx) * FOLLOW
      current.ry += (target.ry - current.ry) * FOLLOW
      const { mx, my } = specularFromTilt(current)
      const { sx, sy } = shadowFromTilt(current)
      el.style.setProperty('--rx', `${current.rx.toFixed(3)}deg`)
      el.style.setProperty('--ry', `${current.ry.toFixed(3)}deg`)
      el.style.setProperty('--mx', `${(mx * 100).toFixed(2)}%`)
      el.style.setProperty('--my', `${(my * 100).toFixed(2)}%`)
      el.style.setProperty('--sx', `${sx.toFixed(2)}px`)
      el.style.setProperty('--sy', `${sy.toFixed(2)}px`)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerleave', onPointerRest)
    el.addEventListener('pointerup', onPointerRest)
    el.addEventListener('pointercancel', onPointerRest)

    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', onPointerRest)
      el.removeEventListener('pointerup', onPointerRest)
      el.removeEventListener('pointercancel', onPointerRest)
    }
  }, [])

  return ref
}
