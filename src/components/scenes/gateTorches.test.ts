import { describe, expect, it } from 'vitest'
import { GATE_TORCHES, torchFlicker } from './gateTorches'

describe('gate torches', () => {
  it('places four flames on each column, including one on each cap', () => {
    const left = GATE_TORCHES.filter(({ side }) => side === 'left')
    const right = GATE_TORCHES.filter(({ side }) => side === 'right')

    expect(left).toHaveLength(4)
    expect(right).toHaveLength(4)
    expect(left.filter(({ tier }) => tier === 'cap')).toHaveLength(1)
    expect(right.filter(({ tier }) => tier === 'cap')).toHaveLength(1)
    expect(Math.max(...left.map(({ position }) => position[1]))).toBeGreaterThan(0.9)
  })

  it('mirrors the columns and keeps flicker inside a restrained range', () => {
    for (let i = 0; i < 4; i += 1) {
      const left = GATE_TORCHES[i]!
      const right = GATE_TORCHES[i + 4]!
      expect(right.position[0]).toBe(-left.position[0])
      expect(right.position[1]).toBe(left.position[1])
    }

    const samples = Array.from({ length: 100 }, (_, i) => torchFlicker(i * 37, 0.6))
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0.72)
    expect(Math.max(...samples)).toBeLessThanOrEqual(1)
  })
})
