import { describe, expect, it } from 'vitest'
import { SCROLL_SMOOTHING_MS, smoothProgress } from './useScrollProgress'

describe('smoothProgress', () => {
  it('moves toward the scroll target without overshooting it', () => {
    const next = smoothProgress(0.4, 0.9, 16)

    expect(next).toBeGreaterThan(0.4)
    expect(next).toBeLessThan(0.9)
  })

  it('moves smoothly in reverse when the visitor scrolls back up', () => {
    const next = smoothProgress(0.8, 0.2, 16)

    expect(next).toBeLessThan(0.8)
    expect(next).toBeGreaterThan(0.2)
  })

  it('is refresh-rate independent', () => {
    const oneLongFrame = smoothProgress(0, 1, 32)
    const firstShortFrame = smoothProgress(0, 1, 16)
    const twoShortFrames = smoothProgress(firstShortFrame, 1, 16)

    expect(twoShortFrames).toBeCloseTo(oneLongFrame, 10)
  })

  it('converges close to the target within a few time constants', () => {
    expect(smoothProgress(0, 1, SCROLL_SMOOTHING_MS * 5)).toBeGreaterThan(0.99)
  })

  it('can be bypassed for an immediate reduced-motion-style update', () => {
    expect(smoothProgress(0.1, 0.9, 16, 0)).toBe(0.9)
  })
})
