import '@testing-library/jest-dom'
import { vi } from 'vitest'

/**
 * jsdom does not implement matchMedia, which useCardTilt queries to decide
 * whether to animate at all. Default to "motion is fine"; tests that care about
 * the reduced-motion path override this per case.
 */
export function stubMatchMedia(matches: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

stubMatchMedia(false)

/**
 * Controllable IntersectionObserver for hooks and scroll-scene tests.
 * jsdom has no layout engine, so tests explicitly report which observed node
 * is visible instead of pretending an arbitrary viewport exists.
 */
export class IntersectionObserverMock {
  readonly root = null
  readonly rootMargin: string
  readonly thresholds: ReadonlyArray<number>
  readonly observed = new Set<Element>()

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ) {
    this.rootMargin = options.rootMargin ?? '0px'
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0]
  }

  observe(target: Element): void {
    this.observed.add(target)
  }

  unobserve(target: Element): void {
    this.observed.delete(target)
  }

  disconnect(): void {
    this.observed.clear()
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  trigger(target: Element, isIntersecting: boolean, intersectionRatio = Number(isIntersecting)) {
    const rect = target.getBoundingClientRect()
    this.callback(
      [
        {
          time: performance.now(),
          target,
          rootBounds: null,
          boundingClientRect: rect,
          intersectionRect: isIntersecting ? rect : new DOMRectReadOnly(),
          isIntersecting,
          intersectionRatio,
        },
      ],
      this as unknown as IntersectionObserver,
    )
  }
}

export function stubIntersectionObserver(): IntersectionObserverMock[] {
  const instances: IntersectionObserverMock[] = []
  class InstalledIntersectionObserver extends IntersectionObserverMock {
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      super(callback, options)
      instances.push(this)
    }
  }
  vi.stubGlobal('IntersectionObserver', InstalledIntersectionObserver)
  return instances
}
