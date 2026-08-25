import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fullTitle, timeline } from '../../data/timeline'
import { stubIntersectionObserver } from '../../test/setup'
import TimeCircuitsScene from './TimeCircuitsScene'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('TimeCircuitsScene', () => {
  it('does not mount below-fold experience content until the scene approaches', () => {
    const observers = stubIntersectionObserver()
    const { container } = render(<TimeCircuitsScene />)
    const scene = container.querySelector('.scene--circuits')!

    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
    // The deck is the below-fold cost; none of it should exist yet.
    expect(container.querySelectorAll('.deck__card')).toHaveLength(0)
    expect(observers[0]?.rootMargin).toBe('0px 0px -12%')

    act(() => observers[0]?.trigger(scene, true, 1))
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toHaveTextContent(
      'Experience Circuits',
    )
    expect(screen.getByText('Temporal career archive · selected destinations')).toBeVisible()
    expect(container.querySelectorAll('.deck__card')).toHaveLength(timeline.length)
    const hoverboardCanvas = container.querySelector('.circuits-scene__hoverboard3d canvas')
    expect(hoverboardCanvas).toHaveAttribute('data-renderer', 'three')
    expect(hoverboardCanvas).toHaveAttribute('role', 'button')
    expect(hoverboardCanvas).toHaveAttribute('aria-label', 'Nudge the hoverboard flight path')
    expect(hoverboardCanvas).toHaveAttribute('tabindex', '0')
    const credit = container.querySelector('.circuits-scene__credit') as HTMLElement
    expect(credit).toHaveAttribute('aria-hidden', 'true')
    expect(credit.querySelector('button')).toHaveAttribute('aria-label', 'Hoverboard model credit')
    expect(credit.querySelector('button')).toHaveAttribute('aria-expanded', 'false')
    expect(credit).toHaveTextContent('Onamani')
    expect(credit.querySelector('a[rel~="license"]')).not.toBeNull()
  })

  it('deals one card per role, each reachable as a button', () => {
    const observers = stubIntersectionObserver()
    const { container } = render(<TimeCircuitsScene />)
    act(() => observers[0]?.trigger(container.querySelector('.scene--circuits')!, true, 1))

    for (const stop of timeline) {
      expect(screen.getByRole('button', { name: fullTitle(stop.entry) })).toBeVisible()
    }
  })

  it('punches the chosen card into the destination readout', () => {
    const observers = stubIntersectionObserver()
    const { container } = render(<TimeCircuitsScene />)
    act(() => observers[0]?.trigger(container.querySelector('.scene--circuits')!, true, 1))

    // A role that is not the default, so the change is actually observable.
    const target = timeline[2]!
    const card = screen.getByRole('button', { name: fullTitle(target.entry) })
    act(() => card.click())

    const destination = container.querySelector('.circuits__row--destination')!
    expect(destination.querySelector(`[data-display="${target.year}"]`)).not.toBeNull()
  })
})
