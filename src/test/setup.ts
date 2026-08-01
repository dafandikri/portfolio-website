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
