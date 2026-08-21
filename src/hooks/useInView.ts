import { useEffect, useRef, useState } from 'react'

/**
 * Reports whether an element is on screen.
 *
 * Used both to mount scenes lazily and to park animation loops that would
 * otherwise keep running against elements nobody is looking at.
 *
 * Where IntersectionObserver is unavailable the element is treated as visible.
 * Failing open matters: the alternative is content that never mounts, which is
 * a far worse outcome than an animation that runs when it need not.
 */
export function useInView<T extends HTMLElement>(rootMargin = '0px', once = false) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting)
      if (visible) {
        setInView(true)
        if (once) observer.disconnect()
      } else if (!once) {
        setInView(false)
      }
    }, { rootMargin })
    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin])

  return [ref, inView] as const
}
