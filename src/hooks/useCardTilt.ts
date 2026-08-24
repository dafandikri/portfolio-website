import { useEffect, useRef, type RefObject } from 'react'

/** Maximum rotation the card reaches when the pointer is at an edge. */
export const MAX_TILT_DEG = 14

/**
 * Fraction of the remaining distance covered each frame. Low enough to carry
 * the weight of a stiff piece of stock, high enough that the card stays under
 * the cursor rather than drifting after it.
 */
const FOLLOW = 0.16

/* The two printed link columns are guard zones too. Freezing as the pointer
   enters the column—before it reaches a glyph—keeps a perspective-projected
   anchor from travelling toward or away from the pointer on approach. */
const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '.card__contact',
  '.card__footer-col:first-child',
].join(', ')

/** True when pointer-driven decoration must yield to a real control. */
export function isInteractivePointerTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR))
}

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
 * Attach the returned ref to the card's *wrapper*, not the card itself. Custom
 * properties only inherit downward, and both the card and its cast-shadow
 * planes are siblings that need the values, so they have to be written above
 * them.
 *
 * `scopeRef` is where those values are published, and it defaults to the same
 * wrapper. Passing an ancestor instead widens the set of elements that can read
 * the tilt without widening the set that drives it: the pointer is still
 * measured against, and listened for on, the wrapper's own box, so the feel of
 * the tilt is unchanged — but the scene behind the card can then respond to it
 * too, which a value published on the card itself could never reach.
 *
 * Under prefers-reduced-motion the hook attaches no listener and starts no
 * loop, so the card simply sits still and nothing is ever published.
 */
export function useCardTilt<T extends HTMLElement>(
  enabled = true,
  scopeRef?: RefObject<HTMLElement | null>,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const scope = scopeRef?.current ?? el

    let frame = 0
    let pointerActive = false
    let pointerControlActive = false
    let focusedControlActive = false
    let onScreen = true
    const current: Offset = { cx: 0, cy: 0 }
    let target: Offset = { cx: 0, cy: 0 }

    const interactiveTargetActive = () => pointerControlActive || focusedControlActive

    const publish = () => {
      const { ax, ay, deg } = offsetToTilt(current)
      const { mx, my } = specularFromOffset(current)
      scope.style.setProperty('--ax', ax.toFixed(4))
      scope.style.setProperty('--ay', ay.toFixed(4))
      scope.style.setProperty('--deg', `${deg.toFixed(3)}deg`)
      scope.style.setProperty('--mx', `${(mx * 100).toFixed(2)}%`)
      scope.style.setProperty('--my', `${(my * 100).toFixed(2)}%`)
      scope.style.setProperty(
        '--card-transform',
        deg < 0.001
          ? 'none'
          : `rotate3d(${ax.toFixed(4)}, ${ay.toFixed(4)}, 0, ${deg.toFixed(3)}deg)`,
      )
    }

    const resumeLoop = () => {
      if (onScreen && frame === 0 && !interactiveTargetActive()) {
        frame = requestAnimationFrame(tick)
      }
    }

    /* Freeze the pose that was actually hit. Flattening here would move the
       anchor under a stationary pointer between pointerover and pointerdown. */
    const parkAtCurrentPose = () => {
      pointerActive = false
      target = { ...current }
      cancelAnimationFrame(frame)
      frame = 0
    }

    const holdPointerControl = () => {
      pointerControlActive = true
      parkAtCurrentPose()
    }

    const releasePointerControl = () => {
      pointerControlActive = false
      resumeLoop()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (isInteractivePointerTarget(event.target)) {
        /*
         * Do not move a real control away from the pointer between pointerdown
         * and click. Hold the current physical pose while a link/control is
         * targeted; moving back onto the paper resumes the tilt immediately.
         */
        holdPointerControl()
        return
      }
      releasePointerControl()
      pointerActive = true
      target = pointerToOffset(event.clientX, event.clientY, el.getBoundingClientRect())
    }

    const onPointerControl = (event: PointerEvent) => {
      if (isInteractivePointerTarget(event.target)) holdPointerControl()
    }

    const onFocusIn = (event: FocusEvent) => {
      if (!isInteractivePointerTarget(event.target)) return
      focusedControlActive = true
      parkAtCurrentPose()
    }

    const onFocusOut = (event: FocusEvent) => {
      focusedControlActive = Boolean(
        event.relatedTarget instanceof Node
          && el.contains(event.relatedTarget)
          && isInteractivePointerTarget(event.relatedTarget),
      )
      resumeLoop()
    }

    const onPointerUp = (event: PointerEvent) => {
      pointerActive = false
      /* Keep an anchor motionless through the following native click. */
      if (!isInteractivePointerTarget(event.target)) releasePointerControl()
    }

    const onClick = (event: MouseEvent) => {
      if (isInteractivePointerTarget(event.target)) releasePointerControl()
    }

    // Touch cancellation and a mouse leaving the card both settle it flat.
    const onPointerRest = () => {
      pointerActive = false
      pointerControlActive = false
      resumeLoop()
    }

    function tick(_now: number) {
      frame = 0
      // Scenes follow the card now, so this loop would otherwise keep animating
      // an element nobody can see. Park it and let the observer restart it.
      if (!onScreen) {
        return
      }
      if (interactiveTargetActive()) return
      /* A decorative idle orbit continuously moved the anchors under a
         stationary cursor. Return to a stable, flat card instead: the card
         still responds wherever the user points on the paper, but a link can
         never drift away between hit testing and click dispatch. */
      if (!pointerActive) target = { cx: 0, cy: 0 }
      current.cx += (target.cx - current.cx) * FOLLOW
      current.cy += (target.cy - current.cy) * FOLLOW

      publish()
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
              resumeLoop()
            },
            { threshold: 0 },
          )
    visibility?.observe(el)

    el.addEventListener('pointerover', onPointerControl)
    el.addEventListener('pointerdown', onPointerControl)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerleave', onPointerRest)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerRest)
    el.addEventListener('click', onClick)
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('focusout', onFocusOut)

    return () => {
      cancelAnimationFrame(frame)
      visibility?.disconnect()
      el.removeEventListener('pointerover', onPointerControl)
      el.removeEventListener('pointerdown', onPointerControl)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', onPointerRest)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerRest)
      el.removeEventListener('click', onClick)
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('focusout', onFocusOut)
    }
  }, [enabled, scopeRef])

  return ref
}
