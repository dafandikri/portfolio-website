import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react'
import BusinessCard from './BusinessCard'
import { card } from '../data/card'
import { stubIntersectionObserver, stubMatchMedia } from '../test/setup'

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

function loadOpeningAssets(container: HTMLElement) {
  const images = container.querySelectorAll<HTMLImageElement>(
    '.stage__backdrop, .card-handoff-hand__image',
  )
  act(() => images.forEach((image) => fireEvent.load(image)))
}

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
    expect(screen.getByText(card.linkedin.label)).toBeInTheDocument()
    expect(screen.getByText(card.email.label)).toBeInTheDocument()
    // Flattened: the footer is columns of stacked lines, and every line prints.
    for (const field of card.footer.flat()) {
      expect(screen.getByText(field.label)).toBeInTheDocument()
    }
  })

  it('makes the LinkedIn profile reachable and the email sendable', () => {
    render(<BusinessCard />)

    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      card.linkedin.href,
    )
    expect(screen.getByRole('link', { name: 'dafandikri@gmail.com' })).toHaveAttribute(
      'href',
      card.email.href,
    )
    expect(card.linkedin.href?.startsWith('https://www.linkedin.com/in/')).toBe(true)
    expect(card.email.href?.startsWith('mailto:')).toBe(true)
  })

  it('offers GitHub instead of linking the current site back to itself', () => {
    render(<BusinessCard />)

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/dafandikri',
    )
    expect(screen.queryByRole('link', { name: 'dafandikri.dev' })).not.toBeInTheDocument()
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

  it('starts every opening beat only after its photographic layers are ready', () => {
    const onReady = vi.fn()
    const { container } = render(<BusinessCard onReady={onReady} />)
    const stage = container.querySelector('.stage')!

    expect(stage).toHaveAttribute('aria-busy', 'true')
    expect(stage).not.toHaveClass('stage--ready')
    expect(onReady).not.toHaveBeenCalled()

    loadOpeningAssets(container)

    expect(stage).toHaveAttribute('aria-busy', 'false')
    expect(stage).toHaveClass('stage--ready')
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('retires the delivery animation layer after the card lands', () => {
    const { container } = render(<BusinessCard />)
    const delivery = container.querySelector('.card-delivery')!
    loadOpeningAssets(container)

    expect(delivery).not.toHaveClass('card-delivery--landed')
    const animationEnd = new Event('webkitAnimationEnd', { bubbles: true })
    Object.defineProperty(animationEnd, 'animationName', { value: 'card-delivery-arrive' })
    fireEvent(delivery, animationEnd)
    expect(delivery).toHaveClass('card-delivery--landed')
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
    const stage = container.querySelector<HTMLElement>('.stage')
    expect(stage).not.toBeNull()
    loadOpeningAssets(container)

    await nextFrame()
    await nextFrame()

    // Written straight to the node by the rAF loop. If these were React state
    // the component would re-render on every pointer move.
    expect(stage!.style.getPropertyValue('--deg')).toMatch(/deg$/)
    expect(stage!.style.getPropertyValue('--ax')).not.toBe('')
    expect(stage!.style.getPropertyValue('--mx')).toMatch(/%$/)
  })

  it('publishes the tilt where the ground under the card can read it', async () => {
    const { container } = render(<BusinessCard />)
    const stage = container.querySelector<HTMLElement>('.stage')!
    const backdrop = container.querySelector<HTMLElement>('.stage__backdrop')!
    loadOpeningAssets(container)

    await nextFrame()
    await nextFrame()

    /*
     * The desk parallaxes off --mx/--my in CSS. Custom properties inherit
     * downward only, so publishing them on the card — which is the backdrop's
     * sibling, not its ancestor — would leave the ground unable to see the tilt
     * however correct the maths was.
     */
    expect(stage.contains(backdrop)).toBe(true)
    expect(stage.style.getPropertyValue('--my')).toMatch(/%$/)
    // And nothing is written on the card itself, which would be dead weight.
    expect(container.querySelector<HTMLElement>('.card-drop')!.style.getPropertyValue('--mx')).toBe(
      '',
    )
  })

  it('holds the hit pose while every native card link is activated', async () => {
    const { container } = render(<BusinessCard />)
    const stage = container.querySelector<HTMLElement>('.stage')!
    const wrapper = container.querySelector<HTMLElement>('.card-drop')!
    const links = [...container.querySelectorAll<HTMLAnchorElement>('a.card__meta')]
    loadOpeningAssets(container)

    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      toJSON: () => ({}),
    })
    fireEvent.pointerMove(wrapper, { clientX: 100, clientY: 100 })

    await nextFrame()
    await nextFrame()

    const hitPose = stage.style.getPropertyValue('--card-transform')
    expect(hitPose).not.toBe('none')

    expect(links).toHaveLength(4)
    for (const link of links) {
      const clicked = vi.fn((event: MouseEvent) => event.preventDefault())
      link.addEventListener('click', clicked)

      fireEvent.pointerOver(link)
      expect(stage.style.getPropertyValue('--card-transform')).toBe(hitPose)

      fireEvent.pointerDown(link)
      fireEvent.pointerUp(link)
      expect(stage.style.getPropertyValue('--card-transform')).toBe(hitPose)
      fireEvent.click(link)
      expect(clicked).toHaveBeenCalledTimes(1)

      link.removeEventListener('click', clicked)
    }
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
    // Observed on the card, published on the stage: visibility is a question
    // about the card, not about the scene wrapped around it.
    const wrapper = container.querySelector<HTMLElement>('.card-drop')!
    const stage = container.querySelector<HTMLElement>('.stage')!
    loadOpeningAssets(container)
    expect(callbacks.size).toBe(1)

    act(() => observers[0]?.trigger(wrapper, false, 0))
    act(() => flushFrame(16))
    expect(callbacks.size).toBe(0)
    expect(stage.style.getPropertyValue('--deg')).toBe('')

    act(() => observers[0]?.trigger(wrapper, true, 1))
    expect(callbacks.size).toBe(1)
    act(() => flushFrame(32))
    expect(stage.style.getPropertyValue('--deg')).toMatch(/deg$/)
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
      // Siblings of .card, so the same --ax/--ay/--deg reach all three.
      expect(plane.parentElement).toBe(wrapper)
    }
    expect(container.querySelector('.card')!.parentElement).toBe(wrapper)
  })

  it('leaves the card and the ground under it completely still under prefers-reduced-motion', async () => {
    stubMatchMedia(true)
    const { container } = render(<BusinessCard />)
    const stage = container.querySelector<HTMLElement>('.stage')!

    await nextFrame()
    await nextFrame()

    // No loop started, so nothing was ever written. That is also what stops the
    // ground parallaxing: with no --mx/--my published, the desk's transform
    // falls back to its own centre and the scene holds perfectly still.
    expect(stage.style.getPropertyValue('--deg')).toBe('')
    expect(stage.style.getPropertyValue('--mx')).toBe('')
    expect(stage.style.getPropertyValue('--my')).toBe('')
  })
})
