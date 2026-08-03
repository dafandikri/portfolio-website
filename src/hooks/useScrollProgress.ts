import { useEffect, useRef } from 'react'

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
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Park it at the end state: the scene reads as arrived, never mid-flight.
      el.style.setProperty(property, '1')
      return
    }

    let frame = 0
    let queued = false

    const measure = () => {
      queued = false
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
      const progress = Math.min(1, Math.max(0, raw))
      el.style.setProperty(property, progress.toFixed(4))
    }

    // Scroll fires far more often than the compositor paints, so the read is
    // coalesced into one frame. Reading layout on every scroll event is the
    // usual cause of scroll-linked jank.
    const onScroll = () => {
      if (queued) return
      queued = true
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [property, mode])

  return ref
}
