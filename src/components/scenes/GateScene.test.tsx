import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubIntersectionObserver } from '../../test/setup'
import GateScene from './GateScene'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('GateScene', () => {
  it('keeps the dinosaur off-screen and carries the roar as pressure waves', () => {
    stubIntersectionObserver()
    const { container } = render(<GateScene />)

    expect(container.querySelector('.gate__rex')).toBeNull()
    expect(container.querySelector('.gate__rex-shape')).toBeNull()
    expect(container.querySelector('.gate__roar')).not.toBeNull()
    expect(container.querySelectorAll('.gate__echo')).toHaveLength(3)
  })
})
