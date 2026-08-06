import { describe, expect, it } from 'vitest'
import {
  GATE_OPEN_ANGLE,
  classifyGateTriangle,
  gateMotion,
  smoothstep,
} from './gateMotion'

describe('gateMotion', () => {
  it('roars before the doors move and waits for them before the camera dollies', () => {
    expect(gateMotion(0.1).roarStrength).toBeGreaterThan(0)
    expect(gateMotion(0.1).doorAngle).toBe(0)

    expect(gateMotion(0.3).doorAngle).toBeGreaterThan(0)
    expect(gateMotion(0.3).dollyProgress).toBe(0)

    expect(gateMotion(0.46).doorAngle).toBeCloseTo(GATE_OPEN_ANGLE)
    expect(gateMotion(0.46).dollyProgress).toBe(0)
    expect(gateMotion(0.6).dollyProgress).toBeGreaterThan(0)
    expect(gateMotion(0.78).dollyProgress).toBe(1)
    expect(gateMotion(0.69).projectStrength).toBe(0)
    expect(gateMotion(0.8).projectStrength).toBeGreaterThan(0)
    expect(gateMotion(0.8).projectStrength).toBeLessThan(1)
    expect(gateMotion(0.92).projectStrength).toBe(1)

    expect(gateMotion(0).creditStrength).toBe(0)
    expect(gateMotion(0.12).creditStrength).toBe(1)
    expect(gateMotion(0.76).creditStrength).toBeGreaterThan(0)
    expect(gateMotion(0.76).creditStrength).toBeLessThan(1)
    expect(gateMotion(0.8).creditStrength).toBe(0)
  })

  it('clamps progress and gives reduced-motion visitors a static open gate', () => {
    expect(gateMotion(-2)).toEqual(gateMotion(0))
    expect(gateMotion(3)).toEqual(gateMotion(1))
    expect(gateMotion(0.2, true)).toEqual({
      doorAngle: GATE_OPEN_ANGLE,
      dollyProgress: 0,
      roarStrength: 0,
      projectStrength: 1,
      creditStrength: 0,
    })
  })
})

describe('smoothstep', () => {
  it('eases cleanly between its two endpoints', () => {
    expect(smoothstep(0.2, 0.6, 0.1)).toBe(0)
    expect(smoothstep(0.2, 0.6, 0.4)).toBeCloseTo(0.5)
    expect(smoothstep(0.2, 0.6, 0.8)).toBe(1)
    expect(smoothstep(1, 1, 0.9)).toBe(0)
    expect(smoothstep(1, 1, 1)).toBe(1)
  })
})

describe('classifyGateTriangle', () => {
  it('separates the two door leaves from the surrounding gate', () => {
    expect(
      classifyGateTriangle([-0.47, -0.8, -0.05], [-0.03, -0.8, -0.2], [-0.2, 0.2, -0.1]),
    ).toBe('left')
    expect(
      classifyGateTriangle([0.47, -0.8, -0.05], [0.03, -0.8, -0.2], [0.2, 0.2, -0.1]),
    ).toBe('right')
  })

  it('keeps pylons, the sign, and centre-crossing triangles static', () => {
    expect(classifyGateTriangle([-0.8, -0.8, 0], [-0.6, 0, 0], [-0.5, 0.2, 0])).toBe('static')
    expect(classifyGateTriangle([-0.3, 0.5, 0], [0, 0.6, 0], [0.3, 0.5, 0])).toBe('static')
    expect(classifyGateTriangle([-0.1, 0, 0], [0.1, 0, 0], [0, 0.2, 0])).toBe('static')
  })
})
