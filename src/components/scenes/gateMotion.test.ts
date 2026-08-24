import { describe, expect, it } from 'vitest'
import {
  AWARD_BOOK_OPEN_END,
  AWARD_BOOK_OPEN_START,
  GATE_OPEN_ANGLE,
  GATE_CHAPTER_SHARE,
  GATE_SEQUENCE_END,
  awardBookMotion,
  classifyGateTriangle,
  gateMotion,
  gateSequenceProgress,
  projectAwardsProgress,
  smoothstep,
} from './gateMotion'

describe('awardBookMotion', () => {
  it('opens during the visible zoom and holds the Tech Wizard sheet revealed', () => {
    expect(awardBookMotion(AWARD_BOOK_OPEN_START)).toEqual({
      openProgress: 0,
      angleDeg: -0,
    })
    const halfway = awardBookMotion((AWARD_BOOK_OPEN_START + AWARD_BOOK_OPEN_END) / 2)
    expect(halfway.openProgress).toBeCloseTo(0.5)
    expect(halfway.angleDeg).toBeCloseTo(-90)
    expect(awardBookMotion(AWARD_BOOK_OPEN_END)).toEqual({
      openProgress: 1,
      angleDeg: -180,
    })
    expect(awardBookMotion(1).angleDeg).toBe(-180)
  })

  it('clamps direct jumps and is identical when reverse-scrolling', () => {
    expect(awardBookMotion(-1)).toEqual(awardBookMotion(0))
    expect(awardBookMotion(2)).toEqual(awardBookMotion(1))

    const points = [0, 0.5, 1]
    expect([...points].reverse().map(awardBookMotion)).toEqual(
      points.map(awardBookMotion).reverse(),
    )
  })
})

describe('gateMotion', () => {
  it('reveals the world, resolves the gate, then roars before the doors and dolly', () => {
    expect(gateMotion(0).environmentStrength).toBe(0)
    expect(gateMotion(0.1).environmentStrength).toBeGreaterThan(0)
    expect(gateMotion(0.1).modelStrength).toBeGreaterThan(0)
    expect(gateMotion(0.1).roarStrength).toBe(0)
    expect(gateMotion(0.1).doorAngle).toBe(0)

    expect(gateMotion(0.17).roarStrength).toBeGreaterThan(0)
    expect(gateMotion(0.17).doorAngle).toBe(0)

    expect(gateMotion(0.3).doorAngle).toBeGreaterThan(0)
    expect(gateMotion(0.3).dollyProgress).toBe(0)

    expect(gateMotion(0.58).doorAngle).toBeCloseTo(GATE_OPEN_ANGLE)
    expect(gateMotion(0.6).dollyProgress).toBe(0)
    expect(gateMotion(0.7).dollyProgress).toBeGreaterThan(0)
    expect(gateMotion(0.89).dollyProgress).toBe(1)
    expect(gateMotion(0.83).projectStrength).toBe(0)
    expect(gateMotion(0.9).projectStrength).toBeGreaterThan(0)
    expect(gateMotion(0.9).projectStrength).toBeLessThan(1)
    expect(gateMotion(0.99).projectStrength).toBe(1)

    expect(gateMotion(0).creditStrength).toBe(0)
    expect(gateMotion(0.2).creditStrength).toBe(1)
    expect(gateMotion(0.84).creditStrength).toBeGreaterThan(0)
    expect(gateMotion(0.84).creditStrength).toBeLessThan(1)
    expect(gateMotion(0.9).creditStrength).toBe(0)
  })

  it('clamps progress and gives reduced-motion visitors a static open gate', () => {
    expect(gateMotion(-2)).toEqual(gateMotion(0))
    expect(gateMotion(3)).toEqual(gateMotion(1))
    expect(gateMotion(0.2, true)).toEqual({
      environmentStrength: 1,
      modelStrength: 0,
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

describe('gateSequenceProgress', () => {
  it('finishes the shot early enough to leave a stable project hold', () => {
    expect(gateSequenceProgress(0)).toBe(0)
    expect(gateSequenceProgress(GATE_SEQUENCE_END / 2)).toBeCloseTo(0.5)
    expect(gateSequenceProgress(GATE_SEQUENCE_END)).toBe(1)
    expect(gateSequenceProgress(1)).toBe(1)
  })

  it('clamps direct jumps and reverse scrolling to the same endpoints', () => {
    expect(gateSequenceProgress(-1)).toBe(0)
    expect(gateSequenceProgress(3)).toBe(1)

    const down = [0, 0.2, 0.5, GATE_SEQUENCE_END].map(gateSequenceProgress)
    const up = [GATE_SEQUENCE_END, 0.5, 0.2, 0].map(gateSequenceProgress)
    expect(up).toEqual([...down].reverse())
  })
})

describe('projectAwardsProgress', () => {
  it('preserves the old gate runway before starting the archive transition', () => {
    expect(projectAwardsProgress(0)).toEqual({ gate: 0, archive: 0 })
    expect(projectAwardsProgress(GATE_CHAPTER_SHARE / 2)).toEqual({ gate: 0.5, archive: 0 })
    expect(projectAwardsProgress(GATE_CHAPTER_SHARE)).toEqual({ gate: 1, archive: 0 })
    expect(projectAwardsProgress(1)).toEqual({ gate: 1, archive: 1 })
  })

  it('clamps jumps and returns the same local clocks in reverse', () => {
    expect(projectAwardsProgress(-1)).toEqual({ gate: 0, archive: 0 })
    expect(projectAwardsProgress(3)).toEqual({ gate: 1, archive: 1 })

    const point = GATE_CHAPTER_SHARE + (1 - GATE_CHAPTER_SHARE) * 0.42
    expect(projectAwardsProgress(point).archive).toBeCloseTo(0.42)
    expect(projectAwardsProgress(point)).toEqual(projectAwardsProgress(point))
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
