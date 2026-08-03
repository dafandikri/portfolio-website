import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { timeline } from '../../data/timeline'
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
    expect(screen.queryByText(timeline[0]!.entry.title)).not.toBeInTheDocument()
    expect(observers[0]?.rootMargin).toBe('0px 0px -12%')

    act(() => observers[0]?.trigger(scene, true, 1))
    for (const stop of timeline) {
      expect(screen.getByText(stop.entry.title)).toBeInTheDocument()
    }
  })

  it('selects the most visible role as the destination', () => {
    const observers = stubIntersectionObserver()
    const { container } = render(<TimeCircuitsScene />)
    const scene = container.querySelector('.scene--circuits')!
    act(() => observers[0]?.trigger(scene, true, 1))

    const stops = [...container.querySelectorAll<HTMLElement>('.circuits-stop')]
    const roleObserver = observers[1]!
    act(() => {
      stops.forEach((stop, index) => roleObserver.trigger(stop, index === 2, index === 2 ? 1 : 0))
    })

    expect(stops[2]).toHaveClass('is-active')
    const destination = container.querySelector('.circuits__row--destination')!
    expect(destination.querySelector(`[data-display="${timeline[2]!.year}"]`)).not.toBeNull()
  })
})
