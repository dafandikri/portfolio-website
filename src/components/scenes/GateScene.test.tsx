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

  it('keeps the info control fixed while its CC attribution opens in a separate panel', () => {
    stubIntersectionObserver()
    const { container } = render(<GateScene />)

    const credit = container.querySelector('.gate__credit') as HTMLElement
    const trigger = credit.querySelector('button')
    const panel = credit.querySelector('.gate__credit-panel')

    expect(trigger).toHaveAttribute('aria-label', 'Gate model credit')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(panel).not.toBeNull()
    expect(trigger?.nextElementSibling).toBe(panel)
    expect(within(credit).getByText('Gate model attribution')).toBeInTheDocument()
    expect(within(credit).getByText(/Mathzilla5335/)).toBeInTheDocument()
    expect(within(credit).getByText(/PBR maps resized/)).toBeInTheDocument()
    expect(credit.querySelector('a[rel~="license"]')).not.toBeNull()
  })
})

describe('awards inside the stage', () => {
  it('never renders more leaves at once than a single viewport holds', () => {
    const { container } = render(<GateScene />)

    const stage = container.querySelector('.gate__stage')
    const archive = container.querySelector('.scene--archive')
    expect(archive).not.toBeNull()
    // The awards live inside the pinned stage on purpose: the tear reveals them
    // in place rather than the visitor scrolling to a section underneath.
    expect(stage?.contains(archive as Node)).toBe(true)

    // That is only safe because the spread is paginated. A tall spread in a
    // fixed-height stage is what silently clipped a second award out of reach
    // before, with nothing in the subtree able to scroll.
    expect(container.querySelectorAll('.x-book__leaf').length).toBeLessThanOrEqual(2)
  })
})
