import '@testing-library/jest-dom'

// jsdom does not implement IntersectionObserver, which framer-motion's
// `whileInView` relies on. Provide a no-op stub so components render in tests.
class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver
