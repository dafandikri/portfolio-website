import { useEffect, useRef } from 'react'

/**
 * Time constant for scroll smoothing. Short enough to stay attached to the
 * wheel, long enough to bridge the gaps between discrete mouse-wheel notches.
 */
export const SCROLL_SMOOTHING_MS = 95

/**
 * Move a progress value towards its target without depending on refresh rate.
 *
 * A fixed `current += (target - current) * 0.1` feels different at 60 and
 * 120 Hz. Exponential smoothing uses elapsed time instead, so the plate arrives
 * with the same weight on both displays and never overshoots the scroll target.
 */
export function smoothProgress(
  current: number,
  target: number,
  elapsedMs: number,
  smoothingMs = SCROLL_SMOOTHING_MS,
): number {
  if (smoothingMs <= 0) return target
  const elapsed = Math.max(0, elapsedMs)
  const follow = 1 - Math.exp(-elapsed / smoothingMs)
  return current + (target - current) * follow
}

/**
 * Writes an element's scroll progress, 0 → 1, to a CSS custom property.
 *
 * The point is that the sequence is *scrubbed* rather than triggered. A
 * one-shot animation plays once and never comes back; scrolling up leaves you
 * looking at the aftermath of something you can no longer replay. Driving the
 * animation from position instead means it runs forward as you scroll down and
 * backward as you scroll up, because it never had its own clock to begin with.
 *
 * Consumers pair `--progress` with a paused CSS animation and a negative delay:
 *
 *   animation: burn 1s linear paused;
 *   animation-delay: calc(var(--progress) * -1s);
 *
 * which seeks the animation to that point rather than playing it. All the
 * interpolation stays in CSS on the compositor; this only ever writes a number.
 *
 * Progress is 0 when the element's top reaches the bottom of the viewport and 1
 * when its bottom reaches the top, so the whole pass through the viewport is the
 * timeline.
 */
export function useScrollProgress<T extends HTMLElement>(
  property = '--progress',
  /**
   * `pin` measures across a tall section holding a sticky, viewport-height
   * child: progress runs 0 → 1 over exactly the span the child stays stuck, so
   * the sequence plays while the scene is held still in front of the viewer.
   * `pass` measures the element's whole travel through the viewport instead.
   */
  mode: 'pin' | 'pass' = 'pin',
  onProgress?: (progress: number) => void,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Park it at the end state: the scene reads as arrived, never mid-flight.
      el.style.setProperty(property, '1')
      onProgress?.(1)
      return
    }

    let measureFrame = 0
    let motionFrame = 0
    let initialized = false
    let current = 0
    let target = 0
    let previousTime = 0

    const write = () => {
      el.style.setProperty(property, current.toFixed(4))
      onProgress?.(current)
    }

    const animate = (now: number) => {
      const elapsed = Math.min(64, now - previousTime)
      previousTime = now
      current = smoothProgress(current, target, elapsed)

      // Stop the loop once the remaining difference is below the precision we
      // write to CSS. Leaving it alive would wake the compositor forever for a
      // value that cannot visibly change.
      if (Math.abs(target - current) < 0.00005) current = target
      write()

      if (current === target) {
        motionFrame = 0
      } else {
        motionFrame = requestAnimationFrame(animate)
      }
    }

    const measure = () => {
      measureFrame = 0
      const rect = el.getBoundingClientRect()
      let raw: number
      if (mode === 'pin') {
        // The sticky child is one viewport tall, so the pin lasts for the
        // section's height minus that viewport. Progress is how far into that
        // span the scroll has travelled.
        const span = rect.height - window.innerHeight
        raw = span <= 0 ? 0 : -rect.top / span
      } else {
        const span = rect.height + window.innerHeight
        raw = span === 0 ? 0 : (window.innerHeight - rect.top) / span
      }
      target = Math.min(1, Math.max(0, raw))

      // A refresh in the middle of the scene should restore the exact scroll
      // state immediately. Only movement after mount needs smoothing.
      if (!initialized) {
        initialized = true
        current = target
        write()
        return
      }

      if (motionFrame === 0 && current !== target) {
        previousTime = performance.now()
        motionFrame = requestAnimationFrame(animate)
      }
    }

    // Scroll fires far more often than the compositor paints, so the read is
    // coalesced into one frame. Reading layout on every scroll event is the
    // usual cause of scroll-linked jank.
    const onScroll = () => {
      if (measureFrame !== 0) return
      measureFrame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(measureFrame)
      cancelAnimationFrame(motionFrame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [property, mode, onProgress])

  return ref
}
