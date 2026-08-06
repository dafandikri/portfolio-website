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
    expect(container.querySelector('.circuits-scene__jungle-handoff')).not.toBeNull()
    // The deck is the below-fold cost; none of it should exist yet.
    expect(container.querySelectorAll('.deck__card')).toHaveLength(0)
    expect(observers[0]?.rootMargin).toBe('0px 0px -12%')

    act(() => observers[0]?.trigger(scene, true, 1))
    expect(container.querySelectorAll('.deck__card')).toHaveLength(timeline.length)
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
