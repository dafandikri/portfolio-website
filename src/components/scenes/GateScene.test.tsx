import { cleanup, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubIntersectionObserver } from '../../test/setup'
import GateScene from './GateScene'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('GateScene', () => {
  it('avoids a CSS dinosaur mascot and carries the nearby roar as pressure waves', () => {
    stubIntersectionObserver()
    const { container } = render(<GateScene />)

    expect(container.querySelector('.gate__rex')).toBeNull()
    expect(container.querySelector('.gate__rex-shape')).toBeNull()
    expect(container.querySelector('.gate__roar')).not.toBeNull()
    expect(container.querySelectorAll('.gate__echo')).toHaveLength(3)
  })

  it('keeps compact CC attribution at the edge of the gate scene', () => {
    stubIntersectionObserver()
    const { container } = render(<GateScene />)

    const credit = container.querySelector('.gate__credit') as HTMLElement
    expect(credit.querySelector('summary')).toHaveAttribute('aria-label', 'Gate model credit')
    expect(within(credit).getByText(/Mathzilla5335/)).toBeInTheDocument()
    expect(within(credit).getByText(/PBR maps resized/)).toBeInTheDocument()
    expect(credit.querySelector('a[rel~="license"]')).not.toBeNull()
  })
})
