import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, render, screen, cleanup } from '@testing-library/react'
import BusinessCard from './BusinessCard'
import { card } from '../data/card'
import { stubIntersectionObserver, stubMatchMedia } from '../test/setup'

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  stubMatchMedia(false)
})

describe('BusinessCard', () => {
  it('prints every field from the data file rather than hardcoded copy', () => {
    render(<BusinessCard />)

    expect(screen.getByRole('heading', { level: 1, name: card.name })).toBeInTheDocument()
    expect(screen.getByText(card.role)).toBeInTheDocument()
    expect(screen.getByText(card.affiliation.name)).toBeInTheDocument()
    expect(screen.getByText(card.affiliation.detail)).toBeInTheDocument()
    expect(screen.getByText(card.phone.label)).toBeInTheDocument()
    expect(screen.getByText(card.email.label)).toBeInTheDocument()
    // Flattened: the footer is columns of stacked lines, and every line prints.
    for (const field of card.footer.flat()) {
      expect(screen.getByText(field.label)).toBeInTheDocument()
    }
  })

  it('makes the phone dialable and the email sendable', () => {
    render(<BusinessCard />)

    expect(screen.getByRole('link', { name: card.phone.label })).toHaveAttribute(
      'href',
      card.phone.href,
    )
    expect(screen.getByRole('link', { name: card.email.label })).toHaveAttribute(
      'href',
      card.email.href,
    )
    expect(card.phone.href?.startsWith('tel:')).toBe(true)
    expect(card.email.href?.startsWith('mailto:')).toBe(true)
  })

  it('links every footer field that has a destination and leaves the rest as ink', () => {
    render(<BusinessCard />)

    for (const field of card.footer.flat()) {
      const node = screen.getByText(field.label)
      if (field.href === null) {
        expect(node.tagName).toBe('SPAN')
      } else {
        expect(node.tagName).toBe('A')
        expect(node).toHaveAttribute('href', field.href)
      }
    }
  })

  it('opens outbound links safely in a new tab', () => {
    render(<BusinessCard />)

    // The résumé counts too: it is same-origin but still takes the visitor away
    // from a single-page site, so it opens in its own tab.
    for (const field of card.footer.flat()) {
      if (field.href?.startsWith('http') || field.href?.endsWith('.pdf')) {
        const link = screen.getByRole('link', { name: field.label })
        expect(link).toHaveAttribute('target', '_blank')
        expect(link.getAttribute('rel')).toContain('noopener')
      }
    }
  })

  it('hides the decorative paper layers from assistive technology', () => {
    const { container } = render(<BusinessCard />)

    for (const cls of ['.card__grain', '.card__specular', '.blood']) {
      expect(container.querySelector(cls)).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('separates the hand path from its velocity-driven motion blur', () => {
    const { container } = render(<BusinessCard />)
    const hand = container.querySelector('.card-handoff-hand')

    expect(hand).toHaveAttribute('aria-hidden', 'true')
    expect(hand?.querySelector('.card-handoff-hand__image')).not.toBeNull()
  })

  it('lands the blood under the name, inside the card face', () => {
    const { container } = render(<BusinessCard />)
    const blood = container.querySelector('.blood')!
    const identity = container.querySelector('.card__identity')!

    // Anchored to the identity block so it tracks the name rather than the
    // card edge, and clipped by the card like every other printed layer.
    expect(identity.contains(blood)).toBe(true)
    expect(container.querySelector('.card')!.contains(blood)).toBe(true)
    // Carries both stages: the falling drop and the pool it becomes.
    expect(blood.querySelector('.blood__drip')).not.toBeNull()
    expect(blood.querySelector('.blood__pool')).not.toBeNull()
  })

  it('drives the tilt through CSS custom properties, not React state', async () => {
    const { container } = render(<BusinessCard />)
    const wrapper = container.querySelector<HTMLElement>('.card-drop')
    expect(wrapper).not.toBeNull()

    await nextFrame()
    await nextFrame()

    // Written straight to the node by the rAF loop. If these were React state
    // the component would re-render on every pointer move.
    expect(wrapper!.style.getPropertyValue('--rx')).toMatch(/deg$/)
    expect(wrapper!.style.getPropertyValue('--mx')).toMatch(/%$/)
  })

  it('parks its animation loop offscreen and restarts when the card returns', () => {
    const observers = stubIntersectionObserver()
    const callbacks = new Map<number, FrameRequestCallback>()
    let nextId = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      const id = ++nextId
      callbacks.set(id, callback)
      return id
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      callbacks.delete(id)
    })
    const flushFrame = (now: number) => {
      const pending = [...callbacks.values()]
      callbacks.clear()
      pending.forEach((callback) => callback(now))
    }

    const { container } = render(<BusinessCard />)
    const wrapper = container.querySelector<HTMLElement>('.card-drop')!
    expect(callbacks.size).toBe(1)

    act(() => observers[0]?.trigger(wrapper, false, 0))
    act(() => flushFrame(16))
    expect(callbacks.size).toBe(0)
    expect(wrapper.style.getPropertyValue('--rx')).toBe('')

    act(() => observers[0]?.trigger(wrapper, true, 1))
    expect(callbacks.size).toBe(1)
    act(() => flushFrame(32))
    expect(wrapper.style.getPropertyValue('--rx')).toMatch(/deg$/)
    expect(callbacks.size).toBe(1)
  })

  it('casts the shadow with real planes, not a box-shadow', async () => {
    const { container } = render(<BusinessCard />)
    const wrapper = container.querySelector<HTMLElement>('.card-drop')!
    const planes = container.querySelectorAll('.card-shadow')

    /*
     * A box-shadow is painted from an axis-aligned border box, so it stays a
     * rectangle however the card is rotated, while the card projects to a
     * trapezoid. That silhouette mismatch is what made the shadow read as flat.
     * The shadow must therefore be geometry that shares the card's rotation.
     */
    expect(planes.length).toBeGreaterThanOrEqual(2)
    for (const plane of planes) {
      expect(plane).toHaveAttribute('aria-hidden', 'true')
      // Siblings of .card, so they inherit --rx/--ry from the same wrapper.
      expect(plane.parentElement).toBe(wrapper)
    }
    expect(container.querySelector('.card')!.parentElement).toBe(wrapper)
  })

  it('leaves the card completely still under prefers-reduced-motion', async () => {
    stubMatchMedia(true)
    const { container } = render(<BusinessCard />)
    const wrapper = container.querySelector<HTMLElement>('.card-drop')

    await nextFrame()
    await nextFrame()

    // No loop started, so nothing was ever written.
    expect(wrapper!.style.getPropertyValue('--rx')).toBe('')
    expect(wrapper!.style.getPropertyValue('--mx')).toBe('')

  })
})
