import { describe, it, expect } from 'vitest'
import {
  pointerToTilt,
  idleTilt,
  specularFromTilt,
  MAX_TILT_DEG,
  IDLE_TILT_DEG,
  IDLE_PERIOD_MS,
} from './useCardTilt'

/**
 * The tilt maths is pure, so it is tested here without a DOM, a pointer, or a
 * running animation frame. The hook's DOM behaviour is covered against the real
 * component in BusinessCard.test.tsx.
 */
const BOX = { left: 0, top: 0, width: 100, height: 100 }

describe('pointerToTilt', () => {
  it('sits flat when the pointer is dead centre', () => {
    const { rx, ry } = pointerToTilt(50, 50, BOX)
    expect(rx).toBeCloseTo(0)
    expect(ry).toBeCloseTo(0)
  })

  it('leans toward the pointer rather than away from it', () => {
    // CSS 3D points Y downward, so rotateX(+) brings the *bottom* edge forward
    // and rotateY(+) pushes the *right* edge back. Leaning into a cursor high
    // on the card therefore needs a negative rx, and one far right a negative ry.
    expect(pointerToTilt(50, 0, BOX).rx).toBeLessThan(0)
    expect(pointerToTilt(50, 100, BOX).rx).toBeGreaterThan(0)
    expect(pointerToTilt(100, 50, BOX).ry).toBeLessThan(0)
    expect(pointerToTilt(0, 50, BOX).ry).toBeGreaterThan(0)
  })

  it('reaches exactly the maximum tilt at a corner', () => {
    const { rx, ry } = pointerToTilt(100, 0, BOX)
    expect(rx).toBeCloseTo(-MAX_TILT_DEG)
    expect(ry).toBeCloseTo(-MAX_TILT_DEG)
  })

  it('never exceeds the maximum tilt when the pointer runs past the card', () => {
    const { rx, ry } = pointerToTilt(9999, -9999, BOX)
    expect(Math.abs(rx)).toBeLessThanOrEqual(MAX_TILT_DEG)
    expect(Math.abs(ry)).toBeLessThanOrEqual(MAX_TILT_DEG)
  })

  it('accounts for a card that is not at the viewport origin', () => {
    const offset = { left: 200, top: 100, width: 100, height: 100 }
    const { rx, ry } = pointerToTilt(250, 150, offset)
    expect(rx).toBeCloseTo(0)
    expect(ry).toBeCloseTo(0)
  })

  it('does not divide by zero on a card with no measured size', () => {
    const { rx, ry } = pointerToTilt(10, 10, { left: 0, top: 0, width: 0, height: 0 })
    expect(Number.isFinite(rx)).toBe(true)
    expect(Number.isFinite(ry)).toBe(true)
  })
})

describe('idleTilt', () => {
  it('stays within the resting amplitude, well short of a pointer tilt', () => {
    for (let t = 0; t <= IDLE_PERIOD_MS * 2; t += IDLE_PERIOD_MS / 24) {
      const { rx, ry } = idleTilt(t)
      expect(Math.abs(rx)).toBeLessThanOrEqual(IDLE_TILT_DEG + 1e-9)
      expect(Math.abs(ry)).toBeLessThanOrEqual(IDLE_TILT_DEG + 1e-9)
    }
  })

  it('does not repeat after one period, so the drift never looks mechanical', () => {
    // The two axes use incommensurate periods; a full cycle of rx must not
    // return ry to where it started.
    expect(idleTilt(IDLE_PERIOD_MS).ry).not.toBeCloseTo(idleTilt(0).ry, 3)
  })
})

describe('specularFromTilt', () => {
  it('puts the highlight at the centre when the card is flat', () => {
    expect(specularFromTilt({ rx: 0, ry: 0 })).toEqual({ mx: 0.5, my: 0.5 })
  })

  it('round-trips a pointer position, keeping light and geometry in sync', () => {
    // A pointer at 25%/75% across the card should place the highlight there too.
    const tilt = pointerToTilt(25, 75, BOX)
    const { mx, my } = specularFromTilt(tilt)
    expect(mx).toBeCloseTo(0.25)
    expect(my).toBeCloseTo(0.75)
  })

  it('stays inside the card face at maximum tilt', () => {
    const { mx, my } = specularFromTilt({ rx: MAX_TILT_DEG, ry: -MAX_TILT_DEG })
    expect(mx).toBeGreaterThanOrEqual(0)
    expect(mx).toBeLessThanOrEqual(1)
    expect(my).toBeGreaterThanOrEqual(0)
    expect(my).toBeLessThanOrEqual(1)
  })
})

